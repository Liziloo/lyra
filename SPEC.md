To get Project Lyra moving on your Linux machine, you should focus on a **"Thin Slice"** prototype. This approach establishes the bridge between your React frontend and your local hardware (Ollama/ROCm) before adding the complex multi-pass reasoning or background watchers.

Below is a stripped-back `SPEC.md` that focuses on the core utility: a functional, beautifully styled AI chat that can read your local files and toggle between local and cloud providers.

---

# Prototype Spec: Project Lyra (v0.1 - The Core)

## 1. Core Intelligence (The "Direct" Brain)

* **Single-Stream Provider Switching:**
* Support **Ollama (Local)** and **OpenRouter (Cloud)**.
* No complex "Dynamic Switching" logic yet—just a manual dropdown/toggle in the UI.
* **Ollama:** Direct `fetch` to `http://localhost:11434/api/chat`.
* **OpenRouter:** Direct `fetch` to OpenRouter's endpoint using a manually entered API key stored in `localStorage`.



## 2. Integrated Context (Manual injection)

* **Obsidian "Context Snap":**
* **No Background Watcher:** Instead of a recursive service, implement a "Select Folder" button (using Tauri's `dialog` and `fs` plugins).
* **Injection:** A "Read Recent Notes" button that pulls the text from the top 5 `.md` files in that folder and prepends them to the system prompt.


* **Genealogy System Prompt:**
* A simple checkbox in the UI that appends: *"You are a genealogy expert. Cite sources and note missing evidence."* to the hidden system message.



## 3. Aesthetic & Ergonomic (Standardized)

* **Colors & UI:** Implement the exactly specified palette using **Tailwind CSS**.
* **The "Bubbles" Layout:** - User messages: Right-aligned, dark borders.
* AI messages: Left-aligned, light grey background (`--bright-snow`).
* Dividers: 2px solid `--saffron` (Gold).



| Variable | HEX | Usage |
| --- | --- | --- |
| **--bright-snow** | `#f8f9faff` | Chat backgrounds. |
| **--graphite** | `#333333ff` | Text. |
| **--brilliant-rose** | `#ff3aaeff` | Focus states/buttons. |
| **--saffron** | `#e8b923ff` | Section headers/dividers. |

## 4. Simplified Feature Set

1. **Model Switcher:** A simple list of hardcoded models (e.g., `llama3.2`, `gpt-4o`, `claude-3.5-sonnet`).
2. **Markdown Export:** A "Save to Vault" button that takes the current chat and saves it as a `.md` file in the user's selected Obsidian directory.
3. **Hardware Check:** A small status indicator showing if `localhost:11434` (Ollama) is reachable.

---

### What to skip for now:

* ~~**The Auditor/Worker Loop:**~~ Just do one high-quality prompt for now.
* ~~**Recursive Watcher:**~~ Use a manual "Refresh Files" button.
* ~~**LAN/0.0.0.0 Support:**~~ Keep it local to your machine for the first week.
* ~~**Proton Bridge:**~~ Don't touch IMAP until the chat is solid.
