import uuid
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, JSON, Text
from datetime import datetime, timezone
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, index=True, nullable=False)
    tagline = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    rating = Column(Float, default=4.5)
    review_count = Column(Integer, default=0)
    price_level = Column(String, default="$$")
    cuisines = Column(JSON, default=list)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    website = Column(String, nullable=True)
    is_open_now = Column(Boolean, default=True)
    features = Column(JSON, default=list)
    opening_hours = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    restaurant_id = Column(String, ForeignKey("restaurants.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    restaurant_id = Column(String, ForeignKey("restaurants.id"), nullable=False, index=True)
    rating = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
