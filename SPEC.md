Lyra App v2.0
---
created: 2026-01-15
tags:
---
# Master System Design Spec: Project Lyra (Full Build)

## 1. Hybrid Intelligence Layer (The "Brain")
- **Dynamic Provider Switching:**
  - The backend handles two primary providers: **Local (Ollama)** and **Cloud (OpenRouter)**.
  - User can toggle between them in the UI. 
  - **OpenRouter Logic:** Implement a `POST` wrapper that sends requests to `https://openrouter.ai/api/v1/chat/completions` using the user's stored API key.
- **Ollama "Web Search" API:** - When the "Research" toggle is active, the app uses Ollama's native `/api/web_search` (v2025/2026 feature) to fetch facts before generating a response.

## 2. Integrated Context Systems
- **Obsidian "Vault" Engine:**
  - **Functionality:** A background service that scans a specified local Linux directory (the Obsidian Vault).
  - **Search:** Implement a simple "Keyword Extract" that reads the last 5-10 modified `.md` files or files matching words in the current prompt to provide context.
- **Genealogy-Specific "Research Mode":**
  - A specialized system prompt that instructs the AI to prioritize "Source Citations" and "Negative Evidence" (noting where information was *not* found).

## 3. VS Code & LAN Integration (The "Workflow" Layer) 
- **OpenAI-Compatible Endpoint (New):** - Implement a route `/v1/chat/completions` in the backend. 
- **Purpose:** This makes your app "look" like an OpenAI server to VS Code. You can point the **Continue** or **Cline** extensions to `http://localhost:port/v1` and use your Lyra "Brain" (with Obsidian context) directly in the editor. - **LAN Multi-User Support:** - Listen on `0.0.0.0` for multi-workstation access. - Isolated storage: `backend/data/{username}/`.

---

## 4. Aesthetic & Ergonomic Contract (LOCKED)

| Variable | HEX | Usage |
| :--- | :--- | :--- |
| **--bright-snow** | `#f8f9faff` | Primary content surface (high readability). |
| **--graphite** | `#333333ff` | Primary text. |
| **--brilliant-rose** | `#ff3aaeff` | **Lining only.** Input borders, active glows. Never text background. |
| **--saffron** | `#e8b923ff` | **Decorative Gold.** Thick accent lines (2px+), section dividers. |

- **UI Physics:** - **Bubbles:** Light-filled with black text. Alignment (Left/Right) conveys role.
  - **Metadata:** Timestamps are greyed and visually subordinate.
  - **Not a dark theme:** Clean, light content planes with dark/neutral framing.

---

## 5. "Build It Now" Feature Checklist
1. **Model Switcher:** Pulls local models from Ollama AND fetches a curated list from OpenRouter (e.g., Claude 3.5 Sonnet, DeepSeek V3).
2. **Auto-Summary:** When a thread reaches 10 messages, the AI summarizes the "Status" to save context tokens.
3. **Markdown Export:** A "Save to Vault" button that formats the current conversation and saves it directly into the user's Obsidian folder.

---

## 6. Implementation Prompt for Gemini 3 Flash
**"I am providing my current codebase and the Final Build Spec. 

Task: Refactor my existing code to implement the Obsidian Vault scanner, the OpenRouter API integration, and the Ollama Web Search features immediately. 

Follow the Aesthetic Contract strictly—ensure the UI uses the Pink and Gold lining/accents exactly as described. The backend must be LAN-ready (0.0.0.0) and support multiple user directories. Return the full code for the updated server.js, ollamaClient.js, and the primary React components."**