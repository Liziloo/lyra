import { Message, Provider } from "../types";

interface LLMOptions {
  provider: Provider;
  model: string; // The specific model ID (e.g., 'llama3.2' or 'gpt-4o')
  isGenealogyExpert: boolean;
  contextNotes: string;
}

export const sendMessage = async (
  messages: Message[],
  options: LLMOptions,
): Promise<string> => {
  const { provider, model, isGenealogyExpert, contextNotes } = options;

  // 1. Construct the System Message
  let systemContent = "You are a helpful AI assistant.";
  if (isGenealogyExpert) {
    systemContent =
      "You are a genealogy expert. Cite sources and note missing evidence.";
  }

  // Inject Obsidian Context if available
  if (contextNotes) {
    systemContent += `\n\nUse the following recent notes for context:\n${contextNotes}`;
  }

  // 2. Map UI Messages to API format (text -> content)
  // We prepend the system prompt as the first message
  const apiMessages = [
    { role: "system", content: systemContent },
    ...messages.map((m) => ({
      role: m.role,
      content: m.text,
    })),
  ];

  // 3. Prepare Request
  const isOllama = provider.url.includes("11434");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (provider.apiKey) {
    headers["Authorization"] = `Bearer ${provider.apiKey}`;
  }

  // OpenRouter specific headers (Optional but recommended)
  if (provider.url.includes("openrouter.ai")) {
    headers["HTTP-Referer"] = "https://github.com/project-lyra";
    headers["X-Title"] = "Project Lyra";
  }

  const body = JSON.stringify({
    model: model,
    messages: apiMessages,
    stream: false, // Prototype v0.1 uses non-streaming for simplicity
  });

  try {
    const response = await fetch(provider.url, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API Error: ${response.status}`,
      );
    }

    const data = await response.json();

    // 4. Handle differing response schemas
    if (isOllama) {
      // Ollama response: { message: { content: "..." } }
      return data.message.content;
    } else {
      // OpenRouter/OpenAI response: { choices: [ { message: { content: "..." } } ] }
      return data.choices[0].message.content;
    }
  } catch (error) {
    console.error("LLM Service Error:", error);
    throw error;
  }
};
export type { LLMOptions };