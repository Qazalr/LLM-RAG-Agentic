# Agent RAG Backend

FastAPI server that exposes a RAG pipeline (LangGraph: retrieve → generate) at `POST /api/chat`. The web UI calls this backend.

## Setup

### 1. Install dependencies

From the **project root** (parent of `backend/`):

```bash
pip install -r requirements.txt
```

### 2. Set OpenAI API key

In the project root, create or edit `.env`:

```env
OPENAI_API_KEY=sk-your-key-here
```

Optional: `OPENAI_MODEL=gpt-4` (default is `gpt-3.5-turbo`).

### 3. Build the vector index (once)

Loads documents from `data/text_files` (`.txt`) and `data/pdf` (`.pdf`), splits them, embeds with OpenAI, and stores in `data/vector_store`:

```bash
python -m backend.build_index
```

Add your own files to `data/text_files` or `data/pdf` and run this again to re-index.

### 4. Start the API

From the **project root**:

```bash
uvicorn backend.main:app --reload --port 8000
```

- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  
- Health: http://localhost:8000/health  

### 5. Use the web UI

In another terminal, from the project root:

```bash
cd web
npm run dev
```

Open http://localhost:3000. Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `web/.env.local` if needed.

## API

- **POST /api/chat**  
  - Body: `{ "message": "your question", "conversationId": "optional-id" }`  
  - Response: `{ "reply": "assistant reply" }`  

The backend uses a LangGraph RAG pipeline: retrieve relevant chunks from the vector store, then generate an answer with the LLM.
