from fastapi import status

def test_root_endpoint_health(client):
    """Test API root status check endpoint."""
    response = client.get("/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "message" in data
    assert "running" in data["message"].lower()

def test_openapi_schema_generated(client):
    """Test OpenAPI 3.0 documentation schema is generated without serialization errors."""
    response = client.get("/api/v1/openapi.json")
    assert response.status_code == status.HTTP_200_OK
    schema = response.json()
    assert schema["openapi"].startswith("3.")
    assert "paths" in schema
    assert "/api/v1/restaurants/" in schema["paths"]
    assert "/api/v1/auth/login" in schema["paths"]

def test_get_chennai_localities_registry(client):
    """Test localities endpoint returns sorted Chennai GIS localities."""
    response = client.get("/api/v1/localities")
    assert response.status_code == status.HTTP_200_OK
    localities = response.json()
    assert isinstance(localities, list)
    assert len(localities) >= 20

    # Ensure key Chennai neighborhoods exist with valid coordinates
    locality_names = [loc["name"] for loc in localities]
    assert "T. Nagar" in locality_names
    assert "Adyar" in locality_names
    assert "Velachery" in locality_names

    for loc in localities:
        assert 12.0 < loc["latitude"] < 14.0  # Chennai latitude range
        assert 79.5 < loc["longitude"] < 81.0  # Chennai longitude range
