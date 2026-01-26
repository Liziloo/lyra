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
  summary?: string; // The human-readable title
  brief?: string; // The background situational summary
  isCustomName?: boolean; // Prevents AI from overwriting a manual rename
  createdAt: Date;
  updatedAt: Date;
}
