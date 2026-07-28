# Digna.AIFlowTracker

A lightweight, browser-based **Finite State Engine & Context Buffer** designed to orchestrate the prompt-log interaction loop between Architect LLMs (e.g., ChatGPT, Claude) and Autonomous Execution Agents (e.g., Google Antigravity, OpenCode).

Built as a privacy-first developer utility within the **Digna Ecosystem**, it features Zero-Knowledge client-side encryption, preventing context loss during LLM rate/token limits and eliminating desktop `.txt` file clutter.

![Digna.AIFlowTracker Demo](./public/demo.gif)

---

## 🌟 Key Features

* **Deterministic State Engine:** Tracks task execution through rigid lifecycle states:
  `PROMPT_AWAITING` ➔ `AGENT_PENDING` ➔ `AGENT_PROCESSING` ➔ `GPT_FEEDBACK_REQUIRED` ➔ `COMPLETED`.
* **Zero-Knowledge Dual-Password Encryption:** Client-side 256-bit `AES-GCM` encryption using the browser's native `Web Crypto API` (`SubtleCrypto`) and `PBKDF2` key derivation. Features a **Dual-Password Architecture** where Master Password ($K_m$) is wrapped via App Key ($K_a$) as `pipeline-wrapped-mp`. Master keys are strictly kept in volatile memory (RAM).
* **Streamlined Workflow Modes:** Simplified main execution workflows (`STRICT` and `ITERATIVE`) with a conditional, toggleable `Fast Pass` chip and opt-in Phase/Step numbering.
* **Context Loss & Rate-Limit Shield:** Persists step state locally. When an LLM hits a usage limit, the system explicitly highlights required feedback actions (`GPT_FEEDBACK_REQUIRED`) so work can resume seamlessly without loss of context.
* **Pure Architectural Isolation:** Unidirectional data flow where UI components, local storage persistence, and cryptographic operations are completely decoupled.
* **Developer Ergonomics & Action-First UI:** 4-card action-first password settings modal (`CHANGE_MASTER`, `CHANGE_APP`, `REMOVE`, `Lock`), standardized high-contrast form fields, responsive dual-pane layout, scroll-isolated historical archive sidebar, and dynamic Light/Dark mode.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, TypeScript
* **Styling:** Tailwind CSS
* **Build Tool:** Vite
* **Linter & Quality:** Oxlint
* **Cryptography:** Web Crypto API (`window.crypto.subtle` - AES-GCM 256-bit / PBKDF2)
* **Persistence:** Browser `LocalStorage` (Plain JSON or Encrypted Blob Interceptor)
* **Internationalization (i18n):** Native Turkish & English dictionary support

---

## 🏗️ Architecture & Project Structure

```text
Digna.AIFlowTracker/
├── public/
│   ├── demo.gif                        # Application preview animation
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── Components/
│   │   ├── AgentPendingSection.tsx     # One-click copy & dispatch section
│   │   ├── AgentProcessingSection.tsx  # Agent log capture module
│   │   ├── ArchivedSidebar.tsx         # Scroll-isolated historical records panel
│   │   ├── Button.tsx                  # Reusable variant button component
│   │   ├── GptFeedbackSection.tsx      # Feedback payload generator & loop finisher
│   │   ├── LockScreen.tsx              # Zero-knowledge auth & dual-password setup
│   │   ├── Modal.tsx                   # Portal-based overlay component
│   │   ├── PasswordSettingsModal.tsx   # Action-first password management modal
│   │   ├── PromptInputSection.tsx      # Orchestrator prompt input module
│   │   └── StateBanner.tsx             # Dynamic state notification header
│   ├── Interfaces/
│   │   └── IStep.ts                    # State definitions & Step data models
│   ├── locales/
│   │   ├── en.ts                       # English locale dictionary
│   │   └── tr.ts                       # Turkish locale dictionary
│   ├── Pages/
│   │   └── HomePage.tsx                # Finite state machine orchestration page
│   ├── Services/
│   │   ├── cryptoService.ts            # Pure Web Crypto API (AES-GCM / PBKDF2 / Key Wrapping)
│   │   └── storageService.ts           # Encrypted LocalStorage I/O interceptor
│   ├── styles/
│   │   └── formClasses.ts              # Centralized high-contrast form element styles
│   ├── App.tsx                         # Theme & Security root wrapper
│   ├── index.css                       # Global styles & Tailwind imports
│   └── main.tsx                        # Application entry point
├── .gitignore
├── .oxlintrc.json
├── index.html
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 🔒 Security & Privacy Model

* **Zero Server Dependency:** No external database or network calls; all data resides strictly inside `LocalStorage`.
* **Key Wrapping Architecture:** The Master Password ($K_m$) is encrypted using the App Key ($K_a$) derived via `PBKDF2` (SHA-256, 100,000 iterations) and stored safely as `pipeline-wrapped-mp`. This grants seamless daily unlocks while keeping root data recovery protected.
* **Volatile Key Management:** Active encryption keys are stored solely in volatile RAM (`cachedKey`). Refreshing the browser or locking the app purges key material immediately.
* **Storage Interception:** Data is encrypted prior to disk write (`persistSteps`). Inspection via Developer Tools (`F12`) reveals only pseudo-random ciphertext and initialization vectors (`iv`).

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18.0 or higher)
* npm / pnpm / yarn

### Installation & Execution

```bash
# Clone the repository
git clone [https://github.com/DignaGG/Digna.AIFlowTracker.git](https://github.com/DignaGG/Digna.AIFlowTracker.git)

# Navigate into the project directory
cd Digna.AIFlowTracker

# Install dependencies
npm install

# Launch development server
npm run dev
```

---

## ✍️ Author & Documentation Notes

* **Author:** Arda (Junior Software Developer / Digna Ecosystem)
* **Design & Translation Note:** The core architecture, algorithms, and system logic of this library are natively designed and developed in Turkish. To comply with international open-source coding standards, the code comments, XML documentation, and this README were translated into English with AI assistance. The primary engineering focus remains strictly on mathematical accuracy, hardware-level optimization, and system stability.
* **Development & Collaboration Breakdown:**
  * **System Architecture & Cryptographic Design:** The core architectural strategy, Finite State Machine specifications, Zero-Knowledge encryption layer (`AES-GCM` / `PBKDF2` key wrapping interceptor), and component isolation rules were engineered by **Arda**.
  * **Manual Edge-Case & Bug Resolution:** Complex edge cases and system bugs that autonomous AI agents failed to resolve—such as enforcing cryptographic verification upon key entry (`validateAndSetPassword`), seamless data migration from plaintext to ciphertext, stale timer cleanups, and enforcing strict CSS flexbox layout bounds to prevent sidebar layout shrinkage—were manually diagnosed, debugged, and refactored by **Arda**.
  * **AI Agent Execution:** UI component scaffolding, repetitive boilerplate code, and Tailwind CSS styling were co-developed with the assistance of **OpenCode Agent**.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
