import pytest
from fastapi.testclient import TestClient

def test_list_models(client):
    """Ensure the model registry/tags endpoint responds."""
    response = client.get("/model/")
    assert response.status_code == 200
    assert "ollama_tags" in response.json()

def test_project_file_listing(client, mocker):
    """Test project file retrieval logic."""
    # Mock the PROJECTS_ROOT in the route to use a temp path
    mocker.patch("routes.project.PROJECTS_ROOT", Path("/tmp/fake_projects"))
    
    # We expect a 404 or empty list if the path doesn't exist
    response = client.get("/project/non_existent_project")
    assert response.status_code == 200
    assert response.json() == []

def test_vscode_endpoint_exists(client):
    """SPEC Section 3: Verify OpenAI compatibility endpoint for VS Code."""
    payload = {
        "model": "codestral",
        "messages": [{"role": "user", "content": "Hello"}]
    }
    # We use stream=True usually, but TestClient handles the request
    response = client.post("/v1/chat/completions", json=payload)
    assert response.status_code == 200