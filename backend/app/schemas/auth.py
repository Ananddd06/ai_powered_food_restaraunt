from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserPreferenceBase(BaseModel):
    preferredCuisines: List[str] = ["Italian", "Japanese", "Indian"]
    budgetRange: List[str] = ["$", "$$", "$$$"]
    dietaryRestrictions: List[str] = []
    defaultRadiusKm: float = 3.0
    autoDetectLocation: bool = True

class UserPreferenceUpdate(BaseModel):
    preferredCuisines: Optional[List[str]] = None
    budgetRange: Optional[List[str]] = None
    dietaryRestrictions: Optional[List[str]] = None
    defaultRadiusKm: Optional[float] = None
    autoDetectLocation: Optional[bool] = None

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    avatarUrl: Optional[str] = None
    preferences: UserPreferenceBase

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenRefresh(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

