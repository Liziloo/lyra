import { readDir } from "@tauri-apps/plugin-fs";

export const projectService = {
  async scanProject(path: string, depth = 0): Promise<string> {
    if (depth > 2) return "";
    try {
      const entries = await readDir(path);
      let structure = "";
      for (const entry of entries) {
        if (
          entry.name.startsWith(".") ||
          entry.name === "node_modules" ||
          entry.name === "target"
        )
          continue;
        const indent = "  ".repeat(depth);
        structure += `${indent}${entry.isDirectory ? "📁" : "📄"} ${entry.name}\n`;
        if (entry.isDirectory) {
          structure += await this.scanProject(
            `${path}/${entry.name}`,
            depth + 1,
          );
        }
      }
      return structure;
    } catch (e) {
      return "[Error scanning directory]";
    }
  },
};
