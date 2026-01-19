import pytest
import os
from fastapi.testclient import TestClient
from main import app
from pathlib import Path

@pytest.fixture
def client():
    """Returns a FastAPI test client."""
    with TestClient(app) as c:
        yield c

@pytest.fixture
def mock_projects_dir(tmp_path):
    """Creates a temporary project structure for testing."""
    project_dir = tmp_path / "projects" / "test_project" / "code"
    project_dir.mkdir(parents=True)
    (project_dir / "main.py").write_text("print('hello')")
    return tmp_path