"""
Build the vector store from data/text_files and data/pdf.
Run from project root: python -m backend.build_index
Or from backend/: python build_index.py (script adds project root to path).

Requires OPENAI_API_KEY in .env for OpenAI embeddings.
Note: This will incur OpenAI API costs (~$0.02 per 1M tokens for text-embedding-3-small).
"""
import sys
from langchain_text_splitters import RecursiveCharacterTextSplitter
print("Splitters OK")

print("Importing Chroma...")
from langchain_chroma import Chroma
print("Chroma OK")

from langchain_core.documents import Document
print("Document OK")
from langchain_community.document_loaders import (
    DirectoryLoader,
    TextLoader,
    PyPDFLoader,
)
try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    try:
        from langchain.text_splitters import RecursiveCharacterTextSplitter
    except ImportError:
        RecursiveCharacterTextSplitter = None  # use fallback below
from langchain_chroma import Chroma
from langchain_core.documents import Document

print("  (2/4) Done. Loading backend config...")
sys.stdout.flush()

from backend.embeddings import get_embeddings
from backend.config import (
    DATA_DIR,
    VECTOR_STORE_DIR,
    COLLECTION_NAME,
)


def load_documents():
    """Load all .txt from data/text_files and .pdf from data/pdf."""
    docs = []
    text_dir = DATA_DIR / "text_files"
    pdf_dir = DATA_DIR / "pdf"

    if text_dir.exists():
        print("  Loading .txt files...")
        loader = DirectoryLoader(
            str(text_dir),
            glob="*.txt",
            loader_cls=TextLoader,
            loader_kwargs={"encoding": "utf-8"},
            show_progress=True,
        )
        docs.extend(loader.load())
        print(f"Loaded {len(docs)} chunks from {text_dir}")
    else:
        print(f"No text dir: {text_dir}")

    if pdf_dir.exists():
        pdf_files = list(pdf_dir.glob("*.pdf"))
        print(f"  Loading {len(pdf_files)} PDF(s)...")
        for pdf_file in pdf_files:
            try:
                loader = PyPDFLoader(str(pdf_file))
                pages = loader.load()
                for d in pages:
                    d.metadata.setdefault("source_file", pdf_file.name)
                docs.extend(pages)
                print(f"  Loaded {len(pages)} pages from {pdf_file.name}")
            except Exception as e:
                print(f"  Error loading {pdf_file}: {e}")
    else:
        print(f"No pdf dir: {pdf_dir}")

    return docs


BATCH_SIZE = 50  # Add docs in batches so we can print progress


def _simple_split_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200, separators: list = None) -> list[str]:
    """Minimal recursive split when langchain-text-splitters is not installed."""
    separators = separators or ["\n\n", "\n", " ", ""]
    if len(text) <= chunk_size:
        return [text] if text.strip() else []

    for sep in separators:
        if sep == "":
            return [text[i : i + chunk_size] for i in range(0, len(text), chunk_size - chunk_overlap)]
        parts = text.split(sep)
        if len(parts) == 1:
            continue
        chunks = []
        current = ""
        for i, part in enumerate(parts):
            candidate = (current + sep + part) if current else part
            if len(candidate) <= chunk_size:
                current = candidate
            else:
                if current:
                    chunks.append(current)
                if len(part) > chunk_size:
                    chunks.extend(_simple_split_text(part, chunk_size, chunk_overlap, separators))
                    current = ""
                else:
                    current = part
        if current:
            chunks.append(current)
        return chunks
    return [text[:chunk_size]]


def _simple_split_documents(docs: list, chunk_size: int = 1000, chunk_overlap: int = 200) -> list:
    """Split LangChain-style documents with minimal logic."""
    out = []
    for doc in docs:
        for chunk_text in _simple_split_text(doc.page_content, chunk_size, chunk_overlap):
            if chunk_text.strip():
                out.append(Document(page_content=chunk_text, metadata=dict(doc.metadata)))
    return out


def main():
    print("Starting build_index...")
    VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)

    print("Loading documents...")
    docs = load_documents()
    if not docs:
        print("No documents found. Add .txt files to data/text_files or .pdf to data/pdf.")
        return 1

    print("Splitting into chunks...")
    if RecursiveCharacterTextSplitter is not None:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""],
        )
        chunks = splitter.split_documents(docs)
    else:
        print("  (using built-in splitter; install langchain-text-splitters for best results)")
        chunks = _simple_split_documents(docs, chunk_size=1000, chunk_overlap=200)
    print(f"Split into {len(chunks)} chunks")

    print("  (3/4) Using OpenAI embeddings (requires API key)...")
    sys.stdout.flush()
    embeddings = get_embeddings()
    print("  (4/4) Embedding chunks and saving to vector store...")
    vectorstore = Chroma(
        collection_name=COLLECTION_NAME,
        persist_directory=str(VECTOR_STORE_DIR),
        embedding_function=embeddings,
    )
    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i : i + BATCH_SIZE]
        vectorstore.add_documents(batch)
        print(f"  Indexed {min(i + BATCH_SIZE, len(chunks))}/{len(chunks)} chunks")
    print(f"Done. Index at {VECTOR_STORE_DIR} (collection: {COLLECTION_NAME})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
