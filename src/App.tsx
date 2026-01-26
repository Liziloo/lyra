// src/App.tsx
import React, { useRef, useEffect } from "react";
import { useHardwareCheck } from "./hooks/useHardwareCheck";
import { useSidebarResize } from "./hooks/useSidebarResize";
import { useModelManager } from "./hooks/useModelManager";
import { useVaultContext } from "./hooks/useVaultContext";
import { useThreads } from "./hooks/useThreads";
import { useChatSession } from "./hooks/useChatSession";

// Services
import { obsidianService } from "./services/obsidianService";

// Components
import { Sidebar } from "./components/sidebar/Sidebar";
import { MessageBubble } from "./components/chat/MessageBubble";
import { ChatDivider } from "./components/chat/ChatDivider";
import { ChatInput } from "./components/chat/ChatInput";

const App = () => {
  const OLLAMA_URL =
    import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434";
  const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY || "";
  const OBSIDIAN_PATH = import.meta.env.VITE_OBSIDIAN_PATH || "";
  const METADATA_MODEL = "llama3.2:1b";

  // NEW STATE: Vault Toggle
  const [isVaultActive, setIsVaultActive] = React.useState(false);

  const { isOllamaOnline } = useHardwareCheck();
  const { width: sidebarWidth, startResizing } = useSidebarResize(320);
  const models = useModelManager(isOllamaOnline, OLLAMA_URL);
  const vault = useVaultContext(OBSIDIAN_PATH);

  const {
    threads,
    currentThread,
    setCurrentThread,
    createNewThread,
    switchThread,
    deleteThread,
    renameThread,
    isSummarizing,
  } = useThreads(
    {
      id: models.activeProviderId,
      name: models.activeProviderId === "ollama" ? "Ollama" : "OpenRouter",
      url:
        models.activeProviderId === "ollama"
          ? `${OLLAMA_URL}/api/chat`
          : "https://openrouter.ai/api/v1/chat/completions",
      apiKey: models.activeProviderId === "openrouter" ? OPENROUTER_KEY : "",
    },
    METADATA_MODEL,
  );

  const { send, isProcessing, inputText, setInputText } = useChatSession(
    currentThread,
    setCurrentThread,
    () => {
      vault.setIsCodingMode(false);
    },
    METADATA_MODEL,
  );

  // 3. Auto-scroll Logic
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [currentThread.messages, isProcessing]);

  // 4. Integrated Send Handler (The "Invisible" Context Snapper)
  const handleSend = async () => {
    if (!inputText.trim() || isProcessing) return;

    let finalContext = "";

    // 1. If Coding Mode is ON, we always send the file structure scan
    if (vault.isCodingMode) {
      finalContext = vault.contextSnap;
    }
    // 2. Else, if the User explicitly toggled the Vault Link
    else if (isVaultActive && OBSIDIAN_PATH) {
      try {
        finalContext =
          await obsidianService.getRecentNotesContext(OBSIDIAN_PATH);
      } catch (e) {
        console.error("Vault snap failed:", e);
      }
    }

    send(inputText, {
      activeProviderId: models.activeProviderId,
      selectedModel: models.selectedModel,
      contextSnap: finalContext,
      openRouterKey: OPENROUTER_KEY,
      ollamaBaseUrl: OLLAMA_URL,
    });
  };

  return (
    <div className="flex h-screen w-full bg-bright-snow text-graphite overflow-hidden">
      <Sidebar
        width={sidebarWidth}
        isOllamaOnline={isOllamaOnline}
        activeProviderId={models.activeProviderId}
        setActiveProviderId={models.setActiveProviderId}
        selectedModel={models.selectedModel}
        setSelectedModel={models.setSelectedModel}
        availableModels={models.availableModels}
        isCodingMode={vault.isCodingMode}
        handleScanCodebase={vault.handleScanCodebase}
        threads={threads}
        currentThreadId={currentThread.id}
        onSelectThread={switchThread}
        onNewChat={createNewThread}
        onDeleteThread={deleteThread}
        onRenameThread={renameThread}
        isSummarizing={isSummarizing}
      />

      <div
        onMouseDown={startResizing}
        className="w-1.5 cursor-col-resize bg-saffron hover:bg-brilliant-rose z-50 transition-colors"
      />

      <main className="flex-grow flex flex-col relative bg-bright-snow">
        <div
          ref={scrollRef}
          className="flex-grow overflow-y-auto px-8 sm:px-16 py-12 space-y-10 custom-scrollbar"
        >
          {currentThread.messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <h2 className="text-5xl font-thin tracking-[0.5em] uppercase italic">
                Lyra
              </h2>
              <div className="w-24 h-1 bg-saffron rounded-full mt-4"></div>
            </div>
          )}

          {currentThread.messages.map((m, idx) => (
            <div key={m.id}>
              {idx > 0 && idx % 4 === 0 && <ChatDivider label="Continuity" />}
              <MessageBubble message={m} />
            </div>
          ))}

          {isProcessing && (
            <div className="text-brilliant-rose font-black italic text-xs animate-pulse tracking-widest uppercase ml-10">
              Consulting Intelligence...
            </div>
          )}
        </div>

        <ChatInput
          value={inputText}
          onChange={setInputText}
          isProcessing={isProcessing}
          onSend={handleSend}
          isVaultActive={isVaultActive}
          onToggleVault={() => setIsVaultActive(!isVaultActive)}
        />
      </main>
    </div>
  );
};

export default App;
