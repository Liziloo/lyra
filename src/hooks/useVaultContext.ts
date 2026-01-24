import { useState } from "react";
import { obsidianService } from "../services/obsidianService";
import { projectService } from "../services/projectService";

export const useVaultContext = (initialPath: string) => {
  const [vaultPath, setVaultPath] = useState(initialPath);
  const [contextSnap, setContextSnap] = useState("");
  const [isCodingMode, setIsCodingMode] = useState(false);

  const handleScanCodebase = async () => {
    const path = await obsidianService.pickVaultFolder();
    if (path) {
      const map = await projectService.scanProject(path);
      setContextSnap(`[CODEBASE SCAN: ${path}]\n${map}`);
      setIsCodingMode(true);
    }
  };

  const snapRecentNotes = async () => {
    const notes = await obsidianService.getRecentNotesContext(vaultPath);
    setContextSnap(notes);
  };

  return {
    vaultPath,
    setVaultPath,
    contextSnap,
    setContextSnap,
    isCodingMode,
    setIsCodingMode,
    handleScanCodebase,
    snapRecentNotes,
  };
};
