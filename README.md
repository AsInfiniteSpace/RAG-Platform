V1 (done, deployed, working): A full production RAG SaaS — auth, owned/deduplicated document upload,
structure-aware PDF extraction (tables, multi-page continuation, borderless detection),
token-aware chunking, pgvector embeddings, hybrid retrieval + reranking, grounded chat with enforced citations and partial-answer handling,
multi-turn query rewriting, persistent conversations, a real evaluation harness (retrieval + LLM-judge faithfulness),
RBAC/admin, observability, rate limiting, and provider-aware usage quotas.
Deployed: Next.js on Vercel, FastAPI+worker+Postgres+Redis on Railway, Backblaze B2 for storage.
