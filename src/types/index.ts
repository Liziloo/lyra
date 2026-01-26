// src/types/index.ts

export interface Message {
  id: string;
  text: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
}

export interface Provider {
  id: string;
  name: string;
  url: string;
  apiKey: string;
}

export interface Thread {
  id: string;
  messages: Message[];
  summary?: string;
  brief?: string;
  isCustomName?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LLMOptions {
  provider: Provider;
  model: string;
  contextNotes: string;
  systemOverride?: string;
}

export interface ChatSessionOptions {
  activeProviderId: "ollama" | "openrouter";
  selectedModel: string;
  contextSnap: string;
  openRouterKey: string;
  ollamaBaseUrl: string;
}
