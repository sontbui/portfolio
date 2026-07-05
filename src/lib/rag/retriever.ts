import { RAG_CONFIG } from "@/lib/rag/config";
import { embedQuery } from "@/lib/rag/embed";
import { getVectorStore } from "@/lib/rag/store";
import type { DocMeta, RetrievedChunk, Source } from "@/lib/rag/types";

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  sources: Source[];
}

function dot(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i]! * b[i]!;
  return sum;
}

/**
 * Maximal Marginal Relevance: pick K results that are each relevant to the
 * query but not redundant with each other. Prevents "six chunks that all say
 * the same thing". Falls back to score order if vectors aren't available.
 */
function mmrRerank(candidates: RetrievedChunk[], k: number, lambda: number): RetrievedChunk[] {
  const pool = [...candidates];
  const selected: RetrievedChunk[] = [];

  while (selected.length < k && pool.length > 0) {
    let bestIdx = 0;
    let bestScore = -Infinity;
    for (let i = 0; i < pool.length; i++) {
      const candidate = pool[i]!;
      let maxSim = 0;
      if (candidate.embedding) {
        for (const chosen of selected) {
          if (chosen.embedding) maxSim = Math.max(maxSim, dot(candidate.embedding, chosen.embedding));
        }
      }
      const mmr = lambda * candidate.score - (1 - lambda) * maxSim;
      if (mmr > bestScore) {
        bestScore = mmr;
        bestIdx = i;
      }
    }
    selected.push(pool.splice(bestIdx, 1)[0]!);
  }
  return selected;
}

function uniqueSources(chunks: RetrievedChunk[]): Source[] {
  const seen = new Set<string>();
  const sources: Source[] = [];
  for (const c of chunks) {
    if (seen.has(c.meta.sourcePath)) continue;
    seen.add(c.meta.sourcePath);
    sources.push({ title: c.meta.title, category: c.meta.category, sourcePath: c.meta.sourcePath });
  }
  return sources;
}

/**
 * Full retrieval: embed → candidate search → similarity threshold →
 * de-duplicate → MMR re-rank to top-K → source attribution.
 * Returns an empty result when nothing clears the threshold — the caller uses
 * that to trigger a truthful "I don't have that information" response.
 */
export async function retrieve(
  question: string,
  filter?: Partial<Pick<DocMeta, "category" | "project">>,
): Promise<RetrievalResult> {
  const { topK, candidatePool, similarityThreshold, mmrLambda } = RAG_CONFIG.retrieval;

  const embedding = await embedQuery(question);
  const candidates = await getVectorStore().query(embedding, { topK: candidatePool, filter });

  const relevant = candidates.filter((c) => c.score >= similarityThreshold);

  const seen = new Set<string>();
  const deduped = relevant.filter((c) => (seen.has(c.hash) ? false : (seen.add(c.hash), true)));

  const ranked = mmrRerank(deduped, topK, mmrLambda);
  return { chunks: ranked, sources: uniqueSources(ranked) };
}
