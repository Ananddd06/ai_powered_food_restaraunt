from fastapi import status
from app.models.user import User
from app.core.security import verify_password, create_access_token, create_reset_token

def test_register_new_user(client, db_session):
    """Test successful user registration creates user and returns access token."""
    payload = {
        "email": "newuser@example.com",
        "name": "New User",
        "password": "Password123!"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "newuser@example.com"
    assert data["user"]["name"] == "New User"

    # Verify user exists in database and password is encrypted
    user = db_session.query(User).filter(User.email == "newuser@example.com").first()
    assert user is not None
    assert verify_password("Password123!", user.hashed_password) is True

def test_register_duplicate_email(client, test_user):
    """Test registration with already existing email fails with 400 Bad Request."""
    payload = {
        "email": test_user.email,
        "name": "Duplicate User",
        "password": "AnotherPassword123!"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already exists" in response.json()["detail"].lower()

def test_login_success(client, test_user):
    """Test login with correct credentials returns token and user payload."""
    payload = {
        "email": "testuser@example.com",
        "password": "SecurePassword123!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "testuser@example.com"

def test_login_invalid_password(client, test_user):
    """Test login with incorrect password returns 401 Unauthorized."""
    payload = {
        "email": "testuser@example.com",
        "password": "WrongPassword!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_login_nonexistent_user(client):
    """Test login with non-existent user returns 401 Unauthorized."""
    payload = {
        "email": "ghost@example.com",
        "password": "Password123!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_current_user_profile(client, test_user, auth_headers):
    """Test authenticated request to /me returns current user info."""
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == test_user.email
    assert data["name"] == test_user.name

def test_get_current_user_unauthorized(client):
    """Test unauthenticated request to /me returns 401 Unauthorized."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_refresh_token(client, test_user):
    """Test refreshing tokens using valid refresh token."""
    from app.core.security import create_refresh_token
    ref_token = create_refresh_token(test_user.id)
    response = client.post("/api/v1/auth/refresh", json={"refresh_token": ref_token})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data

def test_update_user_preferences(client, test_user, auth_headers):
    """Test updating user preferences."""
    payload = {
        "preferredCuisines": ["Chettinad", "Italian", "Chinese"],
        "budgetRange": ["$$"],
        "dietaryRestrictions": ["Halal"],
        "defaultRadiusKm": 10.0,
        "autoDetectLocation": False
    }
    response = client.put("/api/v1/auth/preferences", json=payload, headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "Chettinad" in data["preferredCuisines"]
    assert data["defaultRadiusKm"] == 10.0

def test_password_reset_flow(client, test_user, db_session):
    """Test complete password reset lifecycle."""
    # 1. Request reset
    response = client.post("/api/v1/auth/forgot-password", json={"email": test_user.email})
    assert response.status_code == status.HTTP_200_OK

    # 2. Reset with valid token
    token = create_reset_token(test_user.id)
    new_password = "BrandNewPassword2026!"
    reset_resp = client.post("/api/v1/auth/reset-password", json={
        "token": token,
        "new_password": new_password
    })
    assert reset_resp.status_code == status.HTTP_200_OK

    # 3. Verify user can log in with new password
    login_resp = client.post("/api/v1/auth/login", json={
        "email": test_user.email,
        "password": new_password
    })
    assert login_resp.status_code == status.HTTP_200_OK

