"""Pinecone RAG client. Falls back to a no-op if Pinecone is not configured,
so the rest of the graph still runs in local/dev smoke tests.
"""
from __future__ import annotations

from typing import Any

from ..config import settings

try:
    from pinecone import Pinecone  # type: ignore
except ImportError:  # pragma: no cover
    Pinecone = None


class RAGClient:
    def __init__(self) -> None:
        self._index = None
        if Pinecone is not None and settings.pinecone_api_key:
            try:
                pc = Pinecone(api_key=settings.pinecone_api_key)
                self._index = pc.Index(settings.pinecone_index_name)
            except Exception:
                self._index = None

    @property
    def available(self) -> bool:
        return self._index is not None

    def search(self, query: str, top_k: int = 4) -> list[dict[str, Any]]:
        """Return a list of relevant knowledge snippets.

        When Pinecone is unavailable, returns a small static fallback so the
        agent flow still completes end-to-end in local development.
        """
        if not self._index:
            return [
                {
                    "source": "fallback-ada-2026",
                    "text": (
                        "ADA 2026 Standards of Care: diabetes diagnostic thresholds "
                        "include FPG >= 126 mg/dL, HbA1c >= 6.5%, OGTT >= 200 mg/dL. "
                        "Classic symptoms include polyuria, polydipsia, and unexplained "
                        "weight loss."
                    ),
                }
            ]
        # Real Pinecone path — embedding + query would go here once the KB is ingested.
        return []


rag_client = RAGClient()
