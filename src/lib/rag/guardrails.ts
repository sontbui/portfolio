import { RAG_CONFIG } from "@/lib/rag/config";

export interface SanitizedInput {
  ok: boolean;
  value: string;
  error?: string;
}

// Built from ASCII-only escape strings so no raw control chars live in source.
// Matches control chars (except tab and newline) plus zero-width / bidi / BOM
// characters sometimes used to smuggle instructions.
const CONTROL_CHARS = new RegExp("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]", "g");
const INVISIBLE_CHARS = new RegExp("[\\u200B-\\u200F\\u2028\\u2029\\uFEFF]", "g");

/**
 * Input hygiene for user questions. The primary prompt-injection defense lives
 * in the system prompt (context is labelled untrusted, scope is enforced); this
 * is the transport-layer guard: strip control/invisible characters, collapse
 * whitespace, and enforce a hard length cap to bound token cost.
 */
export function sanitizeQuestion(raw: unknown): SanitizedInput {
  if (typeof raw !== "string") {
    return { ok: false, value: "", error: "Question must be text." };
  }
  const cleaned = raw
    .replace(CONTROL_CHARS, "")
    .replace(INVISIBLE_CHARS, "")
    .replace(/[ \t]+/g, " ")
    .trim();

  if (cleaned.length === 0) {
    return { ok: false, value: "", error: "Please enter a question." };
  }
  if (cleaned.length > RAG_CONFIG.limits.maxQuestionChars) {
    return {
      ok: false,
      value: "",
      error: `Question is too long (max ${RAG_CONFIG.limits.maxQuestionChars} characters).`,
    };
  }
  return { ok: true, value: cleaned };
}

/** Normalise a question for use as a cache key. */
export function normaliseForCache(question: string): string {
  return question.toLowerCase().replace(/\s+/g, " ").trim();
}
