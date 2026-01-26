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

  // 1. STACKED INSTRUCTION: Use System role for strict formatting
  const systemInstruction =
    mode === "title"
      ? "You are a specialized metadata utility. Your ONLY task is to provide a 3-5 word succinct title for the provided conversation. Do NOT use markdown. Do NOT use quotes. Do NOT explain your choice. Do NOT use conversational filler. Response must be plain text."
      : "Summarize the key facts and goals of this chat into a 2-paragraph Situational Brief. Focus on facts, not conversational fluff.";

  // We only send the last few messages to save tokens and focus the model on the current topic
  const contextSnippet = messages
    .slice(-4)
    .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
    .join("\n");

  const userPrompt =
    mode === "title"
      ? `Based on this exchange, what is the succinct topic?\n\n${contextSnippet}`
      : `Generate a brief for this exchange:\n\n${contextSnippet}`;

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

    // 2. AGGRESSIVE CLEANING
    let cleaned =
      rawContent
        .replace(/<think>[\s\S]*?<\/think>/gi, "") // Remove reasoning tags
        .split("\n") // Split by lines
        .map((line: string) => line.trim()) // Trim each line
        .filter((line: string) => line.length > 0) // Remove empty lines
        .shift() || ""; // Take only the FIRST meaningful line

    // 3. NOISE REDUCTION: Remove common model filler prefixes
    cleaned = cleaned
      .replace(/^(the title is|here is a title|topic|subject)[:\s]*/gi, "")
      .replace(/["'#*]/g, "") // Remove quotes, hashes, and asterisks
      .trim();

    // Final check for length and quality
    if (mode === "title" && (cleaned.length < 2 || cleaned.length > 60)) {
      return messages[0]?.text.substring(0, 25) + "...";
    }

    return cleaned;
  } catch (error) {
    console.error("Metadata generation failed:", error);
    return messages[0]?.text.substring(0, 25) + "...";
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
