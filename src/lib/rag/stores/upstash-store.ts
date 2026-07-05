import { Index } from "@upstash/vector";

import type { DocMeta, QueryOptions, RetrievedChunk, VectorStore } from "@/lib/rag/types";

/**
 * Upstash Vector adapter — the production store to enable once the corpus grows
 * past what an in-memory scan should handle (blog, articles, talks). Activated
 * via `VECTOR_STORE=upstash`; the retriever and route are unchanged.
 *
 * Metadata mirrors the chunk fields so results reconstruct without a second
 * lookup. `includeVectors` is requested so the retriever can run MMR.
 */

interface StoredMetadata extends DocMeta {
  text: string;
  hash: string;
  headingPath: string[];
}

export class UpstashVectorStore implements VectorStore {
  private index: Index;

  constructor() {
    // Reads UPSTASH_VECTOR_REST_URL / UPSTASH_VECTOR_REST_TOKEN from env.
    this.index = Index.fromEnv();
  }

  async query(embedding: number[], options: QueryOptions): Promise<RetrievedChunk[]> {
    const filterParts: string[] = [];
    if (options.filter?.category) filterParts.push(`category = '${options.filter.category}'`);
    if (options.filter?.project) filterParts.push(`project = '${options.filter.project}'`);

    const results = await this.index.query({
      vector: embedding,
      topK: options.topK,
      includeMetadata: true,
      includeVectors: true,
      filter: filterParts.length ? filterParts.join(" AND ") : undefined,
    });

    return results.map((r) => {
      const meta = r.metadata as unknown as StoredMetadata;
      const { text, hash, headingPath, ...docMeta } = meta;
      return {
        id: String(r.id),
        text,
        hash,
        headingPath,
        meta: docMeta,
        score: r.score,
        embedding: r.vector ?? undefined,
      } satisfies RetrievedChunk;
    });
  }
}
