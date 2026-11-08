from fastapi import status

def test_list_restaurants_returns_results(client, seed_test_restaurant):
    """Test restaurants listing returns status 200 and populated list."""
    response = client.get("/api/v1/restaurants/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    names = [r["name"] for r in data]
    assert seed_test_restaurant.name in names

def test_filter_restaurants_by_cuisine(client, seed_test_restaurant):
    """Test filtering restaurants by cuisine matches expected entries."""
    # Filter matching cuisine
    response = client.get("/api/v1/restaurants/?cuisine=South Indian")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert any(r["name"] == seed_test_restaurant.name for r in data)

    # Filter non-matching cuisine
    response_empty = client.get("/api/v1/restaurants/?cuisine=Mexican")
    assert response_empty.status_code == status.HTTP_200_OK
    data_empty = response_empty.json()
    assert not any(r["name"] == seed_test_restaurant.name for r in data_empty)

def test_filter_restaurants_by_price_level(client, seed_test_restaurant):
    """Test filtering restaurants by price level."""
    response = client.get(f"/api/v1/restaurants/?price_level={seed_test_restaurant.price_level}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert all(r["priceLevel"] == seed_test_restaurant.price_level for r in data)

def test_filter_restaurants_by_location_bounding_box(client, seed_test_restaurant):
    """Test bounding box geospatial filtering around T. Nagar coordinates."""
    # Nearby coordinates (within 5 km)
    response_near = client.get(
        f"/api/v1/restaurants/?lat={seed_test_restaurant.latitude}&lng={seed_test_restaurant.longitude}&radiusKm=5.0"
    )
    assert response_near.status_code == status.HTTP_200_OK
    near_ids = [r["id"] for r in response_near.json()]
    assert seed_test_restaurant.id in near_ids

    # Far away coordinates (e.g., Delhi: 28.6139, 77.2090) with small radius
    response_far = client.get("/api/v1/restaurants/?lat=28.6139&lng=77.2090&radiusKm=2.0")
    assert response_far.status_code == status.HTTP_200_OK
    far_ids = [r["id"] for r in response_far.json()]
    assert seed_test_restaurant.id not in far_ids

def test_search_restaurants_by_query(client, seed_test_restaurant):
    """Test text search on restaurant name and description."""
    response = client.get("/api/v1/restaurants/?searchQuery=Ananda")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert any("Ananda" in r["name"] for r in data)

def test_get_restaurant_by_id(client, seed_test_restaurant):
    """Test getting single restaurant details by ID."""
    response = client.get(f"/api/v1/restaurants/{seed_test_restaurant.id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == seed_test_restaurant.id
    assert data["name"] == seed_test_restaurant.name

def test_get_restaurant_by_invalid_id_returns_404(client):
    """Test fetching non-existent restaurant returns 404."""
    response = client.get("/api/v1/restaurants/non_existent_id_99999")
    assert response.status_code == status.HTTP_404_NOT_FOUND

