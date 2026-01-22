import { useState, useEffect } from "react";

export const useHardwareCheck = (intervalMs: number = 5000) => {
  const [isOllamaOnline, setIsOllamaOnline] = useState<boolean>(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Ping the base Ollama endpoint
        const response = await fetch("http://localhost:11434/api/tags");
        setIsOllamaOnline(response.ok);
      } catch (err) {
        setIsOllamaOnline(false);
      }
    };

    checkStatus();
    const id = setInterval(checkStatus, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs]);

  return { isOllamaOnline };
};
