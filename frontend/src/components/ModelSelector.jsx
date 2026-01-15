import React, { useState, useEffect } from "react";
import axios from "axios";

const ModelSelector = ({ onSelect }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true); // Set loading state to true before sending request
        const response = await axios.get("/model");

        if (Array.isArray(response.data)) {
          setModels(response.data);
        } else if (typeof response.data === 'object') {
          setModels(Object.keys(response.data));
        } else {
          console.error("Invalid data format received from backend:", 
response.data);
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      } finally {
        setLoading(false); // Set loading state to false after receiving response or catching error
      }
    };

    fetchModels();
  }, []);

  const handleSelect = async (modelName) => {
    try {
      await axios.post("/model/switch", { modelName }); // Call backend for model switching
      onSelect(modelName);
    } catch (error) {
      console.error("Error switching models:", error);
    }
  };

  return (
    <select onChange={(e) => handleSelect(e.target.value)} disabled={loading}>
      {models.map((model) => (
        <option key={model} value={model}>
          {model}
        </option>
      ))}
    </select>
  );
};

export default ModelSelector;
