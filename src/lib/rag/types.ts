/**
 * RAG domain types. Shared by the ingestion pipeline, the retriever, and the
 * chat route so the data contract stays consistent end to end.
 */

/** Frontmatter metadata, normalised and attached to every chunk. */
export interface DocMeta {
  title: string;
  summary: string;
  keywords: string[];
  tags: string[];
  category: string;
  /** Optional project slug for metadata filtering (e.g. "ai-platform"). */
  project?: string;
  lastUpdated: string;
  /** Source file path relative to `content/`, for attribution. */
  sourcePath: string;
}

/** A retrievable unit of knowledge. */
export interface Chunk {
  /** Stable id: `${sourcePath}#${ordinal}`. */
  id: string;
  text: string;
  /** SHA-256 of `text` — powers incremental re-embedding and de-duplication. */
  hash: string;
  /** Heading trail for context (e.g. ["Layered architecture"]). */
  headingPath: string[];
  meta: DocMeta;
}

export interface EmbeddedChunk extends Chunk {
  embedding: number[];
}

export interface RetrievedChunk extends Chunk {
  /** Cosine similarity to the query in [0, 1]. */
  score: number;
  /** Present when the store returns vectors (enables MMR re-ranking). */
  embedding?: number[];
}

/** Persisted embeddings snapshot (the in-memory store's data file). */
export interface KnowledgeIndex {
  model: string;
  dimensions: number;
  createdAt: string;
  chunks: EmbeddedChunk[];
}

/** A source citation surfaced to the UI. */
export interface Source {
  title: string;
  category: string;
  sourcePath: string;
}

export interface QueryOptions {
  topK: number;
  /** Optional metadata filter, e.g. `{ project: "ai-platform" }`. */
  filter?: Partial<Pick<DocMeta, "category" | "project">>;
}

/**
 * Storage abstraction. Swapping the in-memory store for Upstash (or anything
 * else) never touches the retriever or the chat route.
 */
export interface VectorStore {
  query(embedding: number[], options: QueryOptions): Promise<RetrievedChunk[]>;
}
