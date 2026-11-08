import pytest
from datetime import datetime, timedelta, timezone
from sqlalchemy.exc import IntegrityError
from app.models.user import User, UserPreference
from app.models.restaurant import Restaurant
from app.models.recommendation_cache import RecommendationCache
from app.db.seed import seed_restaurants_if_empty
from app.core.security import get_password_hash

def test_user_email_uniqueness_constraint(db_session, test_user):
    """Test database enforces unique email constraint at the schema level."""
    duplicate_user = User(
        email=test_user.email,
        name="Duplicate Record",
        hashed_password=get_password_hash("Pass123!"),
    )
    db_session.add(duplicate_user)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()

def test_user_preference_cascade_relationship(db_session):
    """Test user preferences are linked and deleted on cascade."""
    user = User(
        email="cascade_test@example.com",
        name="Cascade User",
        hashed_password=get_password_hash("Pass123!"),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    pref = UserPreference(
        user_id=user.id,
        preferred_cuisines=["Italian"],
        budget_range=["$$"],
        dietary_restrictions=[],
        default_radius_km=3.0,
        auto_detect_location=True,
    )
    db_session.add(pref)
    db_session.commit()

    # Query back
    assert user.preferences is not None
    assert user.preferences.preferred_cuisines == ["Italian"]

    # Delete user and check preference is deleted
    db_session.delete(user)
    db_session.commit()
    orphaned_pref = db_session.query(UserPreference).filter(UserPreference.user_id == user.id).first()
    assert orphaned_pref is None

def test_seed_restaurants_idempotency(db_session):
    """Test running seed_restaurants_if_empty multiple times does not create duplicates."""
    count_before = db_session.query(Restaurant).count()
    # Call seed
    seed_restaurants_if_empty(db_session)
    count_mid = db_session.query(Restaurant).count()
    assert count_mid >= count_before

    # Call seed again - should do nothing since table is not empty
    seed_restaurants_if_empty(db_session)
    count_after = db_session.query(Restaurant).count()
    assert count_after == count_mid

def test_recommendation_cache_expiration_logic():
    """Test RecommendationCache TTL calculation and expiration check."""
    # Active cache item (1 hour future)
    future_cache = RecommendationCache(
        cache_key="key_future",
        query="Italian pasta",
        response_data={"results": []},
        expires_at=datetime.utcnow() + timedelta(hours=1)
    )
    assert future_cache.is_expired() is False

    # Expired cache item (1 hour past)
    past_cache = RecommendationCache(
        cache_key="key_past",
        query="Old query",
        response_data={"results": []},
        expires_at=datetime.utcnow() - timedelta(hours=1)
    )
    assert past_cache.is_expired() is True

