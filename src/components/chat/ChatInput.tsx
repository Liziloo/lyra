// src/components/chat/ChatInput.tsx
import React from "react";

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  isProcessing: boolean;
  // New props for vault control
  isVaultActive: boolean;
  onToggleVault: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isProcessing,
  isVaultActive,
  onToggleVault,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-6 sm:p-10 bg-white border-t-2 border-saffron/10">
      <div className="max-w-5xl mx-auto flex items-end space-x-6">
        <div className="flex-grow relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hello, Lyra..."
            disabled={isProcessing}
            className="w-full p-6 bg-bright-snow border-2 border-graphite rounded-[2.5rem] text-lg font-bold outline-none focus:border-brilliant-rose h-32 resize-none disabled:opacity-50"
          />

          <div className="absolute right-6 bottom-6 flex items-center space-x-4">
            {/* VAULT TOGGLE BUTTON */}
            <button
              onClick={onToggleVault}
              title={isVaultActive ? "Vault Connected" : "Connect Vault"}
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                isVaultActive
                  ? "bg-saffron border-graphite shadow-sm"
                  : "bg-white border-graphite/10 opacity-40 hover:opacity-100"
              }`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isVaultActive ? "white" : "currentColor"}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </button>

            {/* SEND BUTTON */}
            <button
              onClick={onSend}
              disabled={isProcessing || !value.trim()}
              className="bg-brilliant-rose text-white w-14 h-14 rounded-full shadow-lg disabled:bg-graphite transition-all hover:scale-105 active:scale-95 flex items-center justify-center font-bold text-2xl"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
      {isVaultActive && (
        <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-saffron mt-3 animate-pulse">
          Knowledge Base Linked
        </p>
      )}
    </div>
  );
};
