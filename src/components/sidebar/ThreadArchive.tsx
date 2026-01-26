// src/components/sidebar/ThreadArchive.tsx

import React from "react";
import { Thread } from "../../types";
import { ControlCard } from "./ControlCard";

interface ThreadArchiveProps {
  threads: Thread[];
  currentThreadId: string;
  isSummarizing: boolean;
  onSelectThread: (id: string) => void;
  onRenameThread: (id: string, name: string) => void;
  onDeleteThread: (id: string) => void;
}

export const ThreadArchive: React.FC<ThreadArchiveProps> = ({
  threads,
  currentThreadId,
  isSummarizing,
  onSelectThread,
  onRenameThread,
  onDeleteThread,
}) => {
  return (
    <ControlCard
      title="Archives"
      description={
        isSummarizing ? "Auditing History..." : "Recent Transmissions"
      }
    >
      <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {threads.length === 0 && (
          <p className="text-[10px] opacity-30 italic p-2">Empty silence...</p>
        )}
        {threads.map((t) => (
          <div
            key={t.id}
            onClick={() => onSelectThread(t.id)}
            className={`group p-3 rounded-xl border-2 transition-all cursor-pointer ${
              currentThreadId === t.id
                ? "border-brilliant-rose bg-brilliant-rose/5"
                : "border-transparent bg-bright-snow hover:border-saffron/30"
            }`}
          >
            <input
              className="bg-transparent font-black text-[10px] uppercase w-full outline-none focus:text-brilliant-rose cursor-text truncate"
              value={t.summary || "New Transmission"}
              onChange={(e) => onRenameThread(t.id, e.target.value)}
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
                    onDeleteThread(t.id);
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
  );
};
