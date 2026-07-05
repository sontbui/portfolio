"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";

// Lazy-load the panel (and its heavy deps: markdown, syntax highlight, AI SDK,
// diagrams) only when the user opens the assistant — keeps first paint fast.
const AssistantPanel = dynamic(
  () => import("@/components/assistant/assistant-panel").then((m) => m.AssistantPanel),
  { ssr: false },
);

/** Floating trigger + container for the AI Portfolio Assistant. */
export function AssistantLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-[60] sm:inset-auto sm:bottom-4 sm:right-4 sm:h-[min(720px,calc(100dvh-2rem))] sm:w-[400px]">
          <AssistantPanel onClose={() => setOpen(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open AI portfolio assistant"
          className="fixed bottom-6 right-6 z-[61] inline-flex items-center gap-2 rounded-full border border-accent/30 bg-surface-raised px-4 py-3 text-sm font-medium text-white shadow-[var(--shadow-card)] transition-colors hover:border-accent/60"
        >
          <Sparkles size={16} className="text-accent-soft" aria-hidden />
          Ask about Son
        </button>
      )}
    </>
  );
}
