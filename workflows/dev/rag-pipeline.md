---
name: RAG Pipeline — From Zero to Production
category: dev
difficulty: intermediate
tools: LlamaIndex, Qdrant, Claude / GPT-4o, FastAPI
tested: true
---

# RAG Pipeline — From Zero to Production

> Ingest your documents, chunk them intelligently, store embeddings in a vector DB, and serve answers with citations. The complete production stack.

## What this is for

Retrieval-Augmented Generation (RAG) lets your AI answer questions about documents it wasn't trained on: internal wikis, PDF reports, support tickets, legal docs, codebases. This workflow covers the full pipeline from ingestion to a served API endpoint with citation support.

The choices made here (semantic chunking, hybrid search) reflect what most production RAG systems converge on after iterating. Fixed-size chunking and pure vector search are common starting points that consistently underperform.

---

## Stack

| Tool | Role | Docs |
|------|------|------|
| [LlamaIndex](https://docs.llamaindex.ai) | Document parsing, chunking, indexing pipeline | [Docs](https://docs.llamaindex.ai) |
| [Qdrant](https://qdrant.tech) | Vector database (self-hosted or cloud) | [Docs](https://qdrant.tech/documentation/) |
| `text-embedding-3-large` (OpenAI) | Embedding model | [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings) |
| `bge-m3` (BGE) | Open-source embedding alternative | [HuggingFace](https://huggingface.co/BAAI/bge-m3) |
| Claude Sonnet 4.6 | Answer generation with citations | [Claude API](https://docs.anthropic.com/en/api/) |
| [FastAPI](https://fastapi.tiangolo.com) | Serving the RAG endpoint | [Docs](https://fastapi.tiangolo.com) |

---

## Architecture

```
Documents (PDF, HTML, Notion, etc.)
        ↓
   LlamaIndex parser
        ↓
   Semantic chunking
        ↓
   Embedding model → Qdrant (vectors + metadata)
                              ↓
User query → embed query → hybrid search (vector + BM25)
                              ↓
                     top-k relevant chunks
                              ↓
                   Claude: "Answer this query using only these chunks"
                              ↓
                   Answer + citations (chunk source + page number)
```

---

## Workflow

### 1. Install Dependencies

```bash
pip install llama-index llama-index-vector-stores-qdrant \
            llama-index-embeddings-openai \
            qdrant-client fastapi uvicorn python-dotenv
```

### 2. Start Qdrant (local)

```bash
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    qdrant/qdrant
```

Or use [Qdrant Cloud](https://cloud.qdrant.io) (free tier: 1GB, 1M vectors).

### 3. Ingest Documents

```python
# ingest.py
import os
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.core.node_parser import SemanticSplitterNodeParser
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.vector_stores.qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

# Configure embedding model
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-large")

# Semantic chunker — splits on meaning, not character count
Settings.node_parser = SemanticSplitterNodeParser(
    buffer_size=1,               # sentences before/after for context
    breakpoint_percentile_threshold=95,  # higher = larger chunks
    embed_model=Settings.embed_model,
)

# Load documents (supports PDF, HTML, Markdown, Notion, Confluence, etc.)
documents = SimpleDirectoryReader(
    input_dir="./docs",
    recursive=True,
    required_exts=[".pdf", ".md", ".html", ".txt"]
).load_data()

# Connect to Qdrant
client = QdrantClient(host="localhost", port=6333)
vector_store = QdrantVectorStore(
    client=client,
    collection_name="company_docs",
    enable_hybrid=True  # enables BM25 sparse vectors alongside dense
)

# Build and persist index
index = VectorStoreIndex.from_documents(
    documents,
    vector_store=vector_store,
    show_progress=True
)
print(f"Indexed {len(documents)} documents")
```

### 4. Build the Query Engine

```python
# query.py
from llama_index.core import VectorStoreIndex, Settings
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.postprocessor import SimilarityPostprocessor
from llama_index.llms.anthropic import Anthropic
from llama_index.vector_stores.qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

# Use Claude for generation
Settings.llm = Anthropic(model="claude-sonnet-4-6", max_tokens=1024)

# Reconnect to existing index
client = QdrantClient(host="localhost", port=6333)
vector_store = QdrantVectorStore(client=client, collection_name="company_docs", enable_hybrid=True)
index = VectorStoreIndex.from_vector_store(vector_store)

# Hybrid retriever: vector similarity + keyword (BM25)
retriever = VectorIndexRetriever(
    index=index,
    similarity_top_k=5,
    vector_store_query_mode="hybrid",  # combines dense + sparse
    alpha=0.5,  # 0 = pure BM25, 1 = pure vector
)

query_engine = RetrieverQueryEngine(
    retriever=retriever,
    node_postprocessors=[SimilarityPostprocessor(similarity_cutoff=0.7)]
)

# Query with citations
response = query_engine.query("What is our refund policy for enterprise customers?")
print(response)
print("\nSources:")
for node in response.source_nodes:
    print(f"  - {node.metadata.get('file_name', 'unknown')} (score: {node.score:.3f})")
```

### 5. Serve as a FastAPI Endpoint

```python
# api.py
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class QueryRequest(BaseModel):
    question: str
    top_k: int = 5

@app.post("/query")
async def query_documents(req: QueryRequest):
    response = query_engine.query(req.question)
    return {
        "answer": str(response),
        "sources": [
            {
                "file": node.metadata.get("file_name"),
                "page": node.metadata.get("page_label"),
                "score": round(node.score, 3),
                "excerpt": node.text[:200]
            }
            for node in response.source_nodes
        ]
    }
```

```bash
uvicorn api:app --host 0.0.0.0 --port 8000
```

Sample response:
```json
{
  "answer": "Enterprise customers are eligible for a full refund within 30 days of purchase. After 30 days, a prorated credit is issued for unused months...",
  "sources": [
    {
      "file": "enterprise-terms-2026.pdf",
      "page": "4",
      "score": 0.912,
      "excerpt": "Enterprise customers may request a full refund within 30 days..."
    }
  ]
}
```

---

## Chunking Strategy: Why Semantic > Fixed-Size

| Strategy | How It Works | Problem |
|----------|--------------|---------|
| Fixed-size (512 tokens) | Split every 512 tokens | Cuts sentences mid-thought; poor retrieval on long concepts |
| Sliding window | Fixed-size with overlap | Better but still arbitrary splits |
| **Semantic** | Split on sentence embedding similarity | Chunks represent complete thoughts; much better retrieval |

The `SemanticSplitterNodeParser` embeds each sentence and splits when meaning changes significantly. This produces chunks that map to actual concepts in your documents.

---

## Tuning Hybrid Search

The `alpha` parameter controls the balance between vector similarity and keyword search:

- `alpha=1.0`: Pure vector search — good for semantic questions ("what is our philosophy on X?")
- `alpha=0.0`: Pure BM25 keyword — good for exact phrase lookup ("what does clause 4.2.1 say?")
- `alpha=0.5`: Balanced — best starting point for most use cases

For technical documentation with precise terminology, start at `alpha=0.3`. For conversational knowledge bases, start at `alpha=0.7`.

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: true
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- **Chunking quality determines retrieval quality.** A bad chunk strategy makes even the best embedding model underperform. Invest time in tuning `breakpoint_percentile_threshold`.
- **PDF parsing is lossy.** Tables and multi-column layouts confuse most PDF parsers. Use [Unstructured.io](https://unstructured.io) for complex PDFs.
- **Embedding costs scale.** At 1,000 documents × 50 chunks × 3,072 dimensions, `text-embedding-3-large` costs ~$0.50 to index. Set up incremental updates — don't re-index everything daily.
- **Hallucinations happen.** Claude will sometimes extrapolate beyond the retrieved chunks. Always include `"Answer ONLY from the provided context. If the answer is not in the context, say so."` in your system prompt.

---

## Sources

- [LlamaIndex documentation](https://docs.llamaindex.ai) — full RAG pipeline reference
- [Qdrant hybrid search guide](https://qdrant.tech/articles/hybrid-search/) — how BM25 + vector works
- [LlamaIndex RAG evaluation framework](https://docs.llamaindex.ai/en/stable/module_guides/evaluating/) — how to measure retrieval quality
- [Qdrant MCP Server](https://github.com/qdrant/mcp-server-qdrant) — use your vector DB directly from Claude
- [Anthropic Claude API](https://docs.anthropic.com/en/api/getting-started) — generation endpoint
- [BAAI/bge-m3 on HuggingFace](https://huggingface.co/BAAI/bge-m3) — open-source embedding alternative
