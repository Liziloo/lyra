import React from "react";
import { Message } from "../../types/index";

export const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] sm:max-w-[80%] px-8 sm:px-10 py-5 sm:py-6 rounded-[2.5rem] leading-relaxed text-sm font-bold shadow-sm transition-all ${
          isUser
            ? "bg-graphite text-white border-2 border-saffron rounded-tr-none shadow-md"
            : "bg-white text-graphite border-4 border-brilliant-rose rounded-tl-none shadow-[0_10px_40px_-15px_rgba(255,58,174,0.3)]"
        }`}
      >
        {!isUser && (
          <div className="text-[10px] mb-1 font-black uppercase tracking-[0.3em] text-brilliant-rose">
            Lyra Intelligence
          </div>
        )}
        <div className="whitespace-pre-wrap">{message.text}</div>
        <div
          className={`text-[9px] mt-3 font-black uppercase tracking-[0.2em] opacity-40 ${isUser ? "text-saffron" : "text-brilliant-rose"}`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};
