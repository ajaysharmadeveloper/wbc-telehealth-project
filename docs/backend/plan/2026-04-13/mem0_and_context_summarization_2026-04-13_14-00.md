# Plan: Mem0 Memory + Conversation Context Summarization

Date: 2026-04-13 14:00

## Problem
Agent loads ALL conversation history and sends it raw to LLM every turn. Wastes tokens as conversations grow. No long-term memory across session context.

## Solution

### 1. Mem0 Integration (Long-term Session Memory)
- Mem0 stores key patient facts (symptoms, preferences, context) keyed by `session_id` (anonymous users)
- After each turn: extract and store facts into mem0
- Before agent runs: search mem0 for relevant memories, inject into system prompt
- Uses Qdrant local file storage (no extra Docker container)

### 2. Conversation Summarization (Smart Context Window)
**Dual threshold** — summarize when EITHER condition is met:
- **Message count**: More than 5 total messages (user + assistant)
- **Token limit**: Recent raw messages exceed `CONTEXT_TOKEN_LIMIT` (default 2000 tokens)

**Algorithm:**
1. Start from most recent message, work backwards
2. Keep adding to "raw" bucket while: count < 5 AND tokens < CONTEXT_TOKEN_LIMIT
3. Everything else -> summarize into `conversation_summary` (stored in sessions table)
4. Always keep at least 1 raw message

**What gets sent to agent:**
```
[System Prompt] + [Mem0 Memory Context] + [Summary of older messages] + [Recent raw messages]
```

### 3. Files to Create/Modify

| File | Action | What |
|------|--------|------|
| `requirements.txt` | Modify | Add `mem0ai`, `tiktoken` |
| `src/config/__init__.py` | Modify | Add `mem0_enabled`, `context_token_limit` settings |
| `src/models/session.py` | Modify | Add `conversation_summary` column |
| `alembic/versions/` | Create | Migration for new column |
| `src/services/memory.py` | Create | Mem0 client: `add_memory()`, `search_memory()` |
| `src/services/summarizer.py` | Create | `summarize_messages()`, `count_tokens()`, `select_raw_messages()` |
| `src/agent/state.py` | Modify | Add `conversation_summary`, `mem0_context` fields |
| `src/agent/nodes/agent_node.py` | Modify | Inject mem0 + summary into LLM context |
| `src/agent/nodes/save_node.py` | Modify | Store mem0 memories + trigger summarization |
| `src/api/chat.py` | Modify | Load summary, apply dual-threshold, search mem0 |

### 4. Key Design Decisions
- Sessions are anonymous (no user_id accounts) — mem0 keyed by session_id
- Qdrant local storage (file-based, `/tmp/qdrant` or configurable)
- tiktoken for accurate OpenAI token counting
- Summary is incremental (existing summary + new older messages -> updated summary)
- Minimum 1 raw message always sent even if over token limit
