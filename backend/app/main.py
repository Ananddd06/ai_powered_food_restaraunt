from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, SessionLocal, Base
import app.models.recommendation_cache  # Register RecommendationCache model
from app.db.seed import seed_restaurants_if_empty
from app.api.v1 import auth, restaurants, favorites, recommendations

# Automatically create tables if not exist
Base.metadata.create_all(bind=engine)

# Seed restaurant data in PostgreSQL
db = SessionLocal()
try:
    seed_restaurants_if_empty(db)
finally:
    db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(restaurants.router, prefix=f"{settings.API_V1_STR}/restaurants", tags=["restaurants"])
app.include_router(favorites.router, prefix=f"{settings.API_V1_STR}/favorites", tags=["favorites"])
app.include_router(recommendations.router, prefix=f"{settings.API_V1_STR}", tags=["recommendations"])

@app.get("/")
def root():
    return {"message": "AI-Powered Restaurant Discovery API is running!"}

