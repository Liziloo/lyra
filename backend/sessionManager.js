const fs = require("fs");
const path = require("path");

class SessionManager {
  constructor(modelName) {
    this.modelName = modelName;
    this.sessionPath = path.join(__dirname, "..", "sessions", modelName);
    this.currentSessionFile = path.join(
      this.sessionPath,
      "current_session.json"
    );
  }

  // Load current session data from JSON file
  loadCurrentSession() {
    if (fs.existsSync(this.currentSessionFile)) {
      const rawData = fs.readFileSync(this.currentSessionFile);
      return JSON.parse(rawData);
    } else {
      // Return empty session data if file doesn't exist
      return { conversation: [] };
    }
  }

  // Save current session data to JSON file
  saveCurrentSession(sessionData) {
    fs.writeFileSync(this.currentSessionFile, JSON.stringify(sessionData));
  }

  // Archive the current session with a timestamp and clear it for new conversation;
  archiveCurrentSession() {
    const timestamp = Date.now();
    const archivedSessionFile = path.join(
      this.sessionPath,
      `session_${timestamp}.json`
    );
    fs.copyFileSync(this.currentSessionFile, archivedSessionFile);
    this.saveCurrentSession({ conversation: [] }); // Clear current session data
  }

  // Add a new message to the current session and save it
  addMessageToSession(message) {
    const sessionData = this.loadCurrentSession();
    sessionData.conversation.push(message);
    this.saveCurrentSession(sessionData);
  }
}

module.exports = SessionManager;
