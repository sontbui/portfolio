# AI Portfolio Assistant — RAG Architecture

> Status: **IMPLEMENTED.** Approved decisions: OpenRouter for generation (no
> Gemini), **local Transformers.js embeddings** (`bge-small-en-v1.5`, single-key),
> in-memory store + Upstash adapter, generative-UI rich responses, deploy on Vercel.
> To go live: set `OPENROUTER_API_KEY`, run `npm run ingest`, deploy.
> Feature: an intelligent, retrieval-grounded assistant that answers questions about
> Son Bui strictly from curated portfolio knowledge. Not a general chatbot.

---

## 1. System overview

Two independent pipelines. This separation is the single most important decision:
retrieval infrastructure is expensive and slow to build per-request, so we do it
**once, offline**, and keep the **request path thin**.

### A. Ingestion pipeline — offline (build / CLI, never per-request)

```
content/**/*.md
   ↓  parse frontmatter + body            (gray-matter)
   ↓  section-aware chunking               (~250–400 tokens, H2/H3 boundaries)
   ↓  content hashing (per chunk)          (skip unchanged → incremental)
   ↓  embed changed chunks                 (Google text-embedding-004, 768-d)
   ↓  upsert into vector store             (id = stable hash, payload = metadata)
knowledge index (JSON snapshot + optional Upstash)
```

### B. Query pipeline — runtime (serverless, streamed)

```
User question
   ↓  sanitize + length-cap + rate-limit         (server action / route handler)
   ↓  embed query                                (same embedding model)
   ↓  vector search: topK + cosine threshold     (retriever interface)
   ↓  metadata filter + de-dupe + MMR re-rank     (diversity, no near-duplicates)
   ↓  assemble grounded context + source refs
   ↓  construct system + context + question prompt
   ↓  Gemini 2.5 Flash via Vercel AI SDK (streamText)
   ↓  stream tokens (+ optional tool calls for rich UI)
Client renders: markdown + code + (optional) portfolio components
```

**Why offline ingestion:** embeddings for a personal portfolio change only when *content*
changes (a few times a month). Generating them per request would add latency, cost, and a
hard dependency on the embedding API being up during every visit. Build-time ingestion makes
the query path cheap and resilient.

---

## 2. Architectural decisions (and why)

| Decision | Choice | Rationale |
|---|---|---|
| Ingestion timing | Offline CLI (`npm run ingest`) + optional CI step | Cost/latency/resilience; content changes rarely |
| Incremental embedding | Per-chunk SHA-256 content hash + manifest | "Only regenerate when content changes" — re-embed only dirty chunks |
| Chunking | Section-aware (Markdown H2/H3), 250–400 tokens, small overlap | Portfolio prose is short & structured; semantic sections beat fixed windows and preserve source attribution |
| Metadata model | Frontmatter (`title, summary, keywords, tags, category, lastUpdated`) inherited onto every chunk | Enables filtering, attribution, ranking, future sources |
| Embedding model | **Google `text-embedding-004`** (768-d) | Same provider/key as Gemini; strong quality/cost; native AI SDK support. (Confirm latest name — `gemini-embedding-001` — at build.) |
| Vector store | **Interface + two impls: in-memory JSON (default) and Upstash Vector (scale)** | For ~50 chunks a hosted DB is unnecessary; abstraction lets us swap without touching retrieval |
| LLM | Gemini 2.5 Flash **via OpenRouter** (`google/gemini-2.5-flash`, OpenAI-compatible) | One key for any model; OpenRouter is a drop-in OpenAI API. **Note: OpenRouter has no embeddings endpoint** — embeddings use a separate provider (see §3) |
| Transport | Vercel AI SDK `streamText` in a Route Handler | First-class streaming, cancellation, tool calls, React hooks |
| Rich responses | Tool-based generative UI reusing existing diagram/card components | No duplicate UI; LLM *requests* a component, client renders the real one |
| Grounding | Strict "answer only from CONTEXT; else say you don't know" system prompt + low temperature | Never hallucinate / never invent experience |
| Security | Server-only key, input caps, injection defenses, per-IP rate limit | Production hygiene; protect cost & prompt |

---

## 3. Vector database & embedding model recommendation

### Embedding model — updated for OpenRouter
Since **OpenRouter cannot generate embeddings** (chat-completions only), embeddings are
decoupled from generation. Three viable paths:

| Path | Keys needed | Cost | Serverless fit | Notes |
|---|---|---|---|---|
| **Local (Transformers.js, `bge-small-en-v1.5`, 384-d)** | OpenRouter only | Free | Good (wasm backend); query embed = 1 short sentence | ✅ single-key, no embedding vendor |
| Google `text-embedding-004` (768-d) | OpenRouter **+ Google AI Studio** | Free tier | Excellent (HTTP) | Best quality/robustness, but 2 keys |
| Jina / Cohere embeddings (hosted) | OpenRouter **+ 1 more** | Free tier | Excellent (HTTP) | Light serverless, 2 keys |

