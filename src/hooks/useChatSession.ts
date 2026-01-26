// src/hooks/useChatSession.ts

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { sendMessage, generateThreadMetadata } from "../services/llmService";
import { Thread, Message, Provider, ChatSessionOptions } from "../types";

export const useChatSession = (
  thread: Thread,
  onThreadUpdate: (t: Thread) => void,
  clearContext: () => void,
  metadataModel: string,
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState("");

  const send = async (text: string, options: ChatSessionOptions) => {
    if (!text.trim() || isProcessing) return;

    const provider: Provider = {
      id: options.activeProviderId,
      name: options.activeProviderId === "ollama" ? "Ollama" : "OpenRouter",
      url:
        options.activeProviderId === "ollama"
          ? `${options.ollamaBaseUrl}/api/chat`
          : "https://openrouter.ai/api/v1/chat/completions",
      apiKey:
        options.activeProviderId === "openrouter" ? options.openRouterKey : "",
    };

    const userMsg: Message = {
      id: uuidv4(),
      role: "user",
      text,
      timestamp: new Date(),
    };
    const updatedMessages = [...thread.messages, userMsg];

    setInputText("");
    setIsProcessing(true);

    try {
      const aiResponse = await sendMessage(updatedMessages, {
        provider,
        model: options.selectedModel,
        contextNotes: options.contextSnap,
        systemOverride: thread.brief
          ? `SITUATIONAL BRIEF: ${thread.brief}`
          : undefined,
      });

      let finalThread: Thread = {
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

      if (thread.messages.length === 0 && !thread.isCustomName) {
        const title = await generateThreadMetadata(
          finalThread.messages,
          {
            provider,
            model: metadataModel,
            contextNotes: "",
          },
          "title",
        );
        finalThread.summary = title;
      }

      onThreadUpdate(finalThread);
      clearContext();
    } catch (err: any) {
      setInputText(text);
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return { send, isProcessing, inputText, setInputText };
};
