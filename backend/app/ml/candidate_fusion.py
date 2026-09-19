"""
Candidate Fusion, Data Normalization, and Duplicate Detection Engine.
Combines Local DB (Kaggle + PostGIS) candidates with Live OpenStreetMap discovery candidates.
Implements spatial proximity & fuzzy text duplicate detection and merging into Unified Candidates.
"""

import math
import re
from typing import Any, Dict, List, Tuple

def normalize_name(name: str) -> str:
    """Normalize restaurant name for duplicate matching."""
    name_clean = name.lower()
    name_clean = re.sub(r"[^\w\s]", "", name_clean)
    name_clean = re.sub(r"\b(restaurant|restro|cafe|hotel|dhaba|bhavan|tiffin|mess)\b", "", name_clean)
    return " ".join(name_clean.split())

def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine distance in meters."""
    R = 6371000.0  # Earth radius in meters
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def merge_and_deduplicate(
    local_candidates: List[Dict[str, Any]],
    live_osm_candidates: List[Dict[str, Any]]
) -> Tuple[List[Dict[str, Any]], Dict[str, int]]:
    """
    Fuses local PostGIS/Kaggle dataset candidates with live OpenStreetMap candidates.
    Performs normalized duplicate detection (<100m proximity & string similarity match).
    Returns (unified_candidates, fusion_telemetry).
    """
    unified_map: Dict[str, Dict[str, Any]] = {}
    duplicates_count = 0
    
    # 1. Add all local candidates
    for item in local_candidates:
        key = item.get("id") or f"local_{item.get('name')}_{item.get('latitude')}"
        record = dict(item)
        record["source"] = record.get("source", "Local DB (Kaggle + PostGIS)")
        record["is_live_verified"] = False
        unified_map[key] = record
        
    # 2. Check each live OSM candidate against existing unified candidates
    for osm_item in live_osm_candidates:
        osm_norm_name = normalize_name(osm_item["name"])
        osm_lat = osm_item["latitude"]
        osm_lon = osm_item["longitude"]
        
        matched_key = None
        for key, existing in unified_map.items():
            exist_norm_name = normalize_name(existing["name"])
            dist_m = calculate_haversine(osm_lat, osm_lon, existing["latitude"], existing["longitude"])
            
            # Match condition: within 120 meters and name similarity or exact normalized name match
            if dist_m < 120.0 and (osm_norm_name in exist_norm_name or exist_norm_name in osm_norm_name or osm_norm_name == exist_norm_name):
                matched_key = key
                break
                
        if matched_key:
            # Merge live OSM attributes into existing record
            existing_rec = unified_map[matched_key]
            existing_rec["is_live_verified"] = True
            existing_rec["source"] = f"{existing_rec['source']} + OSM Live Verified"
            if "Live OpenStreetMap Verified" not in existing_rec.get("features", []):
                existing_rec.setdefault("features", []).append("Live OpenStreetMap Verified")
            duplicates_count += 1
        else:
            # Add as new live OSM candidate
            osm_rec = dict(osm_item)
            osm_rec["is_live_verified"] = True
            unified_map[osm_item["id"]] = osm_rec
            
    unified_list = list(unified_map.values())
    
    telemetry = {
        "local_db_count": len(local_candidates),
        "live_osm_count": len(live_osm_candidates),
        "duplicates_merged": duplicates_count,
        "unified_candidates_count": len(unified_list)
    }
    
    return unified_list, telemetry
