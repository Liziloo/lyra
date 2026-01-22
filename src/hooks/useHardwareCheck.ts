import { useState, useEffect } from "react";
import { fetch } from "@tauri-apps/plugin-http";

export const useHardwareCheck = (intervalMs: number = 5000) => {
  const [isOllamaOnline, setIsOllamaOnline] = useState(false);
  const rawUrl = import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434";
  const baseUrl = rawUrl.trim().replace(/\/+$/, "");

  useEffect(() => {
    const check = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/tags`, {
          method: "GET",
          connectTimeout: 2000,
        });

        if (response.ok || response.status === 404) {
          setIsOllamaOnline(true);
        } else {
          console.warn(
            "Ollama responded but with error status:",
            response.status,
          );
          setIsOllamaOnline(false);
        }
      } catch (err: any) {
        // THIS LOG IS THE MOST IMPORTANT DEBUGGING STEP:
        console.error("HARDWARE CHECK FAILED:", err);
        setIsOllamaOnline(false);
      }
    };

    check();
    const id = setInterval(check, intervalMs);
    return () => clearInterval(id);
  }, [baseUrl, intervalMs]);

  return { isOllamaOnline };
};
