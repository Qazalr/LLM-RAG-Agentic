from langchain_openai import OpenAIEmbeddings

def get_embeddings():
    """Return OpenAI embeddings (requires OPENAI_API_KEY in .env)."""
    return OpenAIEmbeddings(model="text-embedding-3-small")