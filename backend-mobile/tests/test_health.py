from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_unknown_path_returns_json_not_found():
    response = client.get("/this-route-does-not-exist")
    assert response.status_code == 404
    body = response.json()
    assert body["status"] == "not_found"
    assert body["health"] == "/api/v1/health"


def test_signup_options():
    response = client.get("/api/v1/users/options")
    assert response.status_code == 200
    assert "connectWith" in response.json()
