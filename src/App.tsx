import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

// Types
import { Message, Provider, Thread } from "./types";

// Services & Hooks
import { getOllamaModels, sendMessage } from "./services/llmService";
import { obsidianService } from "./services/obsidianService";
import { projectService } from "./services/projectService";
import { useHardwareCheck } from "./hooks/useHardwareCheck";

// Components
import { Sidebar } from "./components/sidebar/Sidebar";
import { MessageBubble } from "./components/chat/MessageBubble";
import { ChatDivider } from "./components/chat/ChatDivider";

const App = () => {
  // --- 1. Layout & State ---
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const isResizing = useRef(false);

  const ollamaBaseUrl =
    import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434";
  const [vaultPath, setVaultPath] = useState<string>(
    import.meta.env.VITE_OBSIDIAN_PATH || "",
  );
  const [openRouterKey] = useState<string>(
    import.meta.env.VITE_OPENROUTER_KEY || "",
  );

  const [contextSnap, setContextSnap] = useState<string>("");
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

  // --- 2. Handlers & Effects ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      setSidebarWidth(Math.max(260, Math.min(600, e.clientX)));
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
        if (models.length > 0 && !models.includes(selectedModel)) {
          setSelectedModel(models[0]);
        }
      }
    };
    refreshModels();
  }, [isOllamaOnline, activeProviderId, ollamaBaseUrl]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread.messages, isProcessing]);

  const handleScanCodebase = async () => {
    const path = await obsidianService.pickVaultFolder();
    if (path) {
      const map = await projectService.scanProject(path);
      setContextSnap(`[CODEBASE SCAN: ${path}]\n${map}`);
      setIsCodingMode(true);
      alert("Hardware context updated with project structure.");
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
    const newMessages = [...thread.messages, userMsg];
    setThread({ ...thread, messages: newMessages });
    setInputText("");
    setIsProcessing(true);

    try {
      const provider: Provider = {
        id: activeProviderId,
        name: activeProviderId === "ollama" ? "Ollama" : "OpenRouter",
        url:
          activeProviderId === "ollama"
            ? `${ollamaBaseUrl}/api/chat`
            : "https://openrouter.ai/api/v1/chat/completions",
        apiKey: activeProviderId === "openrouter" ? openRouterKey : "",
      };

      const aiResponseText = await sendMessage(newMessages, {
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
            text: aiResponseText,
            timestamp: new Date(),
          },
        ],
        updatedAt: new Date(),
      }));
      setContextSnap("");
      setIsCodingMode(false);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-bright-snow text-graphite overflow-hidden font-sans">
      <Sidebar
        width={sidebarWidth}
        isOllamaOnline={isOllamaOnline}
        activeProviderId={activeProviderId}
        setActiveProviderId={setActiveProviderId}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        availableModels={availableModels}
        isCodingMode={isCodingMode}
        handleScanCodebase={handleScanCodebase}
        vaultPath={vaultPath}
        setVaultPath={setVaultPath}
        setContextSnap={setContextSnap}
        isGenealogyMode={isGenealogyMode}
        setIsGenealogyMode={setIsGenealogyMode}
      />

      {/* DRAG HANDLE: The Gold Zipper */}
      <div
        onMouseDown={() => (isResizing.current = true)}
        className="w-1.5 cursor-col-resize bg-saffron hover:bg-brilliant-rose transition-all z-50 shadow-xl"
      />

      <main className="flex-grow flex flex-col relative bg-bright-snow">
        <div
          ref={scrollRef}
          className="flex-grow overflow-y-auto px-8 sm:px-16 py-12 space-y-10 custom-scrollbar"
        >
          {thread.messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <h2 className="text-5xl font-thin tracking-[0.5em] text-graphite uppercase mb-4 italic text-center">
                Lyra
              </h2>
              <div className="w-24 h-1 bg-saffron rounded-full"></div>
            </div>
          )}
          {thread.messages.map((m, idx) => (
            <div key={m.id}>
              {idx > 0 && idx % 4 === 0 && <ChatDivider label="Continuity" />}
              <MessageBubble message={m} />
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start ml-10">
              <div className="text-brilliant-rose font-black italic text-xs animate-pulse tracking-widest uppercase">
                Consulting Intelligence...
              </div>
            </div>
          )}
        </div>

        {/* INPUT DOCK */}
        <div className="p-6 sm:p-10 bg-white border-t-2 border-saffron/10">
          <div className="max-w-5xl mx-auto flex items-end space-x-6">
            <div className="flex-grow relative group">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSend()
                }
                placeholder="Direct Lyra..."
                className="w-full p-6 sm:p-8 pr-20 bg-bright-snow border-2 border-graphite rounded-[2.5rem] sm:rounded-[3rem] text-base sm:text-lg text-graphite outline-none focus:border-brilliant-rose focus:ring-4 focus:ring-brilliant-rose/5 transition-all resize-none h-28 sm:h-32 font-bold placeholder:italic"
              />
              <button
                onClick={handleSend}
                disabled={isProcessing}
                className="absolute right-4 bottom-4 sm:right-6 sm:bottom-6 bg-brilliant-rose text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all border-4 border-white"
              >
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </button>
            </div>
            <button
              onClick={() => obsidianService.saveChatToVault(vaultPath, thread)}
              className="hidden sm:block p-6 bg-white border-4 border-saffron text-graphite font-black text-xs rounded-[2rem] shadow-xl hover:bg-saffron hover:text-white transition-all whitespace-nowrap uppercase tracking-widest"
            >
              SAVE TO VAULT
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
