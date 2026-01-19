// frontend/src/components/ChatBox.jsx
import React, { useState } from "react";

const ChatBox = ({ model, projectName, fileContext }) => {
  // Added fileContext here
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input) return;

    // UI: Add the user message
    const userMsg = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const currentInput = input;
    setInput("");

    try {
      const response = await fetch("/chat/", {
        // Note: using relative path for desktop app
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: currentInput,
          model,
          projectName,
          // Send the file content if it exists, otherwise send null
          fileContext: fileContext ? fileContext.content : null,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [...prev, { text: "", isUser: false }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n"); // Split by single newline

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonStr = line.substring(6).trim();
              if (!jsonStr) continue;

              const data = JSON.parse(jsonStr);
              // Standardize: Ollama uses .response, OpenRouter uses choices[0].delta.content
              const token =
                data.response || data.choices?.[0]?.delta?.content || "";

              assistantText += token;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].text = assistantText;
                return updated;
              });
            } catch (e) {
              console.log("Skipping partial/invalid JSON:", line);
            }
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
      {/* Optional: Visual indicator that AI "sees" the file */}
      {fileContext && (
        <div style={{ fontSize: "12px", color: "#888", padding: "5px" }}>
          Context active: {fileContext.fileName}
        </div>
      )}

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
