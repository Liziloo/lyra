import React, { useState } from "react";
import axios from "axios";

const ChatBox = ({ model, projectName }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state

  const sendMessage = async () => {
    try {
      setLoading(true); // Set loading state to true before sending request
      const response = await axios.post("/chat", { input, model, projectName });
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
    } finally {
      setLoading(false); // Set loading state to false after receiving response or catching error
    }
  };

  return (
    <div className="chat-box">
      {/* Render messages here */}
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage} disabled={loading}>
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
};

export default ChatBox;
