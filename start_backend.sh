#!/bin/bash
# Start the RAG API so the chat UI can reach it.
# Run from project root: ./start_backend.sh
cd "$(dirname "$0")"
source venv/bin/activate
echo "Starting backend at http://localhost:8000 ..."
echo "First time can take 30-60 seconds (loading libraries). Wait until you see 'Application startup complete'."
echo "Then open http://localhost:3000 or http://localhost:3001 in your browser for the chat."
echo ""
uvicorn backend.main:app --host 0.0.0.0 --port 8000
