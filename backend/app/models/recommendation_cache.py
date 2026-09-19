import uuid
from sqlalchemy import Column, String, DateTime, JSON, Float
from datetime import datetime, timedelta
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class RecommendationCache(Base):
    __tablename__ = "recommendation_caches"

    id = Column(String, primary_key=True, default=generate_uuid)
    cache_key = Column(String, index=True, nullable=False)
    user_id = Column(String, nullable=True, index=True)
    query = Column(String, nullable=False)
    location_name = Column(String, nullable=True)
    user_lat = Column(Float, nullable=True)
    user_lon = Column(Float, nullable=True)
    response_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.utcnow())
    expires_at = Column(DateTime, nullable=False, index=True)

    @classmethod
    def create_expiration(cls, ttl_seconds: int = 3600):
        """Default TTL expiration (1 hour)."""
        return datetime.utcnow() + timedelta(seconds=ttl_seconds)

    def is_expired(self) -> bool:
        """Returns True if cache item has exceeded TTL."""
        return datetime.utcnow() > self.expires_at
