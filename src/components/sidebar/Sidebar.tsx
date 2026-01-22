import React from "react";
import { StatusBadge } from "../ui/StatusBadge";
import { ControlCard } from "./ControlCard";
import { obsidianService } from "../../services/obsidianService";

interface SidebarProps {
  width: number;
  isOllamaOnline: boolean;
  activeProviderId: string;
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
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  return (
    <aside
      style={{ width: props.width }}
      className="flex-shrink-0 border-r-4 border-graphite flex flex-col p-6 sm:p-8 bg-white z-20 shadow-xl overflow-y-auto custom-scrollbar"
    >
      <div className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter text-graphite">
          LYRA{" "}
          <span className="text-brilliant-rose text-xl not-italic">V0.1</span>
        </h1>
        <div className="h-1.5 w-16 bg-brilliant-rose mt-2 rounded-full"></div>
      </div>

      <div className="mb-10">
        <StatusBadge isOnline={props.isOllamaOnline} label="Workstation" />
      </div>

      <div className="space-y-6">
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
            className="w-full bg-graphite text-white text-xs py-3 rounded-full font-black hover:bg-brilliant-rose transition-colors uppercase tracking-widest"
          >
            SNAP CONTEXT
          </button>
        </ControlCard>

        <div className="p-6 rounded-[2.5rem] bg-white border-4 border-brilliant-rose text-brilliant-rose shadow-lg mt-4">
          <label className="flex items-center space-x-4 cursor-pointer">
            <input
              type="checkbox"
              checked={props.isGenealogyMode}
              onChange={(e) => props.setIsGenealogyMode(e.target.checked)}
              className="w-6 h-6 accent-brilliant-rose"
            />
            <span className="text-xs font-black uppercase tracking-tighter">
              Genealogy Expert
            </span>
          </label>
        </div>
      </div>
    </aside>
  );
};
