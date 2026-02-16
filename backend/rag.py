"""
RAG pipeline: load vector store, retriever, and LangGraph (retrieve -> generate).
"""

from typing import TypedDict

from langchain_chroma.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langgraph.graph import StateGraph, START, END

from backend.config import (
    OPENAI_API_KEY,
    OPENAI_MODEL,
    VECTOR_STORE_DIR,
    COLLECTION_NAME,
)

# --- State for the RAG graph ---


class RAGState(TypedDict):
    query: str
    context: str
    reply: str


def get_embeddings():
    """Use local embeddings (fast, no API) or OpenAI. Must match how the index was built."""
    from backend.embeddings import get_embeddings as _get
    return _get()


def get_vector_store():
    """Load existing Chroma vector store from data/vector_store."""
    return Chroma(
        collection_name=COLLECTION_NAME,
        persist_directory=str(VECTOR_STORE_DIR),
        embedding_function=get_embeddings(),
    )


def get_retriever(top_k: int = 5):
    store = get_vector_store()
    return store.as_retriever(search_kwargs={"k": top_k})


# --- LangGraph RAG: retrieve -> generate ---

RETRIEVE_PROMPT = """You are a helpful and knowledgeable assistant. You have access to a specific library of documents (Context), but you also have vast general knowledge.

INSTRUCTIONS:
1. **Priority to Context**: Always check the provided "Context" first. If the answer is there, use it and cite it implicitly.
2. **Fallback to General Knowledge**: If the "Context" does not contain the answer, you MUST use your general knowledge to answer the user's question helpfuly and correctly. Do NOT obtain a "I don't have information" response.
3. **Language Matching**: You MUST reply in the **SAME LANGUAGE** that the user uses in their question.
   - If the user asks in Arabic -> Reply in Arabic.
   - If the user asks in English -> Reply in English.
4. **Tone**: Be professional, direct, and helpful.

Context:
{context}

Question:
{query}

Answer:"""


def build_rag_graph():
    retriever = get_retriever(top_k=5)
    llm = ChatOpenAI(model=OPENAI_MODEL, temperature=0, api_key=OPENAI_API_KEY)
    prompt = ChatPromptTemplate.from_template(RETRIEVE_PROMPT)
    chain = prompt | llm | StrOutputParser()

    def retrieve(state: RAGState) -> dict:
        query = state["query"]
        docs = retriever.invoke(query)
        
        # Format context with source information for better traceability
        context_parts = []
        for i, doc in enumerate(docs, 1):
            source = doc.metadata.get("source", "unknown")
            content = doc.page_content.strip()
            context_parts.append(f"[Document {i} - Source: {source}]\n{content}")
        
        context = "\n\n---\n\n".join(context_parts) if context_parts else "No relevant context found."
        return {"context": context}

    def generate(state: RAGState) -> dict:
        reply = chain.invoke({"context": state["context"], "query": state["query"]})
        return {"reply": reply}

    graph = StateGraph(RAGState)
    graph.add_node("retrieve", retrieve)
    graph.add_node("generate", generate)

    graph.add_edge(START, "retrieve")
    graph.add_edge("retrieve", "generate")
    graph.add_edge("generate", END)

    return graph.compile()

_rag_graph = None


def get_rag_graph():
    global _rag_graph
    if _rag_graph is None:
        _rag_graph = build_rag_graph()
    return _rag_graph


def chat(message: str, conversation_id: str | None = None) -> str:
    """Run the RAG graph and return the reply. conversation_id is accepted for API compatibility but not used yet."""
    graph = get_rag_graph()
    result = graph.invoke({"query": message, "context": "", "reply": ""})
    return result.get("reply", "I couldn't generate a reply.").strip()
