import React from "react";
import { StatusBadge } from "../ui/StatusBadge";
import { ControlCard } from "./ControlCard";
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
  isGenealogyMode: boolean;
  setIsGenealogyMode: (b: boolean) => void;
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
      {/* HEADER SECTION */}
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
          title="New Chat"
        >
          <span className="text-2xl font-bold">+</span>
        </button>
      </div>

      {/* HARDWARE STATUS */}
      <div className="mb-10">
        <StatusBadge isOnline={props.isOllamaOnline} label="Workstation" />
      </div>

      <div className="space-y-6 flex-grow">
        {/* THREAD HISTORY SECTION */}
        <ControlCard
          title="Archives"
          description={
            props.isSummarizing ? "Auditing History..." : "Recent Transmissions"
          }
        >
          <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {props.threads.length === 0 && (
              <p className="text-[10px] opacity-30 italic p-2">
                Empty silence...
              </p>
            )}
            {props.threads.map((t) => (
              <div
                key={t.id}
                onClick={() => props.onSelectThread(t.id)}
                className={`group p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  props.currentThreadId === t.id
                    ? "border-brilliant-rose bg-brilliant-rose/5"
                    : "border-transparent bg-bright-snow hover:border-saffron/30"
                }`}
              >
                <input
                  className="bg-transparent font-black text-[10px] uppercase w-full outline-none focus:text-brilliant-rose cursor-text truncate"
                  value={t.summary || "New Transmission"}
                  onChange={(e) => props.onRenameThread(t.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[8px] opacity-40">
                    {new Date(t.updatedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    — {new Date(t.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    {t.brief && (
                      <span className="text-[8px] text-saffron font-bold animate-pulse">
                        ● BRIEFED
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        props.onDeleteThread(t.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-brilliant-rose text-[10px] font-bold hover:scale-125 transition-all"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ControlCard>

        {/* INTELLIGENCE MAPPING */}
        <ControlCard title="Intelligence" description="Hardware Mapping">
          <select
            value={props.activeProviderId}
            onChange={(e) => props.setActiveProviderId(e.target.value as any)}
            className="w-full py-2 bg-transparent border-b-2 border-saffron font-bold text-sm outline-none focus:border-brilliant-rose transition-colors"
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
              {props.availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
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

        {/* CODING MODE RECURSIVE SCAN */}
        <ControlCard title="Coding Mode" description="Recursive Scan">
          <button
            onClick={props.handleScanCodebase}
            className={`w-full py-4 rounded-[2rem] border-2 font-black transition-all text-xs tracking-widest ${
              props.isCodingMode
                ? "bg-brilliant-rose border-graphite text-white shadow-md"
                : "border-brilliant-rose text-brilliant-rose hover:bg-brilliant-rose hover:text-white"
            }`}
          >
            {props.isCodingMode ? "● PROJECT READY" : "SCAN PROJECT"}
          </button>
        </ControlCard>

        {/* OBSIDIAN VAULT CONTEXT */}
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
            className="w-full bg-graphite text-white text-xs py-3 rounded-full font-black hover:bg-brilliant-rose transition-colors uppercase tracking-widest shadow-md active:scale-95"
          >
            SNAP CONTEXT
          </button>
        </ControlCard>
      </div>
    </aside>
  );
};
