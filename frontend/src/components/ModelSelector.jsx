import React, { useState, useEffect } from "react";
import axios from "axios";

const ModelSelector = ({ onSelect }) => {
  const [models, setModels] = useState([]);

  useEffect(() => {
    // Fetch available models from backend and update state
    axios.get("/model").then((response) => setModels(response.data));
  }, []);

  return (
    <select onChange={(e) => onSelect(e.target.value)}>
      {models.map((model) => (
        <option key={model} value={model}>
          {model}
        </option>
      ))}
    </select>
  );
};

export default ModelSelector;
