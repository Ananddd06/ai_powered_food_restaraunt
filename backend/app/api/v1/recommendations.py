"""
FastAPI Router for Chennai GIS Restaurant Recommendations and AI Explanations.
Includes Database TTL Caching & User History Refreshing.
"""

import hashlib
import json
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.recommendation_cache import RecommendationCache
from app.ml.chennai_geocoding import (
    CHENNAI_CENTER,
    get_all_localities,
    get_locality_coordinates,
)
from app.ml.explainer import explainer
from app.ml.ranker import rank_restaurants

from app.core.email import send_location_sharing_email

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


class RecommendationRequest(BaseModel):
    query: str = Field(..., example="I want an affordable South Indian restaurant near T. Nagar")
    location_name: Optional[str] = Field(None, example="T. Nagar")
    user_lat: Optional[float] = Field(None, example=13.0418)
    user_lon: Optional[float] = Field(None, example=80.2341)
    max_distance_km: float = Field(15.0, ge=1.0, le=50.0)
    target_price: Optional[float] = Field(None, example=500.0)
    top_k: int = Field(5, ge=1, le=20)
    user_id: Optional[str] = Field(None, example="user_123")


class DetectLocationRequest(BaseModel):
    latitude: float
    longitude: float


class GPSNotificationRequest(BaseModel):
    recipient_email: str
    user_email: Optional[str] = None
    latitude: float
    longitude: float
    locality_name: Optional[str] = "Chennai"


class LocalityResponse(BaseModel):
    name: str
    latitude: float
    longitude: float


def compute_cache_key(payload: RecommendationRequest) -> str:
    """Generates unique SHA256 cache key for query & location parameters."""
    raw = (
        f"{payload.user_id or 'anon'}:{payload.query.lower().strip()}:"
        f"{payload.location_name or ''}:{payload.user_lat or ''}:{payload.user_lon or ''}:"
        f"{payload.max_distance_km}:{payload.target_price or ''}:{payload.top_k}"
    )
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


