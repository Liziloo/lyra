import { open } from "@tauri-apps/plugin-dialog";
import { readDir, readTextFile, writeFile, stat } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import { Thread } from "../types";

export const obsidianService = {
  /**
   * Opens a native dialog to select the Obsidian Vault folder.
   * Uses Tauri v2 dialog plugin.
   */
  async pickVaultFolder(): Promise<string | null> {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Select Obsidian Vault Folder",
    });
    return Array.isArray(selected) ? selected[0] : selected;
  },

  /**
   * Reads top 5 most recently modified .md files for context injection.
   * Limits results to .md files only.
   */
  async getRecentNotesContext(vaultPath: string): Promise<string> {
    const entries = await readDir(vaultPath);
    const mdFiles = entries.filter((e) => e.name?.endsWith(".md"));

    // Get metadata to determine last modified time
    const filesWithStats = await Promise.all(
      mdFiles.map(async (file) => {
        const filePath = await join(vaultPath, file.name);
        const s = await stat(filePath);
        // mtime is preferred, fallback to 0
        return {
          name: file.name,
          path: filePath,
          mtime: s.mtime?.getTime() || 0,
        };
      }),
    );

    // Sort descending by modified time and take the top 5
    const recentFiles = filesWithStats
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 5);

    let contextString = "";
    for (const file of recentFiles) {
      const content = await readTextFile(file.path);
      contextString += `--- FILE: ${file.name} ---\n${content}\n\n`;
    }

    return contextString;
  },

  /**
   * Exports a specific Thread history as a Markdown file.
   * Uses the updated Message interface (role/text/timestamp).
   */
  async saveChatToVault(vaultPath: string, thread: Thread): Promise<void> {
    // Generate a unique filename using thread ID or current timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `Lyra-Thread-${thread.id.slice(0, 8)}-${timestamp}.md`;
    const filePath = await join(vaultPath, fileName);

    // Format messages based on the index.ts Message interface
    const chatBody = thread.messages
      .map((m) => {
        const speaker = m.role.charAt(0).toUpperCase() + m.role.slice(1);
        const time = new Date(m.timestamp).toLocaleTimeString();
        return `### ${speaker} (${time})\n${m.text}`;
      })
      .join("\n\n---\n\n");

    const frontmatter = [
      "---",
      `thread_id: "${thread.id}"`,
      `created: ${thread.createdAt.toISOString()}`,
      `exported: ${new Date().toISOString()}`,
      "tags: [project-lyra, genealogy-chat]",
      "---",
      "",
      "# Chat History",
      "",
    ].join("\n");

    // Convert string to Uint8Array for Tauri v2 writeFile
    const encoder = new TextEncoder();
    await writeFile(filePath, encoder.encode(frontmatter + chatBody));
  },
};
