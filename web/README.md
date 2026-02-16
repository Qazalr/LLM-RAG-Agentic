# Agent RAG – Web Interface

Production-ready ChatGPT-style web UI for your LangGraph RAG backend. Built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**.

## Features

- **Chat layout**: Left sidebar (conversation history), main chat area, fixed input at bottom
- **Multi-turn conversations** with clear user vs assistant styling
- **Streaming responses** when the backend supports SSE/text stream
- **Markdown rendering**: code blocks, bold, lists, GFM
- **Copy to clipboard** for code blocks
- **Auto-scroll** to the latest message
- **Loading indicator** and **error UI**
- **localStorage** persistence for chat history
- **Responsive** layout (desktop + mobile, collapsible sidebar)
- **Token-based auth** placeholder via env or localStorage

## Prerequisites

- Node.js 18+
- Backend running and exposing `POST /api/chat` (see below)

## Quick start

### 1. Install dependencies

```bash
cd web
npm install
```

### 2. Configure environment

Copy the example env and set your backend URL:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
# Optional: NEXT_PUBLIC_API_TOKEN=your-token
```

Use the URL where your RAG API is running (no trailing slash).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Backend contract

The app expects your backend at `NEXT_PUBLIC_API_URL` with:

- **Endpoint**: `POST /api/chat`
- **Body**: `{ "message": string, "conversationId"?: string }`
- **Response** (choose one):
  - **JSON**: `{ "reply": string }` → single reply
  - **Stream**: `Content-Type: text/event-stream` (or plain text), SSE `data:` lines with JSON `{ "text" }` / `{ "content" }` / `{ "delta" }` or raw text chunks

If the stream fails, the client falls back to a single JSON request.

## Deployment (e.g. Vercel)

1. Push the repo (or the `web` folder) to GitHub.
2. In [Vercel](https://vercel.com), import the project and set the **Root Directory** to `web` if the repo root is the parent.
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: your production API URL (e.g. `https://api.yourdomain.com`)
   - `NEXT_PUBLIC_API_TOKEN`: optional
4. Deploy. The build command is `npm run build`; the output is the default Next.js build.

## Project structure

```
web/
├── app/
│   ├── globals.css      # Tailwind + CSS variables
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Chat page (state, API wiring)
├── components/
│   ├── Sidebar.tsx      # Conversation list, new chat, delete
│   ├── Message.tsx      # Single message bubble
│   ├── MessageContent.tsx  # Markdown + code blocks
│   ├── CodeBlock.tsx    # Code block with copy button
│   ├── ChatInput.tsx    # Textarea + send
│   ├── LoadingDots.tsx  # Loading indicator
│   └── ErrorBanner.tsx  # Dismissible error
├── lib/
│   ├── api.ts           # sendChatMessage, streamChatMessage
│   ├── auth.ts          # Token get/set (placeholder)
│   └── storage.ts       # localStorage for conversations
├── types/
│   └── index.ts         # Message, Conversation, API types
├── .env.example
├── package.json
├── tailwind.config.ts
└── README.md
```

## Authentication (placeholder)

- **Env**: `NEXT_PUBLIC_API_TOKEN` is sent as `Authorization: Bearer <token>` when set.
- **Local**: You can extend `lib/auth.ts` to read a token from localStorage (e.g. after login) and use it in `lib/api.ts` via `getAuthHeaders()`.

Replace this with your real auth (e.g. NextAuth, Clerk, or backend session) when you add login.
