import { useState, useEffect } from "react";
import { getOllamaModels } from "../services/llmService";

export const useModelManager = (isOllamaOnline: boolean, baseUrl: string) => {
  const [activeProviderId, setActiveProviderId] = useState<
    "ollama" | "openrouter"
  >("ollama");
  const [selectedModel, setSelectedModel] = useState("llama3.2");
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    if (isOllamaOnline && activeProviderId === "ollama") {
      getOllamaModels(baseUrl).then((models) => {
        setAvailableModels(models);
        if (models.length > 0 && !models.includes(selectedModel)) {
          setSelectedModel(models[0]);
        }
      });
    }
  }, [isOllamaOnline, activeProviderId, baseUrl]);

  return {
    activeProviderId,
    setActiveProviderId,
    selectedModel,
    setSelectedModel,
    availableModels,
  };
};
