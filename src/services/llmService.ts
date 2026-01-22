import { fetch } from "@tauri-apps/plugin-http";
import { Message, Provider } from "../types";

export interface LLMOptions {
  provider: Provider;
  model: string;
  isGenealogyExpert: boolean;
  contextNotes: string;
}

export const sendMessage = async (
  messages: Message[],
  options: LLMOptions,
): Promise<string> => {
  const { provider, model, isGenealogyExpert, contextNotes } = options;

  // 1. Construct System Message
  let systemContent = isGenealogyExpert
    ? "You are a genealogy expert. Cite sources and note missing evidence."
    : "You are a helpful AI assistant.";

  if (contextNotes) {
    systemContent += `\n\nUse the following recent notes for context:\n${contextNotes}`;
  }

  // 2. Map messages to API format
  const apiMessages = [
    { role: "system", content: systemContent },
    ...messages.map((m) => ({
      role: m.role,
      content: m.text,
    })),
  ];

  const isOllama = provider.url.includes("11434") || provider.id === "ollama";

  const body = JSON.stringify({
    model: model,
    messages: apiMessages,
    stream: false,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (provider.apiKey) {
    headers["Authorization"] = `Bearer ${provider.apiKey}`;
  }

  try {
    // Use Tauri's fetch to bypass CORS and use native networking
    const response = await fetch(provider.url, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as any;
      throw new Error(
        errorData.error?.message || `API Error: ${response.status}`,
      );
    }

    const data = (await response.json()) as any;

    if (isOllama) {
      return data.message.content;
    } else {
      return data.choices[0].message.content;
    }
  } catch (error) {
    console.error("LLM Service Error:", error);
    throw error;
  }
};
