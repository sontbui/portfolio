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

/**
 * Floating trigger + container for the Portfolio Copilot.
 *
 * The idle trigger reads as a system status chip, not a support-chat bubble:
 * a live dot plus a mono status line — the assistant is one more running
 * service of the platform the visitor is already watching work.
 */
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
          aria-label="Open Son-AI — an AI engineering assistant that answers questions about Son's work and general software engineering"
          className="fixed bottom-6 right-6 z-[61] inline-flex items-center gap-2.5 rounded-full border border-accent/30 bg-surface-raised px-4 py-3 shadow-[var(--shadow-card)] transition-colors hover:border-accent/60"
        >
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-success" />
          </span>
          <span className="text-sm font-medium text-white">Son-AI</span>
          <span aria-hidden className="hidden font-mono text-[10.5px] text-fg-faint sm:inline">
            · online
          </span>
          <Sparkles size={14} className="text-accent-soft" aria-hidden />
        </button>
      )}
    </>
  );
}
