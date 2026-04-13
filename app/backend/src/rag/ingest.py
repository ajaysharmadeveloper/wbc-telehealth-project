"""Pinecone knowledge base ingestion pipeline.

Reads markdown files, enriches chunks with document context, generates
embeddings, and upserts into Pinecone with rich metadata.

Improvements over naive chunking:
- Context-enriched chunks: each chunk is prefixed with document title + section header
- Medical keyword extraction per chunk for hybrid-search metadata
- Category tagging (guideline, emergency, education, screening) with priority weighting
- Markdown-aware splitting that respects document structure
- Deterministic IDs for safe re-runs (overwrite, no duplicates)

Run from app/backend/:
    python -m src.rag.ingest [--data-dir /path/to/knowledge]
"""
from __future__ import annotations

import argparse
import hashlib
import re
import time
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec

from ..config import settings

# ── defaults ────────────────────────────────────────────────────────────
DEFAULT_DATA_DIR = Path("/data/knowledge")
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1536
CHUNK_SIZE = 800   # chars (~200 tokens) — smaller for precise retrieval
CHUNK_OVERLAP = 150  # chars — enough to preserve boundary context
UPSERT_BATCH = 100
EMBED_BATCH = 256

# ── category mapping (directory → category + priority) ──────────────────
CATEGORY_MAP = {
    "emergency_protocols": {"category": "emergency", "priority": 1.0},
    "screening_diagnosis": {"category": "screening", "priority": 0.8},
    "ada_guidelines":      {"category": "guideline", "priority": 0.7},
    "patient_education":   {"category": "education", "priority": 0.5},
}

# ── medical keywords to extract for metadata ────────────────────────────
MEDICAL_KEYWORDS = [
    "dka", "hhs", "hypoglycemia", "hyperglycemia", "ketoacidosis",
    "polyuria", "polydipsia", "polyphagia", "insulin", "metformin",
    "a1c", "hba1c", "fasting glucose", "ogtt", "blood glucose",
    "type 1", "type 2", "gestational", "prediabetes",
    "neuropathy", "retinopathy", "nephropathy", "cardiovascular",
    "emergency", "seizure", "coma", "fruity breath",
    "weight loss", "fatigue", "blurred vision", "dehydration",
    "glucose tablets", "glucagon", "sglt-2", "glp-1",
]


def _collect_markdown_files(data_dir: Path) -> list[Path]:
    """Recursively find all .md files under *data_dir*."""
    files = sorted(data_dir.rglob("*.md"))
    if not files:
        raise FileNotFoundError(f"No .md files found under {data_dir}")
    return files


def _extract_doc_title(text: str) -> str:
    """Extract the H1 title from markdown text."""
    for line in text.splitlines():
        line = line.strip()
        if line.startswith("# ") and not line.startswith("##"):
            return line[2:].strip()
    return ""


def _extract_section_header(chunk_text: str, full_text: str, chunk_start: int) -> str:
    """Find the nearest ## or ### header above this chunk's position."""
    text_before = full_text[:chunk_start]
    # Search backwards for last ## header
    for pattern in [r'^### (.+)$', r'^## (.+)$']:
        matches = list(re.finditer(pattern, text_before, re.MULTILINE))
        if matches:
            return matches[-1].group(1).strip()
    return ""


def _extract_keywords(text: str) -> list[str]:
    """Extract medical keywords present in the text."""
    text_lower = text.lower()
    return [kw for kw in MEDICAL_KEYWORDS if kw in text_lower]


def _enrich_chunk(chunk_text: str, doc_title: str, section_header: str) -> str:
    """Prepend document context to the chunk for better embedding quality.

    This ensures each chunk is self-contained — when retrieved, the embedding
    model and LLM both understand the full context of the information.
    """
    parts = []
    if doc_title:
        parts.append(f"[{doc_title}]")
    if section_header:
        parts.append(f"[{section_header}]")
    if parts:
        return " ".join(parts) + "\n" + chunk_text
    return chunk_text


def _chunk_file(path: Path, splitter: RecursiveCharacterTextSplitter) -> list[dict]:
    """Read a markdown file and split into enriched chunks with rich metadata."""
    full_text = path.read_text(encoding="utf-8")
    doc_title = _extract_doc_title(full_text)
    section = path.parent.name
    cat_info = CATEGORY_MAP.get(section, {"category": "general", "priority": 0.5})

    chunks = splitter.split_text(full_text)

    result = []
    search_pos = 0
    for idx, chunk_text in enumerate(chunks):
        # Find chunk position in original text for section header extraction
        chunk_start = full_text.find(chunk_text[:50], search_pos)
        if chunk_start == -1:
            chunk_start = search_pos
        search_pos = chunk_start + len(chunk_text)

        section_header = _extract_section_header(chunk_text, full_text, chunk_start)
        enriched_text = _enrich_chunk(chunk_text, doc_title, section_header)
        keywords = _extract_keywords(chunk_text)

        result.append({
            "text": enriched_text,
            "raw_text": chunk_text,
            "metadata": {
                "source_file": path.name,
                "doc_title": doc_title,
                "section": section,
                "section_header": section_header,
                "category": cat_info["category"],
                "priority": cat_info["priority"],
                "chunk_index": idx,
                "keywords": keywords,
                "text": enriched_text,  # stored for retrieval
            },
        })

    return result


