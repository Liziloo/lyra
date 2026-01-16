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
 - Requires `OLLAMA_API_KEY` field in UI/Backend for cloud-augmented grounding.

## 2. Integrated Context Systems
- **Obsidian Vault:**
  - **Service:** Recursive file-system watcher (Linux-based) on a user-defined directory.      
  - **Context Injection:** On every prompt, search the last 10 `.md` files modified or perform a vector search (if indexed) to inject relevant genealogy or coding notes into the context window.
- **Genealogy-Specific "Research Mode":**
  - A specialized system prompt that instructs the AI to prioritize "Source Citations" and "Negative Evidence" (noting where information was *not* found).
- **Snapshot/Recovery:**
  - **State Capture:** Hook to save current active file paths, terminal working directories, and line numbers.     
  - **Resumption:** AI generates a 3-bullet summary of the "Active Logic State" to eliminate re-orientation friction.

## 3. VS Code & LAN Integration
- **OpenAI-Compatible Endpoint:** - Implement a route `/v1/chat/completions` in the backend to enable integration with VSCode AI extensions. 
- **LAN Multi-User Support:** - Listen on `0.0.0.0` for multi-workstation access. 
  - Isolated storage: `backend/data/{username}/`.

---

## 4. Aesthetic & Ergonomic

| Variable | HEX | Usage |
| :--- | :--- | :--- |
| **--bright-snow** | `#f8f9faff` | Primary content surface (high readability). |
| **--graphite** | `#333333ff` | Primary text. |
| **--brilliant-rose** | `#ff3aaeff` | Input borders, dividers, active glows. Never text background. |
| **--saffron** | `#e8b923ff` | **Decorative Gold.** Thick accent lines (2px+), section dividers. |

- **UI Physics:** 
  - **Bubbles:** Light-filled with black text. Alignment (Left/Right) conveys role.
  - **Metadata:** Timestamps are greyed and visually subordinate.
  - **Not a dark theme:** Clean, light content planes with dark/neutral framing.

## 5. Accuracy & Anti-Drift Protocols
- **Verification Loop:** Every "Complex" request triggers a self-correction pass before being displayed in the UI. Mandatory 2-pass verification (Worker + Auditor) for all complex prompts.
- **Reference-First Generation:** AI must list the "Sources Found" (from Obsidian or Web) at the top of the response before providing the answer.
- **The "Multi-Pass" Check:** For high-intellect tasks, the app uses "Best-of-N" sampling—it generates 3 small logic paths and the backend "Aggregator" picks the most consistent one.
- **Context Pinning:** Key facts (e.g., "Grandfather's birth year: 1892") are "pinned" to the system prompt so the AI cannot contradict them later in the thread.

---

## 6. Additional Features
1. **Model Switcher:** Pulls local models from Ollama AND fetches a curated list from OpenRouter (e.g., Claude 3.5 Sonnet, DeepSeek V3).
2. **Auto-Summary:** When a thread reaches 10 messages, the AI summarizes the "Status" to save context tokens.
3. **Markdown Export:** A "Save to Vault" button that formats the current conversation and saves it directly into the user's Obsidian folder.
4. **Scaffolding Engine:**
  - Dedicated endpoint/prompt for generating full-stack project structures, directory trees, and `Makefile` or `CMakeLists.txt` instantly to bypass manual setup.
5. **Genealogy Research Mode:**  
  - Automated source parsing. User provides raw text; AI extracts names, dates, and locations into formatted citations (GEDCOM or Markdown) in the background.
6. **DIY Parts Agent:** 
  - Background scraping for component specs/pricing when DIY project keywords are detected.
7. **Proton Bridge Integration:**  
  - Connect to `127.0.0.1` via `node-imap`.      
  - **Task Extraction:** AI scans incoming emails for action items and automatically populates the micro-task list.

---

## 7. Hardware Architecture (AMD ROCm)
- **Primary Engine:** Ollama v0.14+ hosted on custom Linux desktop with following specs:
  - AMD Ryzen 7 9800X3D 4.7 GHz 8-Core Processor
  - Sapphire PULSE Radeon RX 7800 XT 16 GB Video Card
  - MSI B850 GAMING PLUS WIFI ATX AM5 Motherboard
  - TEAMGROUP T-Create Expert 32 GB (2 x 16 GB) DDR5-6000 CL30 Memory
  - TEAMGROUP MP44L 2 TB M.2-2280 PCIe 4.0 X4 NVME Solid State Drive
  - Thermaltake Toughpower GF1 (2024) 850 W 80+ Gold Certified Fully Modular ATX Power Supply
- **Concurrency:** The backend must handle parallel requests to support the "Agent Loop" (Web Search + Local Reasoning).
- **GPU Priority:** All inference requests should specify high GPU offloading to leverage the 9800X3D's speed and the 16GB frame buffer.