@router.post("/notify-gps")
def notify_gps_permission(payload: GPSNotificationRequest):
    """Dispatches location sharing email notification to recipient address when GPS permission is granted."""
    try:
        send_location_sharing_email(
            to_email=payload.recipient_email,
            user_email=payload.user_email,
            latitude=payload.latitude,
            longitude=payload.longitude,
            locality_name=payload.locality_name or "Chennai"
        )
        return {
            "status": "success",
            "message": f"GPS location authorization email dispatched to {payload.recipient_email}",
            "recipient": payload.recipient_email,
            "coordinates": {"lat": payload.latitude, "lon": payload.longitude}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to dispatch email: {str(e)}")


@router.post("/detect-location")
def detect_nearest_location(payload: DetectLocationRequest):
    """Resolves browser GPS coordinates to the nearest Chennai locality."""
    from app.ml.chennai_geocoding import find_nearest_locality
    locality_name, dist = find_nearest_locality(payload.latitude, payload.longitude)
    return {
        "locality": locality_name,
        "distance_to_center_km": dist,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
    }


@router.get("/localities", response_model=List[LocalityResponse])
def get_chennai_localities():
    """Returns list of pre-configured Chennai localities with GIS coordinates."""
    localities = get_all_localities()
    return [
        LocalityResponse(name=loc, latitude=coords[0], longitude=coords[1])
        for loc, coords in sorted(localities.items(), key=lambda x: x[0])
    ]


@router.get("/latest-cache")
def get_latest_cached_recommendations(
    user_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Retrieves the signed-in user's latest unexpired recommendation search from Database TTL Cache.
    Used on page refresh.
    """
    now = datetime.utcnow()
    cache_item = (
        db.query(RecommendationCache)
        .filter(RecommendationCache.user_id == user_id, RecommendationCache.expires_at > now)
        .order_by(RecommendationCache.created_at.desc())
        .first()
    )

    if not cache_item:
        return {"cached": False, "message": "No active TTL cache found for user."}

    return {
        "cached": True,
        "cache_created_at": cache_item.created_at.isoformat() if cache_item.created_at else None,
        "cache_expires_at": cache_item.expires_at.isoformat() if cache_item.expires_at else None,
        "data": cache_item.response_data,
    }


@router.get("/history")
def get_user_history(
    user_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Retrieves the signed-in user's past recommendation searches for the History tab.
    """
    history_items = (
        db.query(RecommendationCache)
        .filter(RecommendationCache.user_id == user_id)
        .order_by(RecommendationCache.created_at.desc())
        .limit(50)
        .all()
    )

    results = []
    for item in history_items:
        try:
            telemetry = item.response_data.get("pipeline_telemetry", {})
            recs = item.response_data.get("recommendations", [])
            top_match = recs[0].get("name", "No matches") if recs else "No matches"
            top_match_score = recs[0].get("score_breakdown", {}).get("total_score", 0) if recs else 0
            
            results.append({
                "id": item.id,
                "timestamp": item.created_at.isoformat() if item.created_at else None,
                "query": item.query,
                "location": item.location_name or "Chennai",
                "radius_km": telemetry.get("radius_km", telemetry.get("max_distance_km", 15.0)),
                "total_results": item.response_data.get("total_results", 0),
                "top_match": f"{top_match} ({top_match_score}% Match)" if top_match_score else top_match,
            })
        except Exception:
            pass

    return {"history": results}


@router.post("/search")
def get_recommendations(
    payload: RecommendationRequest,
    db: Session = Depends(get_db)
):
    """
    Search and rank Chennai restaurants using full 10-step pipeline:
    - PostGIS / Database TTL Cache lookup
    - OpenStreetMap Live Overpass Discovery
    - Data Normalization & Duplicate Detection Merging
    - 5-factor hybrid score (Semantic 40%, Distance 25%, Rating 20%, Price 10%, Popularity 5%)
    - Hugging Face Qwen LLM explanation
    """
    query = payload.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")

    # 1. Check Database TTL Cache
    cache_key = compute_cache_key(payload)
    now = datetime.utcnow()

    existing_cache = (
        db.query(RecommendationCache)
        .filter(RecommendationCache.cache_key == cache_key, RecommendationCache.expires_at > now)
        .first()
    )

    if existing_cache:
        print(f"Serving recommendations from Database TTL Cache (Key: {cache_key[:8]}...)")
        cached_resp = existing_cache.response_data
        cached_resp["served_from_cache"] = True
        return cached_resp

    # 2. Determine user coordinates
    user_lat = payload.user_lat
    user_lon = payload.user_lon
    resolved_location_name = payload.location_name or "Chennai"

    if user_lat is None or user_lon is None:
        if payload.location_name:
            user_lat, user_lon = get_locality_coordinates(payload.location_name)
        else:
            # Try parsing locality name from user query string
            localities = get_all_localities()
            found_loc = None
            query_lower = query.lower()
            for loc in localities:
                if loc.lower() in query_lower:
                    found_loc = loc
                    break
            if found_loc:
                resolved_location_name = found_loc
                user_lat, user_lon = localities[found_loc]
            else:
                user_lat, user_lon = CHENNAI_CENTER

    # 3. Perform candidate fusion & hybrid ranking
    try:
        top_restaurants, telemetry = rank_restaurants(
            query=query,
            user_lat=user_lat,
            user_lon=user_lon,
            max_distance_km=payload.max_distance_km,
            target_price=payload.target_price,
            candidate_limit=40,
            top_k=payload.top_k,
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Ranking pipeline error: {str(e)}")

    # 4. Generate Hugging Face Qwen AI explanations
    try:
        top_restaurants_with_explanations = explainer.explain_recommendations(
            query=query,
            restaurants=top_restaurants,
            location_context=resolved_location_name,
        )
    except Exception as e:
        print(f"Warning: Explanation generator error: {e}")
        top_restaurants_with_explanations = top_restaurants

    response_payload = {
        "query": query,
        "user_location": {
            "name": resolved_location_name,
            "latitude": user_lat,
            "longitude": user_lon,
        },
        "total_results": len(top_restaurants_with_explanations),
        "recommendations": top_restaurants_with_explanations,
        "pipeline_telemetry": telemetry,
        "served_from_cache": False,
    }

    # 5. Store in Database TTL Cache (1 hour TTL)
    try:
        ttl_expiration = RecommendationCache.create_expiration(ttl_seconds=3600)
        cache_entry = RecommendationCache(
            cache_key=cache_key,
            user_id=payload.user_id,
            query=query,
            location_name=resolved_location_name,
            user_lat=user_lat,
            user_lon=user_lon,
            response_data=response_payload,
            expires_at=ttl_expiration,
        )
        db.add(cache_entry)
        db.commit()
        print(f"Saved fresh search result to Database TTL Cache (Expires in 1 hour).")
    except Exception as db_err:
        db.rollback()
        import traceback
        print(f"Warning: Failed to save DB cache: {db_err}")
        traceback.print_exc()

    return response_payload

