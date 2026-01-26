// src/components/chat/ChatInput.tsx

import React from "react";

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  isProcessing: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isProcessing,
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
          <button
            onClick={onSend}
            disabled={isProcessing || !value.trim()}
            className="absolute right-6 bottom-6 bg-brilliant-rose text-white w-14 h-14 rounded-full shadow-lg disabled:bg-graphite transition-colors flex items-center justify-center font-bold text-2xl"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
};
