import { useState, useEffect } from "react";
import { fetch } from "@tauri-apps/plugin-http";

export const useHardwareCheck = (intervalMs: number = 5000) => {
  const [isOllamaOnline, setIsOllamaOnline] = useState(false);

  // Get base URL from .env (e.g., http://192.168.1.50:11434)
  const ollamaUrl = import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434";

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${ollamaUrl}/api/tags`, {
          method: "GET",
          connectTimeout: 2000,
        });
        setIsOllamaOnline(response.ok);
      } catch {
        setIsOllamaOnline(false);
      }
    };

    checkStatus();
    const id = setInterval(checkStatus, intervalMs);
    return () => clearInterval(id);
  }, [ollamaUrl, intervalMs]);

  return { isOllamaOnline };
};