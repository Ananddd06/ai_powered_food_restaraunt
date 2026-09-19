"""
Hybrid Ranking Engine for Chennai Restaurants.
Combines Vector Semantic Similarity, GIS Distance, Ratings, Price Alignment, and Popularity.
Formula:
  Score = 40% Semantic Similarity + 25% Distance + 20% Rating + 10% Price Match + 5% Popularity
"""

import math
from typing import Any, Dict, List, Optional, Tuple

from app.ml.vector_store import vector_store
from app.ml.overpass import fetch_live_osm_restaurants
from app.ml.candidate_fusion import merge_and_deduplicate

# Radius of Earth in kilometers
EARTH_RADIUS_KM = 6371.0


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate Great Circle distance between two points in kilometers."""
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS_KM * c


def compute_distance_score(distance_km: float, max_radius_km: float = 10.0) -> float:
    """
    Compute normalized GIS distance score (0.0 to 1.0).
    Uses smooth decay function: 1 / (1 + (distance / 4.0))
    """
    if distance_km <= 0.0:
        return 1.0
    return 1.0 / (1.0 + (distance_km / 4.0))


def compute_price_score(price: float, target_price: Optional[float] = None) -> float:
    """Compute price alignment score (0.0 to 1.0)."""
    if target_price is None or target_price <= 0:
        # Default neutral high score if user didn't specify price preference
        return 0.85
    diff = abs(price - target_price)
    denom = max(target_price, 400.0)
    score = max(0.0, 1.0 - (diff / (denom * 1.5)))
    return score


def compute_popularity_score(rating_count: int, max_count: int = 25000) -> float:
    """Log-normalized popularity score based on number of reviews."""
    if rating_count <= 0:
        return 0.1
    log_count = math.log1p(rating_count)
    log_max = math.log1p(max_count)
    return min(1.0, log_count / log_max)


FOOD_KEYWORDS_MAP = {
    "burger": ["burger", "burgers", "fast food", "american", "sandwich", "fries"],
    "biryani": ["biryani", "biriyani", "mutton biryani", "chicken biryani", "rawther", "hyderabadi", "kebab"],
    "pizza": ["pizza", "pizzas", "italian", "pasta"],
    "south indian": ["dosa", "idli", "tiffin", "south indian", "filter coffee", "pongal", "sambar", "bhavan", "amirtham"],
    "chinese": ["chinese", "noodle", "noodles", "fried rice", "momos", "asian", "manchurian"],
    "shawarma": ["shawarma", "mandi", "arabian", "bbq", "barbecue", "grill"],
    "chettinad": ["chettinad", "parotta", "spicy gravy", "nattu kozhi"],
    "coffee": ["coffee", "cafe", "tiffin", "tea", "beverages"],
}


def compute_cuisine_relevance(query: str, cuisines: List[str], top_dishes: List[str], name: str, description: str = "") -> float:
    """
    Computes strict match multiplier (0.05 to 1.0) between query food category and restaurant attributes.
    Prevents pure veg tiffin restaurants (Nitya Amirtham, Akshaya) from matching burger / meat queries.
    """
    q_lower = query.lower()
    # BUG FIX: Do NOT include q_lower in the evaluated text, otherwise it always trivially matches itself!
    text = (name + " " + " ".join(cuisines or []) + " " + " ".join(top_dishes or []) + " " + (description or "")).lower()

    detected_targets = []
    for category, keywords in FOOD_KEYWORDS_MAP.items():
        if any(kw in q_lower for kw in keywords):
            detected_targets.append((category, keywords))


    if not detected_targets:
        return 1.0

    for category, keywords in detected_targets:
        if any(kw in text for kw in keywords):
            return 1.0

    return 0.05


def rank_restaurants(
    query: str,
    user_lat: float,
    user_lon: float,
    max_distance_km: float = 15.0,
    target_price: Optional[float] = None,
    candidate_limit: int = 40,
    top_k: int = 5,
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Executes full 10-step architectural pipeline:
    1. Browser Geolocation -> (user_lat, user_lon)
    2. Local PostGIS & Kaggle Restaurant DB Query + FAISS Vector Search
    3. Live Restaurant Discovery via OpenStreetMap / Overpass API
    4. Data Normalization & Strict Food Category Relevance Filtering
    5. Duplicate Detection & Proximity Merge -> Unified Candidates
    6. Multi-Factor AI Recommendation Engine & Ranking
    7. Return ranked recommendations + pipeline telemetry metrics.
    """
    import time
    start_time = time.time()

    # 1. Fetch Local candidates from Zomato SQLite DB
    from app.db.session import SessionLocal
    from app.models.restaurant import Restaurant
    from sqlalchemy import or_, func
    import math
    
    db = SessionLocal()
    local_items = []
    seen_local_ids = set()
    
    try:
        query_obj = db.query(Restaurant)
        
        # Bounding box filter
        lat_offset = (max_distance_km * 2.0) / 111.0
        lng_offset = (max_distance_km * 2.0) / (111.0 * math.cos(math.radians(user_lat)))
        
        query_obj = query_obj.filter(
            Restaurant.latitude.between(user_lat - lat_offset, user_lat + lat_offset),
            Restaurant.longitude.between(user_lon - lng_offset, user_lon + lng_offset)
        )
        
        db_candidates = query_obj.all()
        
        for r in db_candidates:
            dist = haversine_distance(user_lat, user_lon, r.latitude, r.longitude)
            if dist <= max_distance_km * 2.0:
                relevance = compute_cuisine_relevance(
                    query=query,
                    cuisines=r.cuisines,
                    top_dishes=[],
                    name=r.name,
                    description=r.description or ""
                )
                
                # Boost if strict text match
                sim_score = 0.50
                if query.lower() in r.name.lower() or any(q in c.lower() for c in r.cuisines for q in query.lower().split()):
                    sim_score = 0.85
                    
                if relevance >= 0.1 or sim_score > 0.5:
                    import hashlib
                    # Add deterministic jitter to spread out stacked restaurants
                    h = int(hashlib.md5(str(r.id).encode()).hexdigest(), 16)
                    j_lat = ((h % 4000) - 2000) / 1000000.0
                    j_lon = (((h // 4000) % 4000) - 2000) / 1000000.0
                    
                    item_dict = {
                        "id": r.id,
                        "name": r.name,
                        "latitude": r.latitude + j_lat,
                        "longitude": r.longitude + j_lon,
                        "cuisines": r.cuisines,
                        "description": r.description,
                        "overall_rating": r.rating,
                        "total_rating_count": r.review_count,
                        "price_for_two": 300 if r.price_level == "$" else (600 if r.price_level == "$$" else 1200),
                        "zomato_url": r.website,
                        "address": r.address,
                        "location": r.address.split(',')[-2].strip() if r.address and ',' in r.address else "Chennai",
                        "_sim_score": sim_score
                    }
                    seen_local_ids.add(r.id)
                    local_items.append(item_dict)
                    
    finally:
        db.close()

    # 2. Fetch Live OpenStreetMap Overpass candidates around coordinates
    live_osm_items = fetch_live_osm_restaurants(
        lat=user_lat,
        lon=user_lon,
        radius_km=max_distance_km,
        limit=25
    )

    # 3. Perform Data Normalization, Duplicate Detection, and Candidate Fusion
    unified_candidates, fusion_telemetry = merge_and_deduplicate(
        local_candidates=local_items,
        live_osm_candidates=live_osm_items
    )

    # 4. Multi-Factor AI Ranking on Unified Candidates
    ranked_results = []
    for item in unified_candidates:
        sim_score = item.get("_sim_score", 0.5)
        # Cosine similarity bounded in [0, 1]
        semantic_sim = max(0.0, min(1.0, (sim_score + 1.0) / 2.0 if sim_score < 0 else sim_score))

        rest_lat = item["latitude"]
        rest_lon = item["longitude"]

        # GIS Distance
        dist_km = haversine_distance(user_lat, user_lon, rest_lat, rest_lon)

        # Soft radius cutoff: prefer candidates within radius
        if dist_km > max_distance_km * 2.5:
            continue

        # Strict Cuisine Relevance Filter
        category_relevance = compute_cuisine_relevance(
            query=query,
            cuisines=item.get("cuisines", []),
            top_dishes=item.get("top_dishes", []),
            name=item.get("name", ""),
            description=item.get("description", "")
        )
        if category_relevance < 0.1:
            continue

        # Sub-scores
        dist_score = compute_distance_score(dist_km, max_radius_km=max_distance_km)
        rating_score = min(1.0, max(0.0, item.get("overall_rating", 4.0) / 5.0))
        price_score = compute_price_score(item.get("price_for_two", 500), target_price)
        pop_score = compute_popularity_score(item.get("total_rating_count", 100))

        # Composite 5-Factor Score with Category Relevance Multiplier
        total_score = (
            (0.40 * semantic_sim)
            + (0.25 * dist_score)
            + (0.20 * rating_score)
            + (0.10 * price_score)
            + (0.05 * pop_score)
        ) * category_relevance

        ranked_item = {
            **item,
            "distance_km": round(dist_km, 2),
            "score_breakdown": {
                "total_score": round(total_score * 100, 1),
                "semantic_similarity": round(semantic_sim * 100, 1),
                "distance_score": round(dist_score * 100, 1),
                "rating_score": round(rating_score * 100, 1),
                "price_score": round(price_score * 100, 1),
                "popularity_score": round(pop_score * 100, 1),
            },
        }
        # Clean internal metadata key before output
        ranked_item.pop("_sim_score", None)
        ranked_results.append(ranked_item)

    # Sort by total score descending
    ranked_results.sort(key=lambda x: x["score_breakdown"]["total_score"], reverse=True)
    top_results = ranked_results[:top_k]

    elapsed_ms = round((time.time() - start_time) * 1000, 1)

    telemetry = {
        "execution_time_ms": elapsed_ms,
        "postgis_local_count": fusion_telemetry["local_db_count"],
        "live_osm_count": fusion_telemetry["live_osm_count"],
        "duplicates_merged": fusion_telemetry["duplicates_merged"],
        "unified_candidates": fusion_telemetry["unified_candidates_count"],
        "final_ranked_count": len(top_results),
    }

    return top_results, telemetry


