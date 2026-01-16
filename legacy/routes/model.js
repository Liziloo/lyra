const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
const modelSwitcher = require("../modelSwitcher");

// Read the models registry file
async function readModelsRegistry() {
  const registryPath = path.join(
    __dirname,
    "..",
    "..",
    "models",
    "registry.json"
  );
  try {
    const data = await fs.readFile(registryPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading models registry:", error);
    throw new Error("Failed to read models registry");
  }
}

router.get("/", async (req, res) => {
  try {
    // Read the models registry and send available model names back to UI
    const modelsRegistry = await readModelsRegistry();
    res.json({ success: true, data: Object.keys(modelsRegistry) });
  } catch (error) {
    console.error("Error in get models route:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/switch", async (req, res) => {
  // Extract new model name from request body
  const { modelName } = req.body;

  try {
    // Read the models registry to validate the requested model
    const modelsRegistry = await readModelsRegistry();
    if (!modelsRegistry[modelName]) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid model name" });
    }

    // Switch to the new model
    await modelSwitcher.switchModel(modelName);

    // Send success response back to UI
    res.json({ success: true, message: "Model switched successfully" });
  } catch (error) {
    console.error("Error in switch model route:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
