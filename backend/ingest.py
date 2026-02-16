import os
import shutil
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from backend.embeddings import get_embeddings
from backend.config import DATA_DIR, VECTOR_STORE_DIR, COLLECTION_NAME

def ingest_docs():
    pdf_dir = DATA_DIR / "pdf"
    if not pdf_dir.exists():
        print(f"Directory not found: {pdf_dir}")
        return

    print(f"Loading PDFs from {pdf_dir}...")
    loader = DirectoryLoader(
        str(pdf_dir),
        glob="*.pdf",
        loader_cls=PyPDFLoader,
        show_progress=True
    )
    docs = loader.load()
    print(f"Loaded {len(docs)} pages.")

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    splits = text_splitter.split_documents(docs)
    print(f"Split into {len(splits)} chunks.")

    # Clear existing vector store to avoid duplicates/conflicts
    if VECTOR_STORE_DIR.exists():
        print(f"Removing existing vector store at {VECTOR_STORE_DIR}...")
        shutil.rmtree(VECTOR_STORE_DIR)

    print("Creating vector store...")
    Chroma.from_documents(
        documents=splits,
        embedding=get_embeddings(),
        persist_directory=str(VECTOR_STORE_DIR),
        collection_name=COLLECTION_NAME
    )
    print("Vector store created and persisted.")

if __name__ == "__main__":
    ingest_docs()
