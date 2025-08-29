# TeamFlow – Open‑Source Collaborative AI Workspace (ChatGPT “Projects/Folders” Experience)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D16-brightgreen)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-green)](https://expressjs.com/)

TeamFlow is an open‑source, self‑hosted AI workspace inspired by ChatGPT’s Projects/Folders experience. It brings a clean, familiar interface where teams can group chats, files, and project‑level instructions in one place and collaborate more effectively.

The current implementation provides a polished UI/UX, a lightweight Node/Express backend, and a mock assistant suitable for local demos, prototyping, and extending into a production‑ready stack.

---

## Highlights

- Project (“Folder”) workspace model
  - Keep chats, files, and custom instructions scoped to a project
  - Starting a chat from the project home always creates an isolated, new thread
- Modern Chat experience
  - Typing indicator, message bubbles, keyboard shortcuts
  - Clean, responsive dark UI with subtle animations
- Files & Instructions (per project)
  - Attach files to a project (UI in place; indexing is pluggable)
  - Save project‑specific instructions (system prompt) to guide responses
- History & Organization
  - Project list with rename/delete and context menus
  - Per‑project chat history with open/continue flow
- Simple, hackable backend
  - Express endpoints for `/api/chat`, `/api/health`, `/api/chat/history`
  - Mocked responses for local development and UI iteration

> Note: This repo focuses on the collaborative workspace experience and a solid foundation. Model connectors, persistence, and auth are intentionally lightweight so you can integrate your own stack.

---

## Quickstart (TL;DR)

```bash
# 1) Install
npm install

# 2) Start the server (dev)
npm run dev
# or start without auto‑reload
npm start

# 3) Open the app
open http://localhost:3000
```

Common commands:
- `npm run dev`: Start with nodemon auto‑restart
- `npm start`: Start the server (production‑like)

---

## Getting Started

### Prerequisites
- Node.js ≥ 16
- npm ≥ 8

### Installation
```bash
npm install
```

### Run (Development)
```bash
npm run dev   # uses nodemon for auto‑restart
```

### Run (Production‑like)
```bash
npm start
```

Open the app at `http://localhost:3000`.

---

## Project Structure
```text
Awesome-Start/
├─ index.html       # App shell & UI layout
├─ styles.css       # Modern, responsive dark theme
├─ script.js        # Frontend logic (projects, chats, UI state)
├─ server.js        # Express server & mock APIs
├─ package.json     # Scripts & dependencies
└─ README.md        # You are here
```

---

## Usage Overview

1. Create or select a Project (folder) in the sidebar.
2. Add project Instructions to steer responses.
3. Optionally add Files for the project (UI in place; see Roadmap for indexing).
4. From the Project home input, start a new chat – each submission creates a new, clean thread.
5. Continue a chat from History; messages append to that thread only.

The UI ensures project chats are isolated and that starting from the project home always yields a new conversation.

---

## Bring Your Own Model (BYOM)

The default `/api/chat` endpoint returns a mocked reply to enable local UI development. To connect a real LLM provider:

1. Install a provider SDK (example: OpenAI)
   ```bash
   npm install openai
   ```
2. Add environment variables
   ```env
   OPENAI_API_KEY=sk-...
   MODEL=gpt-4o-mini
   ```
3. Replace the mock in `server.js` with a real call (example only):
   ```js
   // server.js (illustrative snippet)
   const OpenAI = require('openai');
   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

   app.post('/api/chat', async (req, res) => {
     try {
       const { message } = req.body;
       if (!message || !message.trim()) {
         return res.status(400).json({ success: false, error: 'Message is required' });
       }

       const completion = await openai.chat.completions.create({
         model: process.env.MODEL || 'gpt-4o-mini',
         messages: [
           { role: 'system', content: 'You are TeamFlow, a helpful AI collaborator.' },
           { role: 'user', content: message }
         ]
       });

       const reply = completion.choices?.[0]?.message?.content?.trim() || 'No content';
       res.json({ success: true, data: { message: reply, timestamp: new Date().toISOString(), user_message: message } });
     } catch (err) {
       console.error('Chat API Error:', err);
       res.status(500).json({ success: false, error: 'Upstream model error' });
     }
   });
   ```

You can plug in any provider (Azure OpenAI, local models via Ollama, etc.).

---

## Persistence Notes

- By default, chat/project state is ephemeral and managed client‑side for demo purposes.
- To persist projects/chats/files across sessions, introduce a database (SQLite/Postgres) and wire endpoints:
  - `POST /api/projects`, `GET /api/projects/:id`
  - `POST /api/projects/:id/chats`, `GET /api/projects/:id/chats/:chatId`
  - `PUT /api/projects/:id/instructions`
- Consider server‑side session or JWT auth before enabling multi‑user access.

---

## Security & Deployment

- Enable CORS only for trusted origins in production.
- Add rate limiting and request size limits to protect `/api/chat`.
- Store secrets in environment variables or a secret manager (never commit keys).
- Recommended deployments: Docker, Fly.io, Render, Railway, or a Node host behind a reverse proxy (Nginx/Caddy).

Example Dockerfile (basic):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## API (Mock)

### POST `/api/chat`
Send a message to receive a mock assistant reply.

Request:
```json
{ "message": "Hello TeamFlow" }
```

Response:
```json
{
  "success": true,
  "data": {
    "message": "This is a mock assistant reply.",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "user_message": "Hello TeamFlow"
  }
}
```

### GET `/api/health`
Simple health check.

### GET `/api/chat/history`
Reserved for future expansion (returns an empty structure by default).

---

## Configuration

Environment variables (optional):
```env
PORT=3000
NODE_ENV=development
```

---

## Architecture

- Frontend: HTML/CSS + Vanilla JS
  - Project model with chats, files, and per‑project instructions
  - UI state managed on the client; single‑page experience
- Backend: Node.js + Express
  - Static asset serving + mock chat API for development
  - Easy to augment with real model providers or vector stores

---

## Roadmap

- Model connectors (OpenAI, Azure OpenAI, local inference)
- Vector database for file indexing & retrieval (RAG)
- Persistent storage for projects/chats/files (SQLite/Postgres)
- Authentication & multi‑user teams
- Role‑based sharing and permissions
- Real‑time collaboration (WS/WebRTC)
- Streaming responses and tokens display
- Export/import of projects and chats

If you build any of these, we’d love a PR!

---

## FAQ

- Why are replies mocked?
  - To keep the repo runnable without paid keys. Swap in your provider as shown above.
- Does the UI support streaming?
  - The UI is structured to support it; you can add Server‑Sent Events or WebSockets to stream tokens.
- Can I deploy this for a team today?
  - Yes, as an internal prototype. Add auth, persistence, and a model provider before production use.
- How do Projects differ from plain chat?
  - Each Project scopes files, instructions, and history, keeping long‑running work organized.

---

## Contributing

Contributions are welcome. Please:
- Open an issue for discussion before large changes
- Keep PRs focused and well‑documented
- Match the existing code style and formatting

---

## License

MIT © TeamFlow Contributors. See [LICENSE](./LICENSE).

---

## Acknowledgements

- Inspired by the ChatGPT Projects/Folders user experience
- Thanks to the open‑source community for the tools and libraries that make projects like this possible
