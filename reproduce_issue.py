import sys
import os

# Add project root to sys.path
sys.path.append(os.getcwd())

from backend.rag import chat

# Query relevant to the available document ("Introduction to Quantum Mechanics")
query = "What is the Schrodinger Equation?"

try:
    print(f"Attempting to chat with query: '{query}'")
    response = chat(query)
    print("\nResponse:")
    print(response)
except Exception as e:
    import traceback
    traceback.print_exc()
