import React, { useState } from "react";
import axios from "axios";

const ChatBox = ({ model }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    try {
      const response = await axios.post("/chat", { input, model });
      setMessages([
        ...messages,
        { text: input, isUser: true },
        {
          text: response.data.output,
          isUser: false,
        },
      ]);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="chat-box">
      {/* Render messages here */}
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatBox;
