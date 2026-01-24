import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Thread } from "../types";
import { threadService } from "../services/threadService";

export const useThreads = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThread, setCurrentThread] = useState<Thread>({
    id: uuidv4(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Load threads from disk on mount
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

  const createNewThread = () => {
    const newThread: Thread = {
      id: uuidv4(),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCurrentThread(newThread);
  };

  const switchThread = (id: string) => {
    const target = threads.find((t) => t.id === id);
    if (target) setCurrentThread(target);
  };

  const deleteThread = async (id: string) => {
    await threadService.deleteThread(id);
    const filtered = threads.filter((t) => t.id !== id);
    setThreads(filtered);
    if (currentThread.id === id) createNewThread();
  };

  return {
    threads,
    currentThread,
    setCurrentThread: saveCurrentThread,
    createNewThread,
    switchThread,
    deleteThread,
  };
};
