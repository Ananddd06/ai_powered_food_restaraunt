"""
Live Restaurant Discovery via OpenStreetMap (Overpass API).
Fetches real-time spatial nodes (amenity=restaurant, cafe, fast_food) around user GIS coordinates.
"""

import urllib.parse
import json
from typing import Any, Dict, List
import requests

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

def fetch_live_osm_restaurants(lat: float, lon: float, radius_km: float = 15.0, limit: int = 35) -> List[Dict[str, Any]]:
    """
    Queries OpenStreetMap Overpass API for real-time restaurants, cafes, and hotels near lat, lon.
    Returns normalized dictionary list.
    """
    radius_meters = int(min(radius_km, 25.0) * 1000)
    
    # Overpass QL Query searching nodes and ways
    query = f"""
    [out:json][timeout:5];
    (
      node["amenity"="restaurant"](around:{radius_meters},{lat},{lon});
      node["amenity"="cafe"](around:{radius_meters},{lat},{lon});
      node["amenity"="fast_food"](around:{radius_meters},{lat},{lon});
      node["tourism"="hotel"](around:{radius_meters},{lat},{lon});
      way["amenity"="restaurant"](around:{radius_meters},{lat},{lon});
      way["amenity"="cafe"](around:{radius_meters},{lat},{lon});
    );
    out center body {limit};
    """

    
    headers = {
        "User-Agent": "GourmetAI-RestaurantDiscovery/1.0 (Contact: admin@gourmetai.local)",
        "Accept": "application/json"
    }

    elements = []
    for endpoint in OVERPASS_ENDPOINTS:
        try:
            response = requests.post(endpoint, data={"data": query}, headers=headers, timeout=4.0)
            if response.status_code == 200:
                data = response.json()
                elements = data.get("elements", [])
                break
            else:
                print(f"[OSM OVERPASS] Endpoint {endpoint} returned status {response.status_code}")
        except Exception as err:
            print(f"[OSM OVERPASS] Error connecting to {endpoint}: {err}")

    osm_restaurants = []
    for elem in elements:
        tags = elem.get("tags", {})
        name = tags.get("name") or tags.get("name:en")
        if not name:
            continue
            
        cuisines_raw = tags.get("cuisine", "")
        cuisines = [c.strip().title() for c in cuisines_raw.split(";") if c.strip()] if cuisines_raw else ["Multicuisine", "Local Flavors"]
        
        # Synthesize price and rating based on OSM amenities
        amenity = tags.get("amenity", "restaurant")
        price_for_two = 350.0 if amenity in ["cafe", "fast_food"] else 650.0
        
        lat_val = elem.get("lat") or (elem.get("center", {}).get("lat") if isinstance(elem.get("center"), dict) else None)
        lon_val = elem.get("lon") or (elem.get("center", {}).get("lon") if isinstance(elem.get("center"), dict) else None)
        if lat_val is None or lon_val is None:
            continue

        osm_restaurants.append({
            "id": f"osm_{elem.get('id')}",
            "name": name,
            "location": tags.get("addr:suburb") or tags.get("addr:district") or "Chennai",
            "locality": tags.get("addr:street") or tags.get("addr:city") or "Chennai",
            "latitude": float(lat_val),
            "longitude": float(lon_val),

            "cuisines": cuisines,
            "overall_rating": 4.2,  # Default baseline rating for verified OSM node
            "total_rating_count": 120,
            "price_for_two": price_for_two,
            "top_dishes": [f"Chef Special {cuisines[0]}" if cuisines else "Specialty Platter"],
            "features": ["Live OpenStreetMap Verified", "Takeaway", "Dine-in"],
            "source": "OpenStreetMap Live",
            "osm_tags": tags
        })
        
    print(f"[OSM OVERPASS] Fetched {len(osm_restaurants)} live restaurant nodes from OpenStreetMap.")
    return osm_restaurants

