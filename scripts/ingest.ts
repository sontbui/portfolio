/**
 * Ingestion pipeline — run with `npm run ingest`.
 *
 * Walks the content directory (recursively) → chunks → (re)embeds only changed
 * chunks → writes the knowledge snapshot. Incremental: unchanged content hashes reuse
 * their existing embedding, so adding one document re-embeds only that document.
 *
 * When VECTOR_STORE=upstash and Upstash env vars are set, it also upserts the
 * vectors to the hosted index.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import { chunkDocument } from "@/lib/rag/chunk";
import { RAG_CONFIG } from "@/lib/rag/config";
import { embedPassages } from "@/lib/rag/embed";
import type { Chunk, EmbeddedChunk, KnowledgeIndex } from "@/lib/rag/types";

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, "content");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith(".md")) out.push(full);
  }
  return out;
}

function loadExistingEmbeddings(): Map<string, number[]> {
  const path = join(ROOT, RAG_CONFIG.knowledgePath);
  const map = new Map<string, number[]>();
  if (!existsSync(path)) return map;
  try {
    const index = JSON.parse(readFileSync(path, "utf8")) as KnowledgeIndex;
    if (index.model === RAG_CONFIG.embedding.model) {
      for (const c of index.chunks) map.set(c.hash, c.embedding);
    }
  } catch {
    /* corrupt or old format — re-embed everything */
  }
  return map;
}

async function main(): Promise<void> {
  if (!existsSync(CONTENT_DIR)) throw new Error(`No content/ directory at ${CONTENT_DIR}`);

  const files = walk(CONTENT_DIR).sort();
  const chunks: Chunk[] = [];
  for (const file of files) {
    const sourcePath = relative(CONTENT_DIR, file).split("\\").join("/");
    chunks.push(...chunkDocument(readFileSync(file, "utf8"), sourcePath));
  }
  console.log(`Parsed ${files.length} files → ${chunks.length} chunks.`);

  const existing = loadExistingEmbeddings();
  const toEmbed = chunks.filter((c) => !existing.has(c.hash));
  console.log(`Embedding ${toEmbed.length} new/changed chunks (reusing ${chunks.length - toEmbed.length}).`);

  const freshVectors = toEmbed.length ? await embedPassages(toEmbed.map((c) => c.text)) : [];
  const freshByHash = new Map<string, number[]>();
  toEmbed.forEach((c, i) => freshByHash.set(c.hash, freshVectors[i]!));

  const embedded: EmbeddedChunk[] = chunks.map((c) => ({
    ...c,
    embedding: existing.get(c.hash) ?? freshByHash.get(c.hash)!,
  }));

  const index: KnowledgeIndex = {
    model: RAG_CONFIG.embedding.model,
    dimensions: RAG_CONFIG.embedding.dimensions,
    createdAt: new Date().toISOString(),
    chunks: embedded,
  };

  const outPath = join(ROOT, RAG_CONFIG.knowledgePath);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(index));
  writeFileSync(
    join(ROOT, RAG_CONFIG.manifestPath),
    JSON.stringify({ model: index.model, count: embedded.length, hashes: embedded.map((c) => c.hash) }, null, 2),
  );
  console.log(`Wrote ${embedded.length} chunks → ${RAG_CONFIG.knowledgePath}`);

  if (process.env.VECTOR_STORE === "upstash") {
    await upsertToUpstash(embedded);
  }
}

async function upsertToUpstash(chunks: EmbeddedChunk[]): Promise<void> {
  const { Index } = await import("@upstash/vector");
  const index = Index.fromEnv();
  await index.upsert(
    chunks.map((c) => ({
      id: c.id,
      vector: c.embedding,
      metadata: { ...c.meta, text: c.text, hash: c.hash, headingPath: c.headingPath },
    })),
  );
  console.log(`Upserted ${chunks.length} vectors to Upstash.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
