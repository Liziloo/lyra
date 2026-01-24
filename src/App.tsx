import React, { useRef, useEffect } from "react";
import { useHardwareCheck } from "./hooks/useHardwareCheck";
import { useSidebarResize } from "./hooks/useSidebarResize";
import { useModelManager } from "./hooks/useModelManager";
import { useVaultContext } from "./hooks/useVaultContext";
import { useThreads } from "./hooks/useThreads";
import { useChatSession } from "./hooks/useChatSession";

// Components
import { Sidebar } from "./components/sidebar/Sidebar";
import { MessageBubble } from "./components/chat/MessageBubble";
import { ChatDivider } from "./components/chat/ChatDivider";

const App = () => {
  // 1. Config Constants
  const OLLAMA_URL =
    import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434";
  const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY || "";

  // 2. Logic Hooks
  const { isOllamaOnline } = useHardwareCheck();
  const { width: sidebarWidth, startResizing } = useSidebarResize(320);
  const {
    threads,
    currentThread,
    setCurrentThread,
    createNewThread,
    switchThread,
    deleteThread,
  } = useThreads();
  const [isGenealogyMode, setIsGenealogyMode] = React.useState(false);

  const models = useModelManager(isOllamaOnline, OLLAMA_URL);
  const vault = useVaultContext(import.meta.env.VITE_OBSIDIAN_PATH || "");

  const { send, isProcessing, inputText, setInputText } = useChatSession(
    currentThread,
    setCurrentThread,
    () => {
      vault.setContextSnap("");
      vault.setIsCodingMode(false);
    },
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [currentThread.messages, isProcessing]);

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
        vaultPath={vault.vaultPath}
        setVaultPath={vault.setVaultPath}
        setContextSnap={vault.snapRecentNotes}
        isGenealogyMode={isGenealogyMode}
        setIsGenealogyMode={setIsGenealogyMode}
        threads={threads}
        currentThreadId={currentThread.id}
        onSelectThread={switchThread}
        onNewChat={createNewThread}
        onDeleteThread={deleteThread}
      />

      <div
        onMouseDown={startResizing}
        className="w-1.5 cursor-col-resize bg-saffron hover:bg-brilliant-rose z-50"
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

        {/* INPUT DOCK - Could be extracted to its own component if it grows */}
        <div className="p-6 sm:p-10 bg-white border-t-2 border-saffron/10">
          <div className="max-w-5xl mx-auto flex items-end space-x-6">
            <div className="flex-grow relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  send(inputText, {
                    activeProviderId: models.activeProviderId,
                    selectedModel: models.selectedModel,
                    isGenealogyMode,
                    contextSnap: vault.contextSnap,
                    openRouterKey: OPENROUTER_KEY,
                    ollamaBaseUrl: OLLAMA_URL,
                  })
                }
                placeholder="Hello, Lyra..."
                className="w-full p-6 bg-bright-snow border-2 border-graphite rounded-[2.5rem] text-lg font-bold outline-none focus:border-brilliant-rose h-32 resize-none"
              />
              <button
                onClick={() =>
                  send(inputText, {
                    activeProviderId: models.activeProviderId,
                    selectedModel: models.selectedModel,
                    isGenealogyMode,
                    contextSnap: vault.contextSnap,
                    openRouterKey: OPENROUTER_KEY,
                    ollamaBaseUrl: OLLAMA_URL,
                  })
                }
                className="absolute right-6 bottom-6 bg-brilliant-rose text-white w-14 h-14 rounded-full shadow-lg"
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