def _embed_texts(client: OpenAI, texts: list[str]) -> list[list[float]]:
    """Embed a batch of texts using OpenAI."""
    resp = client.embeddings.create(input=texts, model=EMBEDDING_MODEL)
    return [item.embedding for item in resp.data]


def _stable_id(source_file: str, chunk_index: int) -> str:
    """Deterministic vector ID so re-runs overwrite rather than duplicate."""
    raw = f"{source_file}::{chunk_index}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def _ensure_index(pc: Pinecone, index_name: str, region: str) -> None:
    """Create the Pinecone serverless index if it doesn't exist."""
    existing = [idx.name for idx in pc.list_indexes()]
    if index_name in existing:
        print(f"  Index '{index_name}' already exists — skipping creation.")
        return

    print(f"  Creating serverless index '{index_name}' (dim={EMBEDDING_DIM}, cosine)...")
    pc.create_index(
        name=index_name,
        dimension=EMBEDDING_DIM,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region=region),
    )
    while not pc.describe_index(index_name).status["ready"]:
        print("    Waiting for index to be ready...")
        time.sleep(2)
    print("  Index ready.")


def run(data_dir: Path) -> None:
    """Main ingestion pipeline."""

    # 1. Collect files
    files = _collect_markdown_files(data_dir)
    print(f"\n{'='*60}")
    print(f"  Pinecone Knowledge Base Ingestion")
    print(f"{'='*60}")
    print(f"\nSource: {data_dir}")
    print(f"Files:  {len(files)}")

    # 2. Chunk with markdown-aware splitting
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        separators=[
            "\n## ",      # H2 headers (major sections)
            "\n### ",     # H3 headers (subsections)
            "\n---\n",    # Horizontal rules
            "\n\n",       # Paragraphs
            "\n",         # Lines
            ". ",         # Sentences
            " ",          # Words
        ],
    )

    all_chunks: list[dict] = []
    print(f"\nChunking files:")
    for f in files:
        chunks = _chunk_file(f, splitter)
        all_chunks.extend(chunks)
        cat = CATEGORY_MAP.get(f.parent.name, {}).get("category", "general")
        print(f"  {f.name:<50} {len(chunks):>3} chunks  [{cat}]")

    print(f"\nTotal chunks: {len(all_chunks)}")

    # Show keyword distribution
    all_kw = set()
    for c in all_chunks:
        all_kw.update(c["metadata"]["keywords"])
    print(f"Unique keywords found: {len(all_kw)}")

    # 3. Embed (using enriched text, not raw)
    openai_client = OpenAI(api_key=settings.openai_api_key)
    texts = [c["text"] for c in all_chunks]

    print(f"\nGenerating embeddings ({EMBEDDING_MODEL})...")
    embeddings: list[list[float]] = []
    for i in range(0, len(texts), EMBED_BATCH):
        batch = texts[i : i + EMBED_BATCH]
        embeddings.extend(_embed_texts(openai_client, batch))
        done = min(i + EMBED_BATCH, len(texts))
        print(f"  Embedded {done}/{len(texts)}")

    # 4. Ensure Pinecone index exists
    print(f"\nPinecone setup:")
    pc = Pinecone(api_key=settings.pinecone_api_key)
    _ensure_index(pc, settings.pinecone_index_name, settings.pinecone_environment)

    # 5. Upsert with rich metadata
    index = pc.Index(settings.pinecone_index_name)
    upserted = 0
    print(f"\nUpserting vectors:")
    for i in range(0, len(all_chunks), UPSERT_BATCH):
        batch_vectors = []
        for j in range(i, min(i + UPSERT_BATCH, len(all_chunks))):
            chunk = all_chunks[j]
            vec_id = _stable_id(
                chunk["metadata"]["source_file"], chunk["metadata"]["chunk_index"]
            )
            # Pinecone metadata: convert keywords list to comma-separated string
            # (Pinecone supports list metadata but comma-string is more portable)
            meta = {**chunk["metadata"]}
            meta["keywords"] = ",".join(meta["keywords"])
            batch_vectors.append({
                "id": vec_id,
                "values": embeddings[j],
                "metadata": meta,
            })
        index.upsert(vectors=batch_vectors)
        upserted += len(batch_vectors)
        print(f"  Upserted {upserted}/{len(all_chunks)}")

    print(f"\n{'='*60}")
    print(f"  Done! {upserted} vectors in '{settings.pinecone_index_name}'")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest knowledge base into Pinecone")
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=DEFAULT_DATA_DIR,
        help="Root directory containing markdown knowledge files",
    )
    args = parser.parse_args()
    run(args.data_dir)
