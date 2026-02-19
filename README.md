# CodeRoom AI

## What We Built
CodeRoom AI is a local-first MVP for real-time collaborative coding rooms with an integrated AI reviewer panel. Multiple users join the same room URL, co-edit a shared file in Monaco Editor, see live cursor presence, and run context-aware AI review actions on selected code.

## How Codex Was Used
OpenAI Codex-style prompting powers six collaboration workflows directly in the room:
- **Code explanation** to help teammates quickly understand unfamiliar sections.
- **Refactoring suggestions** to improve readability/performance without changing behavior.
- **Bug detection** for edge cases, correctness risks, and potential runtime issues.
- **Unit test generation** for Jest coverage over happy paths and edge cases.
- **Snippet comparison** to resolve implementation disagreements.
- **Diff summarization** to explain what changed between two code versions.

## How to Run
1. Copy env values:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies from repo root:
   ```bash
   npm install
   ```
3. Start frontend + backend together:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`, enter a nickname + room slug, and join.
5. Open the same room in another tab/browser with a different nickname for multiplayer behavior.

## Architecture Overview
- **Monorepo workspaces**: `frontend` (Next.js App Router) + `backend` (Express + Socket.io).
- **In-memory room state** in backend `Map` keyed by room ID (single shared file per room).
- **WebSocket events** for room join, code synchronization, and cursor updates.
- **AI endpoint** (`POST /api/ai`) applies action-specific prompt templates and returns formatted model output.
- **Environment variables** handle API keys/config; no hardcoded secrets.

## Why This Is Meaningful AI Collaboration
AI is embedded inside the same collaborative surface where teams write code. Instead of a separate chatbot, every AI action runs against the currently selected code and directly supports team workflows: understanding teammates’ changes, settling design debates via snippet comparison, improving code safely, and generating tests faster. This makes AI an active senior reviewer in the room, not decorative UI.

## Project Structure
```text
CodeRoom-AI/
├─ .env.example
├─ package.json
├─ README.md
├─ backend/
│  ├─ package.json
│  ├─ tsconfig.json
│  └─ src/
│     ├─ prompts.ts
│     ├─ server.ts
│     └─ types.ts
└─ frontend/
   ├─ package.json
   ├─ tsconfig.json
   ├─ next.config.ts
   ├─ postcss.config.js
   ├─ tailwind.config.ts
   ├─ next-env.d.ts
   ├─ app/
   │  ├─ globals.css
   │  ├─ layout.tsx
   │  ├─ page.tsx
   │  └─ room/[roomId]/page.tsx
   ├─ components/
   │  └─ AiPanel.tsx
   └─ lib/
      └─ socket.ts
```
