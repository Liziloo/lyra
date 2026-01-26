// src/services/llmService.ts
import { fetch } from "@tauri-apps/plugin-http";
import { Message, Provider } from "../types";

export interface LLMOptions {
  provider: Provider;
  model: string;
  isGenealogyExpert: boolean;
  contextNotes: string;
  systemOverride?: string; // Add this to allow custom context injection
}

export const sendMessage = async (
  messages: Message[],
  options: LLMOptions,
): Promise<string> => {
  const { provider, model, isGenealogyExpert, contextNotes, systemOverride } =
    options;

  // Use override if provided (for the Briefing system), otherwise use default logic
  let systemContent =
    systemOverride ||
    (isGenealogyExpert
      ? "You are a genealogy expert. Cite sources and note missing evidence."
      : "You are a helpful AI assistant.");

  if (contextNotes && !systemOverride) {
    systemContent += `\n\nUse the following recent notes for context:\n${contextNotes}`;
  }

  const apiMessages = [
    { role: "system", content: systemContent },
    ...messages.map((m) => ({ role: m.role, content: m.text })),
  ];

  const response = await fetch(provider.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(provider.apiKey && { Authorization: `Bearer ${provider.apiKey}` }),
    },
    body: JSON.stringify({ model, messages: apiMessages, stream: false }),
  });

  const data = (await response.json()) as any;
  return provider.id === "ollama"
    ? data.message.content
    : data.choices[0].message.content;
};

export const generateThreadMetadata = async (
  messages: Message[],
  options: LLMOptions,
  mode: "title" | "brief",
): Promise<string> => {
  const prompt =
    mode === "title"
      ? "Create a 3-5 word concise title for this conversation. Return ONLY the title text."
      : "Summarize the key facts and goals of this chat into a 2-paragraph 'Situational Brief' for continuity.";

  return sendMessage(messages, {
    ...options,
    systemOverride: prompt,
    contextNotes: "",
  });
};

export const getOllamaModels = async (baseUrl: string): Promise<string[]> => {
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    if (!response.ok) return [];
    const data = (await response.json()) as { models: { name: string }[] };
    return data.models.map((m) => m.name);
  } catch {
    return [];
  }
};
