# Agent RAG Chat

A full-stack RAG (Retrieval-Augmented Generation) application built with **FastAPI** (Backend) and **Next.js** (Frontend).

## Features
- **RAG Pipeline**: Retrieves context from PDF documents to answer user queries using OpenAI models.
- **Agentic Behavior**: Falls back to general knowledge if context is missing, and supports multilingual replies.
- **Modern UI**: Dark-themed chat interface with streaming responses and conversation history.

## Prerequisites
- Python 3.10+
- Node.js 18+
- OpenAI API Key

## Setup

### 1. Backend
1. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure Environment:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Add your OpenAI API Key to `.env`.

4. **Ingest Data** (First time setup):
   - Place your PDFs in `data/pdf/`.
   - Run the ingestion script:
     ```bash
     python3 -m backend.ingest
     ```

5. Start the server:
   ```bash
   ./start_backend.sh
   # API runs at http://localhost:8000
   ```

### 2. Frontend
1. Navigate to the web directory:
   ```bash
   cd web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   # App runs at http://localhost:3000
   ```

## Project Structure
- `backend/`: FastAPI application and RAG logic.
- `web/`: Next.js frontend application.
- `data/`: PDF documents and vector store database.
- `notebooks/`: Exploration and data processing notebooks.

## License
MIT
