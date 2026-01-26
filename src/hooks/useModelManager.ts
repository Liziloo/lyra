// src/hooks/useModelManager.ts
import { useState, useEffect } from "react";
import { getOllamaModels } from "../services/llmService";

export const useModelManager = (isOllamaOnline: boolean, baseUrl: string) => {
  const [activeProviderId, setActiveProviderId] = useState<
    "ollama" | "openrouter"
  >("ollama");
  const [selectedModel, setSelectedModel] = useState("");
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    if (isOllamaOnline && activeProviderId === "ollama") {
      getOllamaModels(baseUrl).then((models) => {
        // FILTER: Only show models prefixed with "lyra-"
        const filtered = models.filter((name) =>
          name.toLowerCase().startsWith("lyra-"),
        );
        setAvailableModels(filtered);

        if (filtered.length > 0 && !filtered.includes(selectedModel)) {
          setSelectedModel(filtered[0]);
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
