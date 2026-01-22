import React from "react";
import { Message } from "../../types/index";

export const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] px-8 py-5 rounded-[2.5rem] leading-relaxed text-sm font-medium ${
          isUser
            ? "bg-graphite text-bright-snow border-2 border-saffron rounded-tr-none shadow-lg"
            : "bg-brilliant-rose text-white rounded-tl-none shadow-[0_10px_30px_rgba(255,58,174,0.3)]"
        }`}
      >
        <div className="whitespace-pre-wrap">{message.text}</div>
        <div
          className={`text-[9px] mt-2 font-black uppercase tracking-widest opacity-60 ${isUser ? "text-saffron" : "text-bright-snow"}`}
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
