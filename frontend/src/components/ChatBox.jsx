// frontend/src/components/ChatBox.jsx
import React, { useState } from "react";

const ChatBox = ({ model, projectName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input) return;
    const userMsg = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const currentInput = input;
    setInput("");

    try {
      const response = await fetch("http://localhost:3001/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: currentInput, model, projectName }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      // Add placeholder for assistant
      setMessages((prev) => [...prev, { text: "", isUser: false }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.replace("data: ", ""));
            // Ollama uses data.response, OpenRouter uses data.choices[0].delta.content
            const token =
              data.response || data.choices?.[0]?.delta?.content || "";
            assistantText += token;

            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1].text = assistantText;
              return updated;
            });
          }
        }
      }
    } catch (error) {
      console.error("Stream error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.isUser ? "user" : "ai"}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
