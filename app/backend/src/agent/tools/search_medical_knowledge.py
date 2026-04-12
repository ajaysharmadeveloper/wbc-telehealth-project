"""Tool: search_medical_knowledge — RAG lookup over the ADA/diabetes KB."""
from __future__ import annotations

from typing import Any

from langchain_core.tools import tool

from ...rag.client import rag_client


@tool
def search_medical_knowledge(query: str, top_k: int = 4) -> dict[str, Any]:
    """Retrieve diabetes-related clinical guidance for the given query.

    Backed by Pinecone when configured. Falls back to a small static snippet
    so the ReAct loop can still complete in local development.
    """
    results = rag_client.search(query=query, top_k=top_k)
    return {"query": query, "results": results, "source": "pinecone" if rag_client.available else "fallback"}
