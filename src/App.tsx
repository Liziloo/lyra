import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

// Types
import { Message, Provider, Thread } from "./types";

// Services & Hooks
import { getOllamaModels, sendMessage } from "./services/llmService";
import { obsidianService } from "./services/obsidianService";
import { useHardwareCheck } from "./hooks/useHardwareCheck";

// Components
import { StatusBadge } from "./components/ui/StatusBadge";
import { MessageBubble } from "./components/chat/MessageBubble";
import { ChatDivider } from "./components/chat/ChatDivider";
import { ControlCard } from "./components/sidebar/ControlCard";

const App = () => {
  // --- 1. State Management ---
  const [contextSnap, setContextSnap] = useState<string>("");
  const [vaultPath, setVaultPath] = useState<string>(
    localStorage.getItem("lyra_vault_path") || "",
  );
  const [openRouterKey, setOpenRouterKey] = useState<string>(
    localStorage.getItem("lyra_or_key") || "",
  );
  const [isGenealogyMode, setIsGenealogyMode] = useState(false);
  const [activeProviderId, setActiveProviderId] = useState<
    "ollama" | "openrouter"
  >("ollama");
  const [selectedModel, setSelectedModel] = useState("llama3.2");
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const ollamaBaseUrl =
    import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434";

  // Current Chat Thread
  const [thread, setThread] = useState<Thread>({
    id: uuidv4(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const { isOllamaOnline } = useHardwareCheck();

  // --- 2. Dynamic Model Refresh ---
  useEffect(() => {
    const refreshModels = async () => {
      if (isOllamaOnline && activeProviderId === "ollama") {
        const models = await getOllamaModels(ollamaBaseUrl);
        setAvailableModels(models);

        // If current selected model isn't in the new list,
        // default to the first available model
        if (models.length > 0 && !models.includes(selectedModel)) {
          setSelectedModel(models[0]);
        }
      }
    };
    refreshModels();
  }, [isOllamaOnline, activeProviderId, ollamaBaseUrl]);

  // --- 3. Persist Settings ---
  useEffect(() => {
    localStorage.setItem("lyra_vault_path", vaultPath);
    localStorage.setItem("lyra_or_key", openRouterKey);
  }, [vaultPath, openRouterKey]);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread.messages]);

  // --- 4. Orchestration Logic ---

  const handlePickVault = async () => {
    const path = await obsidianService.pickVaultFolder();
    if (path) setVaultPath(path);
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
        contextNotes: contextSnap, // Pass the snap here!
      });

      const aiMsg: Message = {
        id: uuidv4(),
        role: "assistant",
        text: aiResponseText,
        timestamp: new Date(),
      };

      setThread((prev) => ({
        ...prev,
        messages: [...prev.messages, aiMsg],
        updatedAt: new Date(),
      }));

      setContextSnap(""); // Clear snap after use
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    if (!vaultPath) return alert("Select a vault path first");
    await obsidianService.saveChatToVault(vaultPath, thread);
    alert("Chat saved to Obsidian!");
  };

  const handleInjectContext = async () => {
    if (!vaultPath) return alert("Select vault first");
    const notes = await obsidianService.getRecentNotesContext(vaultPath);
    setContextSnap(notes); // Store it silently
    alert("Context Snapped! (Top 5 notes added to next message)");
  };

  return (
    <div className="flex h-screen w-full bg-white text-graphite overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-80 border-r border-gray-200 flex flex-col p-6 bg-bright-snow/30 overflow-y-auto">
        <h1 className="text-2xl font-black mb-6 tracking-tighter text-graphite">
          LYRA{" "}
          <span className="text-brilliant-rose font-mono text-sm">v0.1</span>
        </h1>

        <StatusBadge isOnline={isOllamaOnline} label="Workstation" />

        <div className="mt-8 space-y-2">
          <ControlCard
            title="Direct Brain"
            description="Select your intelligence provider"
          >
            <select
              value={activeProviderId}
              onChange={(e) => setActiveProviderId(e.target.value as any)}
              className="w-full p-2 rounded border border-gray-300 bg-white text-sm focus:ring-1 focus:ring-brilliant-rose outline-none"
            >
              <option value="ollama">Ollama (Remote)</option>
              <option value="openrouter">OpenRouter (Cloud)</option>
            </select>

            {/* DYNAMIC MODEL PICKER */}
            {activeProviderId === "ollama" ? (
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full mt-2 p-2 rounded border border-gray-300 bg-white text-sm focus:ring-1 focus:ring-brilliant-rose outline-none"
                disabled={!isOllamaOnline}
              >
                {availableModels.length > 0 ? (
                  availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))
                ) : (
                  <option value="">
                    {isOllamaOnline ? "Loading..." : "Ollama Offline"}
                  </option>
                )}
              </select>
            ) : (
              <input
                type="text"
                placeholder="OpenRouter Model ID"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full mt-2 p-2 rounded border border-gray-300 text-sm focus:ring-1 focus:ring-brilliant-rose outline-none"
              />
            )}

            {activeProviderId === "openrouter" && (
              <input
                type="password"
                placeholder="OpenRouter API Key"
                value={openRouterKey}
                onChange={(e) => setOpenRouterKey(e.target.value)}
                className="w-full mt-2 p-2 rounded border border-gray-300 text-sm focus:ring-1 focus:ring-brilliant-rose outline-none"
              />
            )}
          </ControlCard>

          <ControlCard
            title="Obsidian Context"
            description="Map your genealogy vault"
          >
            <button
              onClick={handlePickVault}
              className="w-full text-left p-2 rounded border border-gray-300 bg-white text-[10px] truncate mb-2 hover:bg-gray-50 transition-colors"
            >
              {vaultPath || "Select Vault Folder..."}
            </button>
            <button
              onClick={handleInjectContext}
              className="w-full bg-graphite text-white text-xs py-2 rounded font-bold hover:bg-black transition-colors"
            >
              READ RECENT NOTES
            </button>
          </ControlCard>

          <ControlCard title="Expertise Toggle">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isGenealogyMode}
                onChange={(e) => setIsGenealogyMode(e.target.checked)}
                className="w-4 h-4 accent-brilliant-rose"
              />
              <span className="text-sm font-medium group-hover:text-brilliant-rose transition-colors">
                Genealogy Expert
              </span>
            </label>
          </ControlCard>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-grow flex flex-col relative">
        <div
          ref={scrollRef}
          className="flex-grow overflow-y-auto px-12 py-8 space-y-2"
        >
          {thread.messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ChatDivider label="New Session" />
              <p className="text-sm italic">Ready for input.</p>
            </div>
          )}

          {thread.messages.map((m, idx) => (
            <div key={m.id}>
              {idx > 0 && idx % 4 === 0 && <ChatDivider />}
              <MessageBubble message={m} />
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-bright-snow px-4 py-2 rounded-lg text-xs animate-pulse border border-gray-200">
                Lyra is thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Dock */}
        <div className="p-8 border-t border-gray-100 bg-white/80 backdrop-blur-md">
          <div className="max-w-4xl mx-auto flex items-end space-x-4">
            <div className="flex-grow relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSend()
                }
                placeholder="Ask Project Lyra..."
                className="w-full p-4 pr-12 rounded-2xl border-2 border-graphite shadow-[4px_4px_0px_0px_rgba(51,51,51,1)] focus:outline-none focus:ring-2 focus:ring-brilliant-rose resize-none h-24 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={isProcessing}
                className="absolute right-4 bottom-4 p-2 bg-brilliant-rose text-white rounded-xl hover:scale-110 active:scale-95 transition-transform disabled:bg-gray-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </button>
            </div>

            <button
              onClick={handleExport}
              title="Save to Vault"
              className="p-4 rounded-2xl border-2 border-saffron text-saffron hover:bg-saffron hover:text-white transition-all font-bold text-xs whitespace-nowrap"
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