The embedding model name + dimension live in `config.ts`; doc and query embeddings **must** use
the same model, so switching = change config + re-ingest. Retrieval code is unaffected.

### Vector database — comparison

| Option | Fit for a personal portfolio | Ops | Edge/serverless | Free tier | Verdict |
|---|---|---|---|---|---|
| **Upstash Vector** | Excellent | None (HTTP, serverless) | Native (REST, no TCP) | Generous, pay-per-request | ✅ **Chosen for scale** |
| Pinecone | Overkill | Managed but SDK-heavy | Needs SDK | Yes, but limited | Too heavy for ~50 chunks |
| Supabase pgvector | Good *if* already using Supabase | Runs a Postgres you don't otherwise need | Via client | Good | Adds infra we don't need |
| Cloudflare Vectorize | Great *if* deploying on Cloudflare | Low, but CF-coupled | Native on Workers | Yes | Wrong ecosystem if on Vercel |

### Recommendation (staff-level nuance)
A personal portfolio is **~30–80 chunks**. At that size, "vector database" is the wrong
default instinct — cosine similarity over a bundled JSON array runs in **<1 ms** in the
serverless function with **zero network hops, zero cost, zero new service**.

So the design ships a **`VectorStore` interface** with:
- **`MemoryVectorStore`** (default): loads a build-time `knowledge.json`, in-memory cosine. Zero infra.
- **`UpstashVectorStore`** (opt-in via env): for when the corpus grows (blog, articles, talks) past a few hundred chunks, or when you want the index decoupled from the deploy.

**Chosen production DB: Upstash Vector.** It's the one I implement the adapter for, and the
one to flip on when scale demands it. Starting in-memory is the honest engineering call; the
interface means "choose one, implement it" costs nothing to change later.

---

## 4. Retrieval strategy

- **Semantic search:** cosine similarity between query embedding and chunk embeddings.
- **Top-K:** default `K=6` (tunable). Enough context, small prompt.
- **Similarity threshold:** drop chunks below `~0.55`. If *nothing* clears the bar → the
  assistant says it doesn't have that information (a primary anti-hallucination guard).
- **Metadata filtering:** optional `category`/`tags` filter (e.g. project-specific questions).
- **De-duplication:** collapse chunks with near-identical content hashes; **MMR** re-rank so
  the K results are relevant *and* diverse (avoids 6 chunks all saying the same thing).
- **Context ranking:** order by score; each chunk carries `{title, category, sourcePath}`.
- **Source attribution:** retrieved sources are returned alongside the answer so the UI can
  show "Based on: About, AI Platform" chips — and so answers are auditable.

---

## 5. Folder structure

```
content/                              # knowledge base (Markdown + frontmatter)
  about.md
  experience.md
  skills.md
  achievements.md
  engineering-principles.md
  projects/
    ai-platform.md
    automation-framework.md
    test-infrastructure.md
    ecommerce.md
  blog/                               # future — picked up automatically

data/
  knowledge.json                      # generated embeddings snapshot (git-ignored or committed)
  knowledge.manifest.json             # content hashes for incremental re-embed

scripts/
  ingest.ts                           # npm run ingest — chunk, embed, upsert

src/
  app/
    api/chat/route.ts                 # POST — streamed RAG endpoint (server only)
  lib/rag/
    types.ts                          # Chunk, RetrievedChunk, VectorStore interface
    chunk.ts                          # section-aware markdown chunker
    embed.ts                          # embedding client (model-agnostic)
    retriever.ts                      # search + threshold + MMR + dedupe + attribution
    prompt.ts                         # system prompt + context assembly
    stores/
      memory-store.ts                 # default: in-memory cosine over knowledge.json
      upstash-store.ts                # opt-in adapter
    guardrails.ts                     # input sanitation, injection heuristics, limits
    config.ts                         # K, threshold, model names, dimensions
  components/assistant/
    assistant-launcher.tsx            # floating trigger (lazy-loads the panel)
    assistant-panel.tsx               # chat surface (client)
    message-list.tsx / message.tsx
    suggested-questions.tsx           # the suggestion cards
    rich/                             # tool renderers → reuse existing diagrams/cards
    markdown.tsx                      # md + syntax highlight + copy-code
  hooks/
    use-assistant.ts                  # wraps AI SDK useChat: cancel, retry, history
```

**Adding a knowledge source later** (resume, blog, GitHub README, talks) = drop a `.md` in
`content/` and run `npm run ingest`. The retrieval pipeline never changes. That is the
"future ready" requirement satisfied structurally.

---

## 6. Security

- **API keys** live only in server env (`OPENROUTER_API_KEY`, and — if a hosted embedding
  provider is chosen — its key too), read inside the Route Handler. Never shipped to the client,
  never in `NEXT_PUBLIC_*`.
