# desktop.py
import webview
import threading
import uvicorn
import socket
import sys
import os

# 1. Get absolute paths
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

# 2. Force Python to look in 'backend' first
sys.path.insert(0, BACKEND_DIR)

# 3. Import the app using a standard import
try:
    import main  # This looks for main.py inside BACKEND_DIR
    app = main.app
    print("✅ Backend successfully resolved.")
except ImportError as e:
    print(f"❌ Error: Could not find main.py in {BACKEND_DIR}")
    print(f"Technical details: {e}")
    sys.exit(1)

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def start_backend():
    uvicorn.run(app, host="127.0.0.1", port=3001, log_level="info")

if __name__ == "__main__":
    # Start backend
    t = threading.Thread(target=start_backend, daemon=True)
    t.start()

    # Determine URL
    if is_port_in_use(5173):
        print("🚀 Running in Dev Mode (Vite)")
        url = "http://localhost:5173"
    else:
        print("📦 Running in Production Mode (Static)")
        url = "http://127.0.0.1:3001"

    # Launch
    window = webview.create_window('Lyra AI v2.0', url, width=1200, height=900)
    webview.start(gui='qt')