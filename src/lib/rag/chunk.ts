import { createHash } from "node:crypto";

import matter from "gray-matter";

import { RAG_CONFIG } from "@/lib/rag/config";
import type { Chunk, DocMeta } from "@/lib/rag/types";

/** SHA-256 hex digest — used for chunk ids and incremental re-embedding. */
export function hashText(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (typeof value === "string") return [value];
  return [];
}

/** Normalise raw frontmatter into a typed DocMeta. */
function normaliseMeta(data: Record<string, unknown>, sourcePath: string): DocMeta {
  return {
    title: String(data.title ?? sourcePath),
    summary: String(data.summary ?? ""),
    keywords: toStringArray(data.keywords),
    tags: toStringArray(data.tags),
    category: String(data.category ?? "general"),
    project: data.project ? String(data.project) : undefined,
    lastUpdated: String(data.lastUpdated ?? ""),
    sourcePath,
  };
}

interface Section {
  headingPath: string[];
  lines: string[];
}

/**
 * Split markdown into sections at H2/H3 boundaries. Portfolio prose is short
 * and well-structured, so semantic sections make better chunks than fixed
 * windows — and they preserve a heading trail for attribution.
 */
function splitIntoSections(body: string): Section[] {
  const sections: Section[] = [];
  let current: Section = { headingPath: [], lines: [] };
  let h2: string | null = null;

  for (const line of body.split("\n")) {
    const h2Match = /^##\s+(.*)$/.exec(line);
    const h3Match = /^###\s+(.*)$/.exec(line);
    if (h2Match) {
      if (current.lines.join("").trim()) sections.push(current);
      h2 = h2Match[1]!.trim();
      current = { headingPath: [h2], lines: [] };
    } else if (h3Match) {
      if (current.lines.join("").trim()) sections.push(current);
      const h3 = h3Match[1]!.trim();
      current = { headingPath: h2 ? [h2, h3] : [h3], lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.join("").trim()) sections.push(current);
  return sections;
}

/** Pack sections into chunks that respect the soft character budget. */
function packSections(sections: Section[]): { headingPath: string[]; text: string }[] {
  const { maxChars, minChars } = RAG_CONFIG.chunking;
  const packed: { headingPath: string[]; text: string }[] = [];

  for (const section of sections) {
    const heading = section.headingPath.join(" › ");
    const body = section.lines.join("\n").trim();
    if (!body) continue;
    const full = heading ? `${heading}\n${body}` : body;

    if (full.length <= maxChars) {
      // Merge tiny sections into the previous chunk to avoid fragmentation.
      const prev = packed[packed.length - 1];
      if (prev && full.length < minChars && prev.text.length + full.length <= maxChars) {
        prev.text += `\n\n${full}`;
      } else {
        packed.push({ headingPath: section.headingPath, text: full });
      }
      continue;
    }

    // Oversized section → split on paragraph boundaries.
    let buffer = heading ? `${heading}\n` : "";
    for (const para of body.split(/\n{2,}/)) {
      if (buffer.length + para.length > maxChars && buffer.trim()) {
        packed.push({ headingPath: section.headingPath, text: buffer.trim() });
        buffer = heading ? `${heading}\n${para}` : para;
      } else {
        buffer += `\n\n${para}`;
      }
    }
    if (buffer.trim()) packed.push({ headingPath: section.headingPath, text: buffer.trim() });
  }
  return packed;
}

/**
 * Parse a markdown document (frontmatter + body) into embeddable chunks.
 */
export function chunkDocument(raw: string, sourcePath: string): Chunk[] {
  const { data, content } = matter(raw);
  const meta = normaliseMeta(data as Record<string, unknown>, sourcePath);
  const packed = packSections(splitIntoSections(content));

  return packed.map((p, i) => {
    // Prepend the doc title so a chunk carries top-level context even in isolation.
    const text = `${meta.title}\n${p.text}`.trim();
    return {
      id: `${sourcePath}#${i}`,
      text,
      hash: hashText(text),
      headingPath: p.headingPath,
      meta,
    } satisfies Chunk;
  });
}
