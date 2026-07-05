"use client";

import type { Message as AiMessage } from "ai";

import { Markdown } from "@/components/assistant/markdown";
import { RichContent } from "@/components/assistant/rich/rich-content";
import { cn } from "@/lib/utils";

/** One chat turn. User turns are compact bubbles; assistant turns render
 *  markdown plus any generative-UI components from tool calls. */
export function ChatMessage({ message }: { message: AiMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand/15 px-3.5 py-2 text-body-sm text-fg">
          {message.content}
        </div>
      </div>
    );
  }

  const toolInvocations = message.toolInvocations ?? [];

  return (
    <div className="flex flex-col gap-3">
      {message.content ? <Markdown content={message.content} /> : null}
      {toolInvocations.map((inv) => (
        <RichContent
          key={inv.toolCallId}
          toolName={inv.toolName}
          args={(inv.args ?? {}) as Record<string, unknown>}
        />
      ))}
    </div>
  );
}

/** Animated three-dot typing indicator shown while awaiting the first token. */
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1" aria-label="Assistant is typing" role="status">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn("size-1.5 rounded-full bg-fg-faint", "animate-[pulseDot_1.2s_ease-in-out_infinite]")}
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </div>
  );
}
