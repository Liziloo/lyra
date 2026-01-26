import {
  readDir,
  readTextFile,
  writeFile,
  mkdir,
  remove,
  BaseDirectory,
  exists,
} from "@tauri-apps/plugin-fs";
import { appLocalDataDir, join } from "@tauri-apps/api/path"; // Add these
import { Thread } from "../types";

const THREADS_DIR = "threads";

export const threadService = {
  async getThreadsPath() {
    // This helps us see where the app is trying to save files
    const base = await appLocalDataDir();
    return await join(base, THREADS_DIR);
  },

  async ensureDir() {
    try {
      const dirExists = await exists(THREADS_DIR, {
        baseDir: BaseDirectory.AppLocalData,
      });
      if (!dirExists) {
        // Create the threads folder.
        // recursive: true handles creating the parent (com.lyra.app) folder too.
        await mkdir(THREADS_DIR, {
          baseDir: BaseDirectory.AppLocalData,
          recursive: true,
        });
        console.log("SUCCESS: Created threads directory");
      }
    } catch (e) {
      console.error("FS Error (ensureDir):", e);
      throw e; // Don't swallow this during debugging
    }
  },

  async saveThread(thread: Thread): Promise<void> {
    try {
      await this.ensureDir();
      const fileName = `${THREADS_DIR}/${thread.id}.json`;
      const content = JSON.stringify(thread, null, 2);

      await writeFile(fileName, new TextEncoder().encode(content), {
        baseDir: BaseDirectory.AppLocalData,
      });

      // Get the full path just for the console log so you can go find it!
      const fullPath = await this.getThreadsPath();
      console.log(`FILE SAVED AT: ${fullPath}/${thread.id}.json`);
    } catch (e) {
      console.error("CRITICAL SAVE ERROR:", e);
    }
  },

  async getAllThreads(): Promise<Thread[]> {
    await this.ensureDir();
    try {
      const entries = await readDir(THREADS_DIR, {
        baseDir: BaseDirectory.AppLocalData,
      });
      const threads: Thread[] = [];

      for (const entry of entries) {
        if (entry.name.endsWith(".json")) {
          const content = await readTextFile(`${THREADS_DIR}/${entry.name}`, {
            baseDir: BaseDirectory.AppLocalData,
          });
          const parsed = JSON.parse(content);

          // Hydrate dates for the thread and every message
          const thread: Thread = {
            ...parsed,
            createdAt: new Date(parsed.createdAt),
            updatedAt: new Date(parsed.updatedAt),
            messages: parsed.messages.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            })),
          };
          threads.push(thread);
        }
      }
      return threads.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      );
    } catch (e) {
      console.error("Failed to load threads", e);
      return [];
    }
  },

  async deleteThread(id: string): Promise<void> {
    await remove(`${THREADS_DIR}/${id}.json`, {
      baseDir: BaseDirectory.AppLocalData,
    });
  },
};
