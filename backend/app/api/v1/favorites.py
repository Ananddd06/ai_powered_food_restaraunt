from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.restaurant import Restaurant, Favorite
from app.models.user import User
from app.api.v1.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[dict])
def get_user_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favorites = db.query(Favorite).filter(Favorite.user_id == current_user.id).all()
    rest_ids = [f.restaurant_id for f in favorites]
    restaurants = db.query(Restaurant).filter(Restaurant.id.in_(rest_ids)).all()
    
    out = []
    for r in restaurants:
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
        })
    return out

@router.post("/{restaurant_id}", response_model=dict)
def add_favorite(
    restaurant_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == restaurant_id
    ).first()
    if not existing:
        fav = Favorite(user_id=current_user.id, restaurant_id=restaurant_id)
        db.add(fav)
        db.commit()
    return {"message": "Favorite added to PostgreSQL database", "restaurant_id": restaurant_id}

@router.delete("/{restaurant_id}", response_model=dict)
def remove_favorite(
    restaurant_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == restaurant_id
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
    return {"message": "Favorite removed from PostgreSQL database", "restaurant_id": restaurant_id}
