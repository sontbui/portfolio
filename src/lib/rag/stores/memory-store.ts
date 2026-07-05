import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { RAG_CONFIG } from "@/lib/rag/config";
import type {
  KnowledgeIndex,
  QueryOptions,
  RetrievedChunk,
  VectorStore,
} from "@/lib/rag/types";

/**
 * Default store: cosine similarity over a build-time embeddings snapshot,
 * held in memory. For a portfolio-sized corpus (tens of chunks) this is faster
 * than any network round-trip and needs zero infrastructure.
 */

let indexCache: KnowledgeIndex | null = null;

function knowledgeFilePath(): string {
  return join(process.cwd(), RAG_CONFIG.knowledgePath);
}

/** True once `npm run ingest` has produced the embeddings snapshot. */
export function knowledgeExists(): boolean {
  return existsSync(knowledgeFilePath());
}

function loadIndex(): KnowledgeIndex {
  if (indexCache) return indexCache;
  const path = knowledgeFilePath();
  if (!existsSync(path)) {
    throw new Error(
      "Knowledge index not found. Run `npm run ingest` to generate data/knowledge.json.",
    );
  }
  indexCache = JSON.parse(readFileSync(path, "utf8")) as KnowledgeIndex;
  return indexCache;
}

/** Dot product — valid as cosine because vectors are L2-normalised at embed time. */
function dot(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i]! * b[i]!;
  return sum;
}

export class MemoryVectorStore implements VectorStore {
  async query(embedding: number[], options: QueryOptions): Promise<RetrievedChunk[]> {
    const index = loadIndex();
    const filter = options.filter;

    const scored: RetrievedChunk[] = index.chunks
      .filter((chunk) => {
        if (filter?.category && chunk.meta.category !== filter.category) return false;
        if (filter?.project && chunk.meta.project !== filter.project) return false;
        return true;
      })
      .map((chunk) => ({ ...chunk, score: dot(embedding, chunk.embedding) }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, options.topK);
  }
}
