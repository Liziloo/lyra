// src/components/sidebar/Sidebar.tsx

import React from "react";
import { StatusBadge } from "../ui/StatusBadge";
import { ControlCard } from "./ControlCard";
import { ThreadArchive } from "./ThreadArchive";
import { obsidianService } from "../../services/obsidianService";
import { Thread } from "../../types";

interface SidebarProps {
  width: number;
  isOllamaOnline: boolean;
  activeProviderId: "ollama" | "openrouter";
  setActiveProviderId: (id: "ollama" | "openrouter") => void;
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  availableModels: string[];
  isCodingMode: boolean;
  handleScanCodebase: () => void;
  vaultPath: string;
  setVaultPath: (p: string) => void;
  setContextSnap: (s: string) => void;
  threads: Thread[];
  currentThreadId: string;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
  onDeleteThread: (id: string) => void;
  onRenameThread: (id: string, name: string) => void;
  isSummarizing: boolean;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  return (
    <aside
      style={{ width: props.width }}
      className="flex-shrink-0 border-r-4 border-graphite flex flex-col p-6 sm:p-8 bg-white z-20 shadow-xl overflow-y-auto custom-scrollbar"
    >
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter text-graphite">
            LYRA{" "}
            <span className="text-brilliant-rose text-xl not-italic">V0.1</span>
          </h1>
          <div className="h-1.5 w-16 bg-brilliant-rose mt-2 rounded-full"></div>
        </div>
        <button
          onClick={props.onNewChat}
          className="bg-graphite text-white p-3 rounded-xl hover:bg-brilliant-rose transition-colors shadow-lg flex items-center justify-center w-10 h-10"
        >
          <span className="text-2xl font-bold">+</span>
        </button>
      </div>

      <div className="mb-10">
        <StatusBadge isOnline={props.isOllamaOnline} label="Workstation" />
      </div>

      <div className="space-y-6 flex-grow">
        <ThreadArchive
          threads={props.threads}
          currentThreadId={props.currentThreadId}
          isSummarizing={props.isSummarizing}
          onSelectThread={props.onSelectThread}
          onRenameThread={props.onRenameThread}
          onDeleteThread={props.onDeleteThread}
        />

        <ControlCard title="Intelligence" description="Hardware Mapping">
          <select
            value={props.activeProviderId}
            onChange={(e) => props.setActiveProviderId(e.target.value as any)}
            className="w-full py-2 bg-transparent border-b-2 border-saffron font-bold text-sm outline-none"
          >
            <option value="ollama">OLLAMA</option>
            <option value="openrouter">OPENROUTER</option>
          </select>

          {props.activeProviderId === "ollama" ? (
            <select
              value={props.selectedModel}
              onChange={(e) => props.setSelectedModel(e.target.value)}
              className="w-full mt-4 p-2 border-b-2 border-brilliant-rose bg-bright-snow font-bold text-xs outline-none"
              disabled={!props.isOllamaOnline}
            >
              {props.availableModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={props.selectedModel}
              onChange={(e) => props.setSelectedModel(e.target.value)}
              className="w-full mt-4 p-2 border-b-2 border-brilliant-rose bg-bright-snow text-xs outline-none font-bold"
              placeholder="Model ID"
            />
          )}
        </ControlCard>

        <ControlCard title="Coding Mode" description="Recursive Scan">
          <button
            onClick={props.handleScanCodebase}
            className={`w-full py-4 rounded-[2rem] border-2 font-black transition-all text-xs tracking-widest ${
              props.isCodingMode
                ? "bg-brilliant-rose text-white"
                : "border-brilliant-rose text-brilliant-rose"
            }`}
          >
            {props.isCodingMode ? "● PROJECT READY" : "SCAN PROJECT"}
          </button>
        </ControlCard>

        <ControlCard title="Vault" description="Obsidian knowledge">
          <button
            onClick={() =>
              obsidianService
                .pickVaultFolder()
                .then((p) => p && props.setVaultPath(p))
            }
            className="w-full text-left p-3 border-2 border-graphite/5 bg-bright-snow rounded-2xl text-[9px] truncate mb-2 italic"
          >
            {props.vaultPath || "MAP VAULT PATH..."}
          </button>
          <button
            onClick={async () =>
              props.setContextSnap(
                await obsidianService.getRecentNotesContext(props.vaultPath),
              )
            }
            className="w-full bg-graphite text-white text-xs py-3 rounded-full font-black uppercase tracking-widest"
          >
            SNAP CONTEXT
          </button>
        </ControlCard>
      </div>
    </aside>
  );
};
