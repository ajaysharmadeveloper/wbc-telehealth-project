"""Pinecone RAG client with priority-weighted search.

Embeds queries using OpenAI text-embedding-3-small, queries Pinecone,
and returns results sorted by (similarity_score * priority_weight).
Emergency protocol chunks rank higher than patient education chunks.

Falls back to a static snippet if Pinecone is not configured.
"""
from __future__ import annotations

from typing import Any

from openai import OpenAI

from ..config import settings

try:
    from pinecone import Pinecone  # type: ignore
except ImportError:  # pragma: no cover
    Pinecone = None

EMBEDDING_MODEL = "text-embedding-3-small"


class RAGClient:
    def __init__(self) -> None:
        self._index = None
        self._openai: OpenAI | None = None
        if Pinecone is not None and settings.pinecone_api_key:
            try:
                pc = Pinecone(api_key=settings.pinecone_api_key)
                self._index = pc.Index(settings.pinecone_index_name)
                self._openai = OpenAI(api_key=settings.openai_api_key)
            except Exception:
                self._index = None

    @property
    def available(self) -> bool:
        return self._index is not None

    def _embed(self, text: str) -> list[float]:
        """Embed a single query string via OpenAI."""
        resp = self._openai.embeddings.create(input=[text], model=EMBEDDING_MODEL)
        return resp.data[0].embedding

    def search(self, query: str, top_k: int = 5) -> list[dict[str, Any]]:
        """Search knowledge base and return results weighted by priority.

        Returns results sorted by (cosine_score * category_priority) so
        emergency protocols rank above patient education for the same
        similarity score.

        Each result: {source, doc_title, section_header, category, text, score, keywords}
        """
        if not self._index:
            return [
                {
                    "source": "fallback-ada-2026",
                    "doc_title": "ADA Standards of Care 2026",
                    "section_header": "Diagnostic Thresholds",
                    "category": "guideline",
                    "text": (
                        "ADA 2026 Standards of Care: diabetes diagnostic thresholds "
                        "include FPG >= 126 mg/dL, HbA1c >= 6.5%, OGTT >= 200 mg/dL. "
                        "Classic symptoms include polyuria, polydipsia, and unexplained "
                        "weight loss. Random plasma glucose >= 200 mg/dL with symptoms "
                        "also confirms diabetes."
                    ),
                    "score": 1.0,
                    "keywords": "a1c,fasting glucose,ogtt,polyuria,polydipsia,weight loss",
                }
            ]

        query_embedding = self._embed(query)

        # Fetch more than top_k so we can re-rank by priority
        results = self._index.query(
            vector=query_embedding,
            top_k=top_k * 2,
            include_metadata=True,
        )

        # Re-rank: weighted_score = cosine_score * priority
        ranked = []
        for match in results.matches:
            meta = match.metadata or {}
            priority = meta.get("priority", 0.5)
            weighted_score = match.score * (0.5 + 0.5 * priority)  # priority boosts 50-100%
            ranked.append({
                "source": meta.get("source_file", "unknown"),
                "doc_title": meta.get("doc_title", ""),
                "section_header": meta.get("section_header", ""),
                "category": meta.get("category", "general"),
                "text": meta.get("text", ""),
                "score": round(weighted_score, 4),
                "keywords": meta.get("keywords", ""),
            })

        # Sort by weighted score descending, take top_k
        ranked.sort(key=lambda r: r["score"], reverse=True)
        return ranked[:top_k]


rag_client = RAGClient()
