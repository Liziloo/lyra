// src/hooks/useThreads.ts
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Thread, Provider } from "../types";
import { threadService } from "../services/threadService";
import { generateThreadMetadata } from "../services/llmService";

export const useThreads = (
  currentProvider?: Provider,
  metadataModel?: string,
) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [currentThread, setCurrentThread] = useState<Thread>({
    id: uuidv4(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  useEffect(() => {
    threadService.getAllThreads().then((saved) => {
      setThreads(saved);
      if (saved.length > 0) setCurrentThread(saved[0]);
    });
  }, []);

  const saveCurrentThread = async (updatedThread: Thread) => {
    setCurrentThread(updatedThread);
    await threadService.saveThread(updatedThread);
    const all = await threadService.getAllThreads();
    setThreads(all);
  };

  const switchThread = async (id: string) => {
    const target = threads.find((t) => t.id === id);
    if (!target) return;
    setCurrentThread(target);

    // Background Briefing: Use the metadataModel
    if (
      target.messages.length >= 2 &&
      !target.brief &&
      currentProvider &&
      metadataModel &&
      !isSummarizing
    ) {
      setIsSummarizing(true);
      try {
        const brief = await generateThreadMetadata(
          target.messages,
          {
            provider: currentProvider,
            model: metadataModel, // FORCE UTILITY MODEL
            isGenealogyExpert: false,
            contextNotes: "",
          },
          "brief",
        );
        await saveCurrentThread({ ...target, brief, updatedAt: new Date() });
      } catch (e) {
        console.error("Briefing failed", e);
      } finally {
        setIsSummarizing(false);
      }
    }
  };

  const renameThread = async (id: string, name: string) => {
    const updated = threads.map((t) =>
      t.id === id ? { ...t, summary: name, isCustomName: true } : t,
    );
    setThreads(updated);
    const target = updated.find((t) => t.id === id);
    if (target) await threadService.saveThread(target);
  };

  return {
    threads,
    currentThread,
    setCurrentThread: saveCurrentThread,
    createNewThread: () =>
      setCurrentThread({
        id: uuidv4(),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    switchThread,
    deleteThread: async (id: string) => {
      await threadService.deleteThread(id);
      const filtered = threads.filter((t) => t.id !== id);
      setThreads(filtered);
      if (currentThread.id === id)
        setCurrentThread({
          id: uuidv4(),
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
    },
    renameThread,
    isSummarizing,
  };
};
