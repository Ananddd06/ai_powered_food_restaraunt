from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.restaurant import Restaurant

router = APIRouter()

from app.ml.ranker import haversine_distance

@router.get("/", response_model=List[dict])
def get_restaurants(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radiusKm: Optional[float] = Query(5.0),
    searchQuery: Optional[str] = Query(None),
    limit: int = Query(50),
    cuisine: Optional[str] = Query(None),
    price_level: Optional[str] = Query(None),
    open_now: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Restaurant)
    
    if open_now:
        query = query.filter(Restaurant.is_open_now == True)
        
    # Apply bounding box pre-filter if coordinates are provided
    if lat is not None and lng is not None and radiusKm is not None:
        # Approximate degrees for km: 1 degree latitude = ~111km
        lat_offset = radiusKm / 111.0
        # 1 degree longitude = ~111km * cos(lat)
        import math
        lng_offset = radiusKm / (111.0 * math.cos(math.radians(lat)))
        
        query = query.filter(
            Restaurant.latitude.between(lat - lat_offset, lat + lat_offset),
            Restaurant.longitude.between(lng - lng_offset, lng + lng_offset)
        )
        
    # Search name or description
    if searchQuery:
        search_term = f"%{searchQuery.lower()}%"
        from sqlalchemy import or_, func
        query = query.filter(
            or_(
                func.lower(Restaurant.name).like(search_term),
                func.lower(Restaurant.description).like(search_term)
            )
        )

    if price_level:
        query = query.filter(Restaurant.price_level == price_level)

    results = query.all()
    out = []
    
    for r in results:
        # Cuisine filtering (since it's a JSON field, in-memory is safer for SQLite)
        if cuisine and cuisine.lower() not in [c.lower() for c in r.cuisines]:
            continue
            
        # Calculate exact distance
        distance = 0.0
        if lat is not None and lng is not None:
            distance = haversine_distance(lat, lng, r.latitude, r.longitude)
            # Strict radius check
            if radiusKm is not None and distance > radiusKm:
                continue
                
        import hashlib
        h = int(hashlib.md5(str(r.id).encode()).hexdigest(), 16)
        j_lat = ((h % 4000) - 2000) / 1000000.0
        j_lon = (((h // 4000) % 4000) - 2000) / 1000000.0

        out.append({
            "id": r.id,
            "name": r.name,
            "tagline": r.tagline,
            "description": r.description,
            "imageUrl": r.image_url,
            "rating": r.rating,
            "reviewCount": r.review_count,
            "priceLevel": r.price_level,
            "cuisine": r.cuisines,
            "location": {
                "lat": r.latitude + j_lat,
                "lng": r.longitude + j_lon,
                "address": r.address
            },
            "phone": r.phone,
            "website": r.website,
            "isOpenNow": r.is_open_now,
            "features": r.features,
            "openingHours": r.opening_hours,
            "distanceKm": round(distance, 1)
        })
        
    # Sort by distance if lat/lng provided, otherwise by rating
    if lat is not None and lng is not None:
        out.sort(key=lambda x: x["distanceKm"])
    else:
        out.sort(key=lambda x: x["rating"] or 0, reverse=True)
        
    return out[:limit]

@router.get("/{restaurant_id}", response_model=dict)
def get_restaurant_by_id(restaurant_id: str, db: Session = Depends(get_db)):
    r = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return {
        "id": r.id,
        "name": r.name,
        "tagline": r.tagline,
        "description": r.description,
        "imageUrl": r.image_url,
        "rating": r.rating,
        "reviewCount": r.review_count,
        "priceLevel": r.price_level,
        "cuisine": r.cuisines,
        "location": {
            "lat": r.latitude,
            "lng": r.longitude,
            "address": r.address
        },
        "phone": r.phone,
        "website": r.website,
        "isOpenNow": r.is_open_now,
        "features": r.features,
        "openingHours": r.opening_hours,
        "distanceKm": 1.2
    }
