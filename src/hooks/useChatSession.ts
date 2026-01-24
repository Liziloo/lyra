import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { sendMessage } from "../services/llmService";
import { Thread, Message, Provider } from "../types";

interface ChatSessionOptions {
  activeProviderId: "ollama" | "openrouter";
  selectedModel: string;
  isGenealogyMode: boolean;
  contextSnap: string;
  openRouterKey: string;
  ollamaBaseUrl: string;
}

export const useChatSession = (
  thread: Thread,
  onThreadUpdate: (t: Thread) => void,
  clearContext: () => void,
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState(""); // <--- ADD THIS

  const send = async (text: string, options: ChatSessionOptions) => {
    if (!text.trim() || isProcessing) return;

    const userMsg: Message = {
      id: uuidv4(),
      role: "user",
      text,
      timestamp: new Date(),
    };

    const updatedMessages = [...thread.messages, userMsg];

    // UI Update: Clear input immediately and show user message
    setInputText("");
    setIsProcessing(true);

    try {
      const provider: Provider = {
        id: options.activeProviderId,
        name: options.activeProviderId === "ollama" ? "Ollama" : "OpenRouter",
        url:
          options.activeProviderId === "ollama"
            ? `${options.ollamaBaseUrl}/api/chat`
            : "https://openrouter.ai/api/v1/chat/completions",
        apiKey:
          options.activeProviderId === "openrouter"
            ? options.openRouterKey
            : "",
      };

      const aiResponse = await sendMessage(updatedMessages, {
        provider,
        model: options.selectedModel,
        isGenealogyExpert: options.isGenealogyMode,
        contextNotes: options.contextSnap,
      });

      const finalThread: Thread = {
        ...thread,
        messages: [
          ...updatedMessages,
          {
            id: uuidv4(),
            role: "assistant",
            text: aiResponse,
            timestamp: new Date(),
          },
        ],
        updatedAt: new Date(),
      };

      onThreadUpdate(finalThread);
      clearContext();
    } catch (err: any) {
      // If it fails, we might want to put the text back so the user doesn't lose it
      setInputText(text);
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Return all four properties needed by App.tsx
  return { send, isProcessing, inputText, setInputText };
};
