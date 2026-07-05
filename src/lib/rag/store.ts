import { MemoryVectorStore, knowledgeExists } from "@/lib/rag/stores/memory-store";
import { UpstashVectorStore } from "@/lib/rag/stores/upstash-store";
import type { VectorStore } from "@/lib/rag/types";

/**
 * Store factory. `VECTOR_STORE=upstash` selects the hosted adapter; anything
 * else (default) uses the in-memory snapshot. The rest of the system depends
 * only on the `VectorStore` interface, so this is the single swap point.
 */
let store: VectorStore | null = null;

export function getVectorStore(): VectorStore {
  if (store) return store;
  store =
    process.env.VECTOR_STORE === "upstash" ? new UpstashVectorStore() : new MemoryVectorStore();
  return store;
}

/** Whether the assistant has a usable knowledge index for the active backend. */
export function isKnowledgeReady(): boolean {
  if (process.env.VECTOR_STORE === "upstash") {
    return Boolean(process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN);
  }
  return knowledgeExists();
}
