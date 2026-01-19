import pytest
import json
from session_manager import SessionManager

def test_session_lifecycle(tmp_path):
    """Test creating, saving, and loading a session."""
    # Override the session directory to a temp path
    model_name = "test_model"
    manager = SessionManager(model_name)
    manager.session_dir = tmp_path / "sessions" / model_name
    manager.current_file = manager.session_dir / "current_session.json"
    manager.session_dir.mkdir(parents=True)

    test_data = {"conversation": [{"role": "user", "content": "hi"}]}
    
    # Save
    manager.save_session(test_data)
    
    # Load
    loaded = manager.load_session()
    assert loaded["conversation"][0]["content"] == "hi"

    # Archive
    manager.archive_session()
    assert not manager.current_file.exists() # Should be moved/cleared