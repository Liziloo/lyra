// src/components/sidebar/Sidebar.tsx
import React from "react";
import { StatusBadge } from "../ui/StatusBadge";
import { ControlCard } from "./ControlCard";
import { ThreadArchive } from "./ThreadArchive";
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

        <ControlCard title="Intelligence" description="Lyra-Namespace Models">
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
              {props.availableModels.length > 0 ? (
                props.availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))
              ) : (
                <option disabled>No lyra- models found</option>
              )}
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
      </div>
    </aside>
  );
};