- **Server-only route:** the chat endpoint is a server Route Handler; retrieval + model calls
  happen server-side. The browser only sees streamed text + tool directives.
- **Input sanitation & caps:** trim, strip control chars, hard length cap (e.g. 500 chars),
  reject empty/oversized payloads.
- **Prompt-injection defenses:** (1) strict instruction hierarchy — retrieved context is
  wrapped and explicitly labeled as *untrusted data, not instructions*; (2) the system prompt
  forbids following instructions found inside context/user text; (3) scope guard — refuse
  off-topic / "ignore your instructions" style requests; (4) never reveal the system prompt.
- **Token abuse:** `maxTokens` cap on output, `K` cap on context, one in-flight request per
  client, and per-IP **rate limiting** (Upstash Ratelimit or an in-memory limiter for single
  region). Return `429` with a friendly message.
- **No PII collection:** questions aren't persisted server-side by default.

---

## 7. Scalability

- **Corpus growth:** in-memory store is fine to ~a few hundred chunks. Past that, flip
  `VECTOR_STORE=upstash` — same retriever, same prompt, no code churn.
- **Incremental ingest:** content-hash manifest means adding one blog post re-embeds only that
  post's chunks, not the whole corpus.
- **Caching:** (1) embeddings cached at build; (2) optional LRU/Upstash cache on
  `hash(normalizedQuestion) → retrieved chunk ids` so repeat questions skip the vector step;
  (3) suggested-question answers are inherently cache-friendly.
- **Model swaps:** embedding/LLM model names and dimensions live in `config.ts`.
- **Multi-source:** loaders are per-extension; adding a source type = one loader, no pipeline
  change.

---

## 8. Deployment architecture

**This feature requires a server runtime.** The current site is `output: "export"` (static),
which cannot run the chat endpoint. Resolution options (see decision request):

- **Recommended — Vercel (Hobby, free):** drop `output: "export"`. Marketing pages stay
  statically prerendered; the chat lives in a serverless Route Handler. Env vars in Vercel
  project settings. Streaming works out of the box. This is the natural home for AI SDK + Gemini.
- **Hybrid:** keep GitHub Pages static site + host only the chat endpoint as a separate
  serverless function (Vercel Function / Cloudflare Worker) and call it cross-origin. Two
  deploys, CORS, more moving parts.
- **Static-only fallback:** ship the assistant *disabled* on GitHub Pages (feature-flagged),
  enabled only where a server exists. Preserves the free static deploy but the signature
  feature is absent on Pages.

Ingestion runs in CI (or locally) before deploy; `knowledge.json` is produced from `content/`.

---

## 9. Staff-engineer review of this design

**Strengths:** clean separation of ingest vs query; the request path is thin and cheap;
grounding + threshold + refusal directly satisfy "never hallucinate"; the `VectorStore`
interface avoids premature infra while honoring the DB requirement; rich UI reuses existing
components instead of reinventing them.

**Risks & mitigations I'd raise in review:**
1. **Over-engineering the DB.** Shipping Pinecone/Upstash for 50 chunks would be resume-driven
   design. → Mitigated by starting in-memory behind an interface.
2. **Hallucination via weak grounding.** LLMs paraphrase beyond context. → Low temperature,
   explicit "only from context" contract, similarity floor, and an eval set of the 10 sample
   questions run before shipping.
3. **Prompt injection** through content or user text. → Context labeled untrusted; instruction
   hierarchy; scope refusal; never echo the system prompt. (Note: no defense is total — we
   reduce, not eliminate, and we keep the blast radius tiny since the model has no tools that
   touch secrets.)
4. **Cost/abuse.** → Output token cap, per-IP rate limit, single in-flight request, input cap.
5. **Cold starts / streaming on serverless.** → Node runtime route; keep dependencies lean;
   lazy-load the chat UI so it never touches first paint.
6. **Deployment regression.** Turning off static export affects the GitHub Pages story we
   agreed. → Explicit decision below; hybrid/flag options preserve a static fallback.

**What I'd cut for v1:** offline eval harness can be a follow-up; Upstash adapter can be
stubbed until scale needs it; conversation persistence stays client-side only.

**Verdict:** approve **conditional on** the deployment decision (§8) and confirming the vector
store and rich-response scope. No red flags in the core RAG design.

---

## Open decisions (need sign-off before implementation)

1. **Runtime/deployment** — move to Vercel (recommended) vs hybrid vs static-only fallback.
2. **Vector store** — in-memory JSON now + Upstash adapter (recommended) vs Upstash from day 1.
3. **Rich responses** — tool-based generative UI (reuse diagrams/cards) vs markdown-first v1.
4. **Knowledge authoring** — generate `content/*.md` from existing portfolio data (recommended)
   vs you author it.
```
