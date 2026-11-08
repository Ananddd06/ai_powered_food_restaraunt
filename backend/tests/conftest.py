import os
import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure test environment settings
os.environ["SECRET_KEY"] = "test_super_secret_jwt_key_for_ci_testing_only_12345"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "60"

# Determine test database URL: use PostgreSQL if TEST_DATABASE_URL or DATABASE_URL provided, else in-memory SQLite
test_db_url = os.getenv("TEST_DATABASE_URL", os.getenv("DATABASE_URL", "sqlite:///:memory:"))

connect_args = {"check_same_thread": False} if "sqlite" in test_db_url else {}
poolclass = StaticPool if "sqlite" in test_db_url and ":memory:" in test_db_url else None

engine_kwargs = {"connect_args": connect_args, "pool_pre_ping": True}
if poolclass:
    engine_kwargs["poolclass"] = poolclass

test_engine = create_engine(test_db_url, **engine_kwargs)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

from app.db.session import Base, get_db
from app.main import app
from app.models.user import User, UserPreference
from app.models.restaurant import Restaurant
from app.core.security import get_password_hash, create_access_token

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create all database tables for the test session and clean up afterwards."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def db_session() -> Generator:
    """Provides a transactional database session per test with automatic rollback."""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session) -> Generator:
    """FastAPI TestClient with overridden get_db dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db_session) -> User:
    """Creates and returns a persistent test user with default preferences."""
    existing = db_session.query(User).filter(User.email == "testuser@example.com").first()
    if existing:
        return existing

    user = User(
        email="testuser@example.com",
        name="Test User",
        hashed_password=get_password_hash("SecurePassword123!"),
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    pref = UserPreference(
        user_id=user.id,
        preferred_cuisines=["Italian", "South Indian"],
        budget_range=["$", "$$"],
        dietary_restrictions=["Vegetarian"],
        default_radius_km=5.0,
        auto_detect_location=True,
    )
    db_session.add(pref)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def auth_headers(test_user) -> dict:
    """Returns Bearer authorization headers for the test user."""
    token = create_access_token(test_user.id)
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def seed_test_restaurant(db_session) -> Restaurant:
    """Seeds a sample Chennai restaurant for testing."""
    rest = Restaurant(
        id="rest-test-1",
        name="Ananda Bhavan Tiffin",
        tagline="Finest South Indian breakfast and meals.",
        description="Famous for crispy dosas, fluffy idlis, and traditional filter coffee.",
        image_url="https://example.com/ananda.jpg",
        rating=4.6,
        review_count=1250,
        price_level="$",
        cuisines=["South Indian", "Vegetarian", "Breakfast"],
        latitude=13.0418,
        longitude=80.2341,
        address="Usman Road, T. Nagar, Chennai, Tamil Nadu",
        phone="+91 44 2434 0000",
        website="https://anandabhavan.example.com",
        is_open_now=True,
        features=["Dine-in", "Takeaway", "Vegetarian Only"],
        opening_hours={"Mon-Sun": "07:00 AM - 10:30 PM"},
    )
    db_session.add(rest)
    db_session.commit()
    db_session.refresh(rest)
    return rest

