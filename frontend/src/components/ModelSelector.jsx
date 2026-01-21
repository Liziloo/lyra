// frontend/src/components/ModelSelector.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const ModelSelector = ({ onSelect }) => {
  const [models, setModels] = useState([]);
  const [status, setStatus] = useState(""); // Track loading status

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get("/model/");
        if (response.data.ollama_tags) {
          // Ollama returns objects with a 'name' property
          const names = response.data.ollama_tags.map((m) =>
            typeof m === "string" ? m : m.name,
          );
          setModels(names);
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };
    fetchModels();
  }, []);

  const handleSelect = async (modelName) => {
    try {
      setStatus("Waking up model on LAN...");
      await axios.post("/model/switch", { modelName });
      onSelect(modelName);
      setStatus("Ready");
      setTimeout(() => setStatus(""), 3000);
    } catch (error) {
      console.error("Error switching models:", error);
      setStatus("Error: Check LAN server");
    }
  };

  return (
    <div className="model-selector">
      <select
        onChange={(e) => handleSelect(e.target.value)}
        disabled={status.includes("Waking")}
      >
        <option value="">Select a Model</option>
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
      {status && (
        <span style={{ fontSize: "10px", marginLeft: "10px" }}>{status}</span>
      )}
    </div>
  );
};

export default ModelSelector;
