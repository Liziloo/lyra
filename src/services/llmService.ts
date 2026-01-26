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
  const { provider, model } = options;

  const systemInstruction =
    mode === "title"
      ? "You are a metadata utility. Provide a 3-5 word plain text title. NO quotes, NO thinking, NO 'Title:', NO filler."
      : "Provide a 2-paragraph Situational Brief for continuity. Focus on facts. NO thinking, NO filler.";

  const contextSnippet = messages
    .slice(-4)
    .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
    .join("\n");

  const userPrompt =
    mode === "title"
      ? `Topic for this conversation:\n\n${contextSnippet}`
      : `Brief this exchange:\n\n${contextSnippet}`;

  const apiMessages = [
    { role: "system", content: systemInstruction },
    { role: "user", content: userPrompt },
  ];

  try {
    const response = await fetch(provider.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(provider.apiKey && { Authorization: `Bearer ${provider.apiKey}` }),
      },
      body: JSON.stringify({ model, messages: apiMessages, stream: false }),
    });

    const data = (await response.json()) as any;
    let rawContent =
      provider.id === "ollama"
        ? data.message.content
        : data.choices[0].message.content;

    // AGGRESSIVE CLEANING
    let cleaned =
      rawContent
        .replace(/<think>[\s\S]*?<\/think>/gi, "") // Remove reasoning
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
        .shift() || ""; // Get first real line

    cleaned = cleaned
      .replace(/^(title|topic|subject|summary)[:\s]*/gi, "") // Remove common prefixes
      .replace(/^\d+\.\s*/, "") // Remove "1. " numbering
      .replace(/["'#*]/g, "") // Remove formatting chars
      .trim();

    // Ensure it's actually succinct for titles
    if (mode === "title" && cleaned.length > 50) {
      cleaned = cleaned.substring(0, 47) + "...";
    }

    return cleaned || (mode === "title" ? "New Transmission" : "");
  } catch (error) {
    console.error("Metadata generation failed:", error);
    return mode === "title" ? "New Transmission" : "";
  }
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
