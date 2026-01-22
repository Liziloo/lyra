import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

// Types & Services
import { Message, Provider, Thread } from "./types";
import { getOllamaModels, sendMessage } from "./services/llmService";
import { obsidianService } from "./services/obsidianService";
import { projectService } from "./services/projectService";
import { useHardwareCheck } from "./hooks/useHardwareCheck";

// Components
import { StatusBadge } from "./components/ui/StatusBadge";
import { MessageBubble } from "./components/chat/MessageBubble";
import { ChatDivider } from "./components/chat/ChatDivider";
import { ControlCard } from "./components/sidebar/ControlCard";

const App = () => {
  // --- 1. Sizing (The Non-Squishable Sidebar) ---
  const [sidebarWidth, setSidebarWidth] = useState(340);
  const isResizing = useRef(false);

  // --- 2. State (Env Variable Sources) ---
  const ollamaBaseUrl =
    import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434";
  const [vaultPath, setVaultPath] = useState(
    import.meta.env.VITE_OBSIDIAN_PATH || "",
  );
  const [openRouterKey] = useState(import.meta.env.VITE_OPENROUTER_KEY || "");

  const [contextSnap, setContextSnap] = useState("");
  const [isGenealogyMode, setIsGenealogyMode] = useState(false);
  const [isCodingMode, setIsCodingMode] = useState(false);

  const [activeProviderId, setActiveProviderId] = useState<
    "ollama" | "openrouter"
  >("ollama");
  const [selectedModel, setSelectedModel] = useState("llama3.2");
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const [thread, setThread] = useState<Thread>({
    id: uuidv4(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const { isOllamaOnline } = useHardwareCheck();

  // --- 3. Interaction Logic ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      setSidebarWidth(Math.max(280, Math.min(500, e.clientX)));
    };
    const handleMouseUp = () => {
      isResizing.current = false;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const refreshModels = async () => {
      if (isOllamaOnline && activeProviderId === "ollama") {
        const models = await getOllamaModels(ollamaBaseUrl);
        setAvailableModels(models);
        if (models.length > 0 && !models.includes(selectedModel))
          setSelectedModel(models[0]);
      }
    };
    refreshModels();
  }, [isOllamaOnline, activeProviderId, ollamaBaseUrl]);

  const handleScanCodebase = async () => {
    const path = await obsidianService.pickVaultFolder();
    if (path) {
      const map = await projectService.scanProject(path);
      setContextSnap(`[PROJECT STRUCTURE]:\n${map}`);
      setIsCodingMode(true);
      alert("Codebase context attached.");
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isProcessing) return;
    const userMsg: Message = {
      id: uuidv4(),
      role: "user",
      text: inputText,
      timestamp: new Date(),
    };
    setThread((prev) => ({ ...prev, messages: [...prev.messages, userMsg] }));
    setInputText("");
    setIsProcessing(true);

    try {
      const provider: Provider = {
        id: activeProviderId,
        url:
          activeProviderId === "ollama"
            ? `${ollamaBaseUrl}/api/chat`
            : "https://openrouter.ai/api/v1/chat/completions",
        apiKey: openRouterKey,
        name: activeProviderId,
      };

      const response = await sendMessage([...thread.messages, userMsg], {
        provider,
        model: selectedModel,
        isGenealogyExpert: isGenealogyMode,
        contextNotes: contextSnap,
      });

      setThread((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: uuidv4(),
            role: "assistant",
            text: response,
            timestamp: new Date(),
          },
        ],
        updatedAt: new Date(),
      }));
      setContextSnap("");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-bright-snow text-graphite font-sans overflow-hidden">
      {/* SIDEBAR: Structural, Curvy, Competent */}
      <aside
        style={{ width: sidebarWidth }}
        className="flex-shrink-0 flex flex-col bg-white border-r-2 border-saffron/30 p-8 z-20"
      >
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-black italic tracking-tighter text-brilliant-rose">
            LYRA
          </h1>
          <div className="h-1 w-12 bg-saffron mx-auto mt-2 rounded-full"></div>
        </div>

        <div className="flex justify-center mb-8">
          <StatusBadge isOnline={isOllamaOnline} label="WORKSTATION" />
        </div>

        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          <ControlCard title="Intelligence" description="Direct Mapping">
            <select
              value={activeProviderId}
              onChange={(e) => setActiveProviderId(e.target.value as any)}
              className="w-full bg-bright-snow border-b-2 border-saffron py-2 text-sm font-bold pink-glow-focus"
            >
              <option value="ollama">OLLAMA</option>
              <option value="openrouter">OPENROUTER</option>
            </select>
          </ControlCard>

          <ControlCard title="Coding Mode" description="Codebase Access">
            <button
              onClick={handleScanCodebase}
              className={`w-full py-4 rounded-[2rem] border-2 font-black transition-all ${isCodingMode ? "bg-brilliant-rose border-graphite text-white" : "border-brilliant-rose text-brilliant-rose hover:bg-brilliant-rose hover:text-white"}`}
            >
              {isCodingMode ? "PROJECT LOADED" : "SCAN PROJECT"}
            </button>
          </ControlCard>

          <ControlCard title="Knowledge" description="Genealogy Vault">
            <button
              onClick={() =>
                obsidianService
                  .pickVaultFolder()
                  .then((p) => p && setVaultPath(p))
              }
              className="w-full text-left bg-bright-snow border border-graphite/10 p-3 rounded-2xl text-[10px] truncate italic"
            >
              {vaultPath || "SELECT VAULT FOLDER..."}
            </button>
          </ControlCard>

          <div className="p-4 rounded-[2rem] bg-brilliant-rose/5 border border-brilliant-rose/20">
            <label className="flex items-center space-x-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={isGenealogyMode}
                onChange={(e) => setIsGenealogyMode(e.target.checked)}
                className="w-5 h-5 accent-brilliant-rose"
              />
              <span className="text-xs font-black uppercase tracking-widest text-graphite group-hover:text-brilliant-rose">
                Genealogy Expert
              </span>
            </label>
          </div>
        </div>
      </aside>

      {/* DRAG HANDLE: The Gold "Zipper" */}
      <div
        onMouseDown={() => {
          isResizing.current = true;
        }}
        className="w-1.5 cursor-col-resize bg-gradient-to-b from-transparent via-saffron/40 to-transparent hover:via-brilliant-rose transition-all z-50"
      />

      {/* MAIN CHAT */}
      <main className="flex-grow flex flex-col p-10 bg-bright-snow">
        <div
          ref={scrollRef}
          className="flex-grow overflow-y-auto space-y-8 pr-4 custom-scrollbar"
        >
          {thread.messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <p className="text-sm font-light tracking-[.8em] uppercase">
                Standby for Command
              </p>
            </div>
          )}
          {thread.messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {isProcessing && (
            <div className="text-brilliant-rose font-bold italic text-xs animate-pulse tracking-widest uppercase">
              Consulting Intelligence...
            </div>
          )}
        </div>

        {/* INPUT: The Curvy Command Center */}
        <div className="mt-8 max-w-5xl mx-auto w-full">
          <div className="relative group">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSend()
              }
              placeholder="Your instructions..."
              className="w-full p-8 bg-white border-2 border-saffron/30 rounded-[3rem] text-lg text-graphite shadow-xl pink-glow-focus group-hover:border-brilliant-rose transition-all min-h-32"
            />
            <button
              onClick={handleSend}
              className="absolute right-6 bottom-6 bg-graphite text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-brilliant-rose hover:scale-110 active:scale-95 transition-all"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
