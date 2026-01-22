import { open } from "@tauri-apps/plugin-dialog";
import { readDir, readTextFile, writeFile, stat } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import { Thread } from "../types";

export const obsidianService = {
  async pickVaultFolder(): Promise<string | null> {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Select Obsidian Vault Folder",
    });
    return Array.isArray(selected) ? selected[0] : selected;
  },

  async getRecentNotesContext(vaultPath: string): Promise<string> {
    const entries = await readDir(vaultPath);
    const mdFiles = entries.filter((e) => e.name?.endsWith(".md"));

    const filesWithStats = await Promise.all(
      mdFiles.map(async (file) => {
        const filePath = await join(vaultPath, file.name);
        const s = await stat(filePath);
        return {
          name: file.name,
          path: filePath,
          mtime: s.mtime?.getTime() || 0,
        };
      }),
    );

    const recentFiles = filesWithStats
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 5);

    let context = "";
    for (const file of recentFiles) {
      const content = await readTextFile(file.path);
      context += `\n--- FILE: ${file.name} ---\n${content}\n`;
    }
    return context;
  },

  async saveChatToVault(vaultPath: string, thread: Thread): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `Lyra-Chat-${timestamp}.md`;
    const filePath = await join(vaultPath, fileName);

    const content = thread.messages
      .map((m) => `### ${m.role.toUpperCase()}\n${m.text}`)
      .join("\n\n");

    await writeFile(filePath, new TextEncoder().encode(content));
  },
};
