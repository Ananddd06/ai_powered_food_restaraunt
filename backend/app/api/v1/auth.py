from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, UserPreference
from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token, TokenRefresh, UserPreferenceUpdate, UserPreferenceBase, ForgotPasswordRequest, ResetPasswordRequest
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, create_reset_token, decode_token

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_user_response(user: User, pref: UserPreference) -> UserResponse:
    pref_base = UserPreferenceBase(
        preferredCuisines=pref.preferred_cuisines if pref else ["Italian", "Japanese", "Indian"],
        budgetRange=pref.budget_range if pref else ["$", "$$", "$$$"],
        dietaryRestrictions=pref.dietary_restrictions if pref else [],
        defaultRadiusKm=pref.default_radius_km if pref else 3.0,
        autoDetectLocation=pref.auto_detect_location if pref else True,
    )
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        avatarUrl=user.avatar_url,
        preferences=pref_base
    )

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    db_user = User(
        email=user_in.email,
        name=user_in.name,
        hashed_password=get_password_hash(user_in.password),
        avatar_url=f"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create default user preference
    db_pref = UserPreference(
        user_id=db_user.id,
        preferred_cuisines=["Italian", "Japanese", "Indian"],
        budget_range=["$", "$$", "$$$"],
        dietary_restrictions=[],
        default_radius_km=3.0,
        auto_detect_location=True
    )
    db.add(db_pref)
    db.commit()
    db.refresh(db_pref)

    access_token = create_access_token(db_user.id)
    refresh_token = create_refresh_token(db_user.id)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user=get_user_response(db_user, db_pref)
    )

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    pref = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user=get_user_response(user, pref)
    )

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    return get_user_response(current_user, pref)

@router.post("/refresh", response_model=dict)
def refresh_token(body: TokenRefresh, db: Session = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_access_token = create_access_token(user.id)
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.patch("/preferences", response_model=UserPreferenceBase)
def update_preferences(
    pref_in: UserPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)

    if pref_in.preferredCuisines is not None:
        pref.preferred_cuisines = pref_in.preferredCuisines
    if pref_in.budgetRange is not None:
        pref.budget_range = pref_in.budgetRange
    if pref_in.dietaryRestrictions is not None:
        pref.dietary_restrictions = pref_in.dietaryRestrictions
    if pref_in.defaultRadiusKm is not None:
        pref.default_radius_km = pref_in.defaultRadiusKm
    if pref_in.autoDetectLocation is not None:
        pref.auto_detect_location = pref_in.autoDetectLocation

    db.commit()
    db.refresh(pref)

    return UserPreferenceBase(
        preferredCuisines=pref.preferred_cuisines,
        budgetRange=pref.budget_range,
        dietaryRestrictions=pref.dietary_restrictions,
        defaultRadiusKm=pref.default_radius_km,
        autoDetectLocation=pref.auto_detect_location
    )

from app.core.email import send_password_reset_email

@router.post("/forgot-password", response_model=dict)
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        return {
            "message": "If your email is registered, a password recovery link has been sent."
        }

    reset_token = create_reset_token(user.id)
    send_password_reset_email(body.email, reset_token)

    return {
        "message": f"Password recovery email has been sent to {body.email}. Please check your inbox and click the reset link."
    }




@router.post("/reset-password", response_model=dict)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.token)
    if not payload or payload.get("type") != "reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token."
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = get_password_hash(body.new_password)
    db.commit()

    return {"message": "Password updated successfully! You can now log in with your new password."}

