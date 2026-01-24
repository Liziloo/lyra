import {
  readDir,
  readTextFile,
  writeFile,
  mkdir,
  remove,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";
import { Thread } from "../types";

const THREADS_DIR = "threads";

export const threadService = {
  async ensureDir() {
    try {
      await mkdir(THREADS_DIR, {
        baseDir: BaseDirectory.AppLocalData,
        recursive: true,
      });
    } catch (e) {
      // Directory likely exists
    }
  },

  async saveThread(thread: Thread): Promise<void> {
    await this.ensureDir();
    const fileName = `${THREADS_DIR}/${thread.id}.json`;
    const content = JSON.stringify(thread, null, 2);
    await writeFile(fileName, new TextEncoder().encode(content), {
      baseDir: BaseDirectory.AppLocalData,
    });
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
