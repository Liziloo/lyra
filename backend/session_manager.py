import os
import json
import time
from pathlib import Path

class SessionManager:
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.session_dir = Path(__file__).parent.parent / "sessions" / model_name
        self.session_dir.mkdir(parents=True, exist_ok=True)
        self.current_file = self.session_dir / "current_session.json"

    def load_session(self):
        if self.current_file.exists():
            return json.loads(self.current_file.read_text())
        return {"conversation": []}

    def save_session(self, data):
        self.current_file.write_text(json.dumps(data, indent=2))

    def archive_session(self):
        if self.current_file.exists():
            timestamp = int(time.time())
            archive_path = self.session_dir / f"session_{timestamp}.json"
            os.rename(self.current_file, archive_path)
            self.save_session({"conversation": []})