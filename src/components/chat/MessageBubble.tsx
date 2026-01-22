import React from "react";
import { Message } from "../../types/index";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full mb-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm leading-relaxed ${
          isUser
            ? "bg-white border-2 border-graphite text-graphite rounded-tr-none"
            : "bg-bright-snow text-graphite border border-gray-200 rounded-tl-none"
        }`}
      >
        <div className="text-sm whitespace-pre-wrap font-sans">
          {message.text}
        </div>
        <div
          className={`text-[10px] mt-1 opacity-50 font-mono ${
            isUser ? "text-right" : "text-left"
          }`}
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
