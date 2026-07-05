/**
 * Central RAG configuration. Every tunable — model names, dimensions, retrieval
 * thresholds, limits — lives here so nothing is magic and a model swap is a
 * one-file change (plus a re-ingest).
 */
export const RAG_CONFIG = {
  embedding: {
    /** Local Transformers.js model — no API key, runs at ingest + query time. */
    model: "Xenova/bge-small-en-v1.5",
    dimensions: 384,
    /** BGE models expect this instruction prefix on the *query* side only. */
    queryPrefix: "Represent this sentence for searching relevant passages: ",
  },
  retrieval: {
    /** Final number of chunks fed to the model. */
    topK: 6,
    /** Larger candidate pool retrieved before MMR re-ranking for diversity. */
    candidatePool: 18,
    /** Cosine floor — below this, a chunk is considered irrelevant. */
    similarityThreshold: 0.34,
    /** MMR trade-off: 1 = pure relevance, 0 = pure diversity. */
    mmrLambda: 0.6,
  },
  chunking: {
    /** Soft max characters per chunk (~300–380 tokens). */
    maxChars: 1200,
    /** Merge trailing sections smaller than this into the previous chunk. */
    minChars: 220,
  },
  generation: {
    /** Any OpenRouter model slug. Overridable via env (empty falls back). */
    model: process.env.OPENROUTER_MODEL?.trim() || "qwen/qwen3-coder:free",
    temperature: 0.2,
    maxOutputTokens: 900,
  },
  limits: {
    maxQuestionChars: 500,
    /** Trailing history turns kept for context (excludes the new question). */
    maxHistoryMessages: 10,
  },
  /** Path (relative to project root) of the generated embeddings snapshot. */
  knowledgePath: "data/knowledge.json",
  manifestPath: "data/knowledge.manifest.json",
} as const;

/** OpenRouter is an OpenAI-compatible gateway. */
export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
