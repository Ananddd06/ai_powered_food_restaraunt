from fastapi import status

def test_add_favorite_authenticated(client, test_user, seed_test_restaurant, auth_headers):
    """Test authenticated user can add restaurant to favorites."""
    response = client.post(
        f"/api/v1/favorites/{seed_test_restaurant.id}",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["restaurant_id"] == seed_test_restaurant.id

    # Verify restaurant appears in user favorites list
    list_resp = client.get("/api/v1/favorites/", headers=auth_headers)
    assert list_resp.status_code == status.HTTP_200_OK
    fav_ids = [f["id"] for f in list_resp.json()]
    assert seed_test_restaurant.id in fav_ids

def test_add_duplicate_favorite_idempotent(client, test_user, seed_test_restaurant, auth_headers):
    """Test adding the same favorite twice is idempotent without database error."""
    resp1 = client.post(f"/api/v1/favorites/{seed_test_restaurant.id}", headers=auth_headers)
    assert resp1.status_code == status.HTTP_200_OK

    resp2 = client.post(f"/api/v1/favorites/{seed_test_restaurant.id}", headers=auth_headers)
    assert resp2.status_code == status.HTTP_200_OK

def test_remove_favorite(client, test_user, seed_test_restaurant, auth_headers):
    """Test removing a favorite restaurant."""
    # Add first
    client.post(f"/api/v1/favorites/{seed_test_restaurant.id}", headers=auth_headers)

    # Delete
    del_resp = client.delete(f"/api/v1/favorites/{seed_test_restaurant.id}", headers=auth_headers)
    assert del_resp.status_code == status.HTTP_200_OK

    # Verify no longer in list
    list_resp = client.get("/api/v1/favorites/", headers=auth_headers)
    fav_ids = [f["id"] for f in list_resp.json()]
    assert seed_test_restaurant.id not in fav_ids

def test_favorites_requires_authentication(client, seed_test_restaurant):
    """Test accessing favorites without token returns 401."""
    resp_get = client.get("/api/v1/favorites/")
    assert resp_get.status_code == status.HTTP_401_UNAUTHORIZED

    resp_post = client.post(f"/api/v1/favorites/{seed_test_restaurant.id}")
    assert resp_post.status_code == status.HTTP_401_UNAUTHORIZED

