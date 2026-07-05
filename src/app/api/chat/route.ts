import { createOpenAI } from "@ai-sdk/openai";
import {
  convertToCoreMessages,
  createDataStreamResponse,
  streamText,
  tool,
  type JSONValue,
  type Message,
} from "ai";
import { z } from "zod";

import { RAG_CONFIG, OPENROUTER_BASE_URL } from "@/lib/rag/config";
import { sanitizeQuestion } from "@/lib/rag/guardrails";
import { buildSystemPrompt } from "@/lib/rag/prompt";
import { checkRateLimit } from "@/lib/rag/rate-limit";
import { retrieve } from "@/lib/rag/retriever";
import { DIAGRAM_IDS, METRIC_SETS, PROJECT_IDS } from "@/lib/rag/rich-content";
import { isKnowledgeReady } from "@/lib/rag/store";

// Transformers.js (local embeddings) needs the Node runtime, not Edge.
export const runtime = "nodejs";
export const maxDuration = 30;

const openrouter = createOpenAI({
  baseURL: OPENROUTER_BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://sontbui.github.io",
    "X-Title": "Son Bui - AI Portfolio Assistant",
  },
});

/**
 * Generative-UI tools. Each `execute` simply validates and echoes its args back
 * as the tool result; the client maps the tool name + args to a real portfolio
 * component. The model is expected to also produce a short natural-language
 * answer in the same turn.
 */
const tools = {
  showProject: tool({
    description:
      "Render a rich case-study card for one of Son's projects. Use when the user asks about a specific project.",
    parameters: z.object({ project: z.enum(PROJECT_IDS) }),
    execute: async (args) => args,
  }),
  showDiagram: tool({
    description:
      "Render an architecture or workflow diagram (orchestration = AI agent platform; sequence = ticket→PR; layered-architecture = Playwright framework; test-infrastructure = cross-platform system; three-tier = e-commerce).",
    parameters: z.object({ diagram: z.enum(DIAGRAM_IDS) }),
    execute: async (args) => args,
  }),
  showMetrics: tool({
    description:
      "Render key metrics. 'impact' = engineering impact at OPSWAT; 'poc' = AI platform proof-of-concept results.",
    parameters: z.object({ set: z.enum(METRIC_SETS) }),
    execute: async (args) => args,
  }),
  showExperienceTimeline: tool({
    description: "Render Son's work-experience timeline. Use for career/experience questions.",
    parameters: z.object({}),
    execute: async () => ({}),
  }),
  showSkills: tool({
    description: "Render Son's technical skills grouped by area. Use for skills questions.",
    parameters: z.object({}),
    execute: async () => ({}),
  }),
};

/** Return errors as plain text so the AI SDK surfaces the message to the client
 *  (it sets `error.message` to the response body on non-2xx). */
function chatError(message: string, status: number): Response {
  return new Response(message, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

export async function POST(req: Request): Promise<Response> {
  if (!process.env.OPENROUTER_API_KEY) {
    return chatError("The assistant isn't configured yet (missing OpenRouter API key).", 503);
  }
  if (!isKnowledgeReady()) {
    return chatError("The knowledge base hasn't been built yet. Run the ingestion step.", 503);
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous";
  if (!(await checkRateLimit(ip))) {
    return chatError("You're sending messages a little too quickly — please pause a moment.", 429);
  }

  let body: { messages?: Message[] };
  try {
    body = (await req.json()) as { messages?: Message[] };
  } catch {
    return chatError("Invalid request body.", 400);
  }

  const messages = body.messages ?? [];
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const sanitized = sanitizeQuestion(lastUser?.content);
  if (!sanitized.ok) return chatError(sanitized.error ?? "Invalid question.", 400);

  // Retrieve grounding context for the latest question.
  const { chunks, sources } = await retrieve(sanitized.value);

  // Keep only recent turns to bound token cost.
  const history = convertToCoreMessages(messages).slice(-RAG_CONFIG.limits.maxHistoryMessages);

  // `createDataStreamResponse` owns the stream lifecycle: it closes the data
  // stream automatically (even on error) and surfaces model errors via
  // `onError`, so a failed generation shows a real message instead of hanging.
  return createDataStreamResponse({
    execute: (dataStream) => {
      // Source attribution for the UI ("Based on: …").
      dataStream.writeData({ sources } as unknown as JSONValue);

      // Generative-UI tools require a tool-calling-capable model. Many free
      // OpenRouter models don't support tools and return a provider error, so
      // tools are opt-in via `ASSISTANT_TOOLS=on`. Text answers work either way.
      const toolsEnabled = process.env.ASSISTANT_TOOLS === "on";

      const result = streamText({
        model: openrouter(RAG_CONFIG.generation.model),
        system: buildSystemPrompt(chunks),
        messages: history,
        temperature: RAG_CONFIG.generation.temperature,
        maxTokens: RAG_CONFIG.generation.maxOutputTokens,
        ...(toolsEnabled ? { tools } : {}),
      });

      result.mergeIntoDataStream(dataStream);
    },
    onError: (error) =>
      error instanceof Error ? error.message : "The assistant failed to respond. Please try again.",
  });
}
