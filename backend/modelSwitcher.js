const fs = require("fs");
const path = require("path");
const SessionManager = require("./sessionManager");

class ModelSwitcher {
  constructor() {
    this.configPath = path.join(
      __dirname,
      "..",
      "config",
      "default_model.json"
    );
    this.modelsRegistryPath = path.join(__dirname, "..", "models");
    this.currentModelName = null;
    this.sessionManager = null;
  }

  // Read default model name from config file
  getDefaultModel() {
    const rawData = fs.readFileSync(this.configPath);
    return JSON.parse(rawData).default_model;
  }

  // Load Modelfile for the given model name
  loadModelfile(modelName) {
    const modelfilePath = path.join(
      this.modelsRegistryPath,
      modelName,
      "Modelfile"
    );
    if (fs.existsSync(modelfilePath)) {
      return fs.readFileSync(modelfilePath, "utf-8");
    } else {
      throw new Error(`Modelfile not found for model: 
${modelName}`);
    }
  }

  // Switch to the given model and load its session context
  async switchModel(modelName) {
    if (this.currentModelName === modelName) {
      console.log(`Already using model: ${modelName}`);
      return;
    }

    try {
      // Archive current session before switching
      if (this.sessionManager) {
        this.sessionManager.archiveCurrentSession();
      }

      // Load new session manager for the selected model
      this.sessionManager = new SessionManager(modelName);
      const modelfile = this.loadModelfile(modelName);

      // Update current model name and return Modelfile
      this.currentModelName = modelName;
      return modelfile;
    } catch (error) {
      console.error("Error switching models:", error);
      throw error;
    }
  }
}

module.exports = ModelSwitcher;
