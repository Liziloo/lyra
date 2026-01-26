// src/services/llmService.ts

import { fetch } from "@tauri-apps/plugin-http";
import { Message, LLMOptions } from "../types";

export const sendMessage = async (
  messages: Message[],
  options: LLMOptions,
): Promise<string> => {
  const { provider, model, contextNotes, systemOverride } = options;

  let systemContent =
    systemOverride || "You are Lyra, a helpful and precise AI assistant.";

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
  const systemInstruction =
    mode === "title"
      ? "Provide a 3-5 word plain text title for this chat. NO quotes, NO 'Title:', NO filler."
      : "Summarize this exchange into a 2-paragraph Situational Brief for continuity.";

  const contextSnippet = messages
    .slice(-4)
    .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
    .join("\n");

  try {
    const rawContent = await sendMessage(messages, {
      ...options,
      systemOverride: systemInstruction,
      contextNotes: contextSnippet,
    });

    let cleaned =
      rawContent
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .shift() || "";

    cleaned = cleaned
      .replace(/^(title|topic|subject|summary)[:\s]*/gi, "")
      .replace(/^\d+\.\s*/, "")
      .replace(/["'#*]/g, "")
      .trim();

    if (mode === "title" && cleaned.length > 50) {
      cleaned = cleaned.substring(0, 47) + "...";
    }

    return cleaned || (mode === "title" ? "New Transmission" : "");
  } catch (error) {
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
