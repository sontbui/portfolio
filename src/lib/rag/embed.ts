import { RAG_CONFIG } from "@/lib/rag/config";

/**
 * Local embedding client (Transformers.js). No API key, no network at request
 * time beyond the one-off model download. The same model must embed both
 * passages (ingest) and queries (runtime), so this is the single source.
 *
 * The pipeline is lazily created and cached across invocations (module-level
 * promise), so a warm serverless instance embeds a query in a few milliseconds.
 */

type FeatureExtractor = (
  text: string,
  opts: { pooling: "mean"; normalize: boolean },
) => Promise<{ data: Float32Array }>;

let extractorPromise: Promise<FeatureExtractor> | null = null;

async function getExtractor(): Promise<FeatureExtractor> {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const os = await import("node:os");
      const path = await import("node:path");
      const { pipeline, env } = await import("@xenova/transformers");
      // Pull weights from the HF hub (cached to disk); no local model files.
      env.allowLocalModels = false;
      // Serverless filesystems are read-only except tmp — cache the model there.
      env.cacheDir = path.join(os.tmpdir(), "xenova-cache");
      const extractor = await pipeline("feature-extraction", RAG_CONFIG.embedding.model, {
        quantized: true,
      });
      return extractor as unknown as FeatureExtractor;
    })();
  }
  return extractorPromise;
}

/** Embed passages (documents). Returns L2-normalised vectors. */
export async function embedPassages(texts: string[]): Promise<number[][]> {
  const extractor = await getExtractor();
  const vectors: number[][] = [];
  for (const text of texts) {
    const output = await extractor(text, { pooling: "mean", normalize: true });
    vectors.push(Array.from(output.data));
  }
  return vectors;
}

/** Embed a single user query, applying the BGE query instruction prefix. */
export async function embedQuery(question: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(RAG_CONFIG.embedding.queryPrefix + question, {
    pooling: "mean",
    normalize: true,
  });
  return Array.from(output.data);
}
