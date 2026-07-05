"use client";

import { useMemo } from "react";
import { useChat } from "@ai-sdk/react";

import type { Source } from "@/lib/rag/types";

/**
 * Thin wrapper over the AI SDK `useChat` that adds the extras the UI needs:
 * parsed source attributions (streamed via StreamData), a one-shot `ask`
 * helper for suggestion cards, and a `clear` that resets messages + data.
 */
export function useAssistant() {
  const chat = useChat({ api: "/api/chat" });

  const sources = useMemo<Source[]>(() => {
    const data = chat.data as Array<{ sources?: Source[] }> | undefined;
    if (!data?.length) return [];
    for (let i = data.length - 1; i >= 0; i--) {
      const entry = data[i];
      if (entry?.sources?.length) return entry.sources;
    }
    return [];
  }, [chat.data]);

  const ask = (question: string) => {
    void chat.append({ role: "user", content: question });
  };

  const clear = () => {
    chat.setMessages([]);
    chat.setData?.(undefined);
  };

  return { ...chat, sources, ask, clear };
}
