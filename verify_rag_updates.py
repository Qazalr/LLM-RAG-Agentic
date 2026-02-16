import sys
import os

# Add project root to sys.path
sys.path.append(os.getcwd())

from backend.rag import chat

def test_query(query, description):
    print(f"\n--- Testing: {description} ---")
    print(f"Query: '{query}'")
    try:
        response = chat(query)
        print("Response:")
        print(response)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Test 1: Context Query (English) - Should use PDF
    test_query("What is the Schrodinger Equation?", "Context Retrieval (English)")

    # Test 2: General Knowledge Query (English) - Should use LLM knowledge
    test_query("What is the capital of France?", "General Knowledge Fallback (English)")

    # Test 3: Arabic Context Query - Should use PDF and reply in Arabic
    test_query("ما هي معادلة شرودنغر؟", "Context Retrieval (Arabic)")

    # Test 4: General Knowledge Arabic Query - Should use LLM knowledge and reply in Arabic
    test_query("ما هي عاصمة فرنسا؟", "General Knowledge Fallback (Arabic)")
