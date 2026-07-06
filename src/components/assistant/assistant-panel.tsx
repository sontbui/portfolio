"use client";

import { useEffect, useRef } from "react";
import { ArrowUp, RotateCcw, Sparkles, Square, Trash2, X } from "lucide-react";

import { ChatMessage, TypingIndicator } from "@/components/assistant/message";
import { SuggestedQuestions } from "@/components/assistant/suggested-questions";
import { useAssistant } from "@/hooks/use-assistant";
import { cn } from "@/lib/utils";

/** The chat surface. Owns streaming, cancel, retry, clear, keyboard shortcuts,
 *  auto-scroll, and the empty/typing/error states. */
export function AssistantPanel({ onClose }: { onClose: () => void }) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    reload,
    error,
    sources,
    ask,
    clear,
  } = useAssistant();

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isEmpty = messages.length === 0;
  const lastRole = messages[messages.length - 1]?.role;
  const showTyping = isLoading && lastRole === "user";

  // Auto-scroll to the newest content.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, showTyping]);

  // Focus the input on open; Escape closes the panel.
  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) handleSubmit();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="AI Portfolio Assistant"
      className="flex h-full flex-col overflow-hidden border-white/10 bg-bg/95 backdrop-blur-xl sm:rounded-2xl sm:border sm:shadow-[var(--shadow-card)]"
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-7 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent-soft">
            <Sparkles size={15} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">Son-AI</p>
            <p className="text-[11px] leading-tight text-fg-faint">
              Engineering assistant · ask about Son or software engineering
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isEmpty ? (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear conversation"
              className="inline-flex size-8 items-center justify-center rounded-lg text-fg-subtle hover:bg-surface-raised hover:text-white"
            >
              <Trash2 size={16} aria-hidden />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close assistant"
            className="inline-flex size-8 items-center justify-center rounded-lg text-fg-subtle hover:bg-surface-raised hover:text-white"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {isEmpty ? (
          <div className="flex flex-col gap-4">
            <p className="text-body-sm text-fg-subtle">
              Hi — I&apos;m Son&apos;s AI portfolio assistant. I answer from his portfolio only.
              Try one of these:
            </p>
            <SuggestedQuestions onSelect={ask} />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
            {showTyping ? <TypingIndicator /> : null}

            {sources.length > 0 && !isLoading ? (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-fg-faint">Based on:</span>
                {sources.map((s) => (
                  <span
                    key={s.sourcePath}
                    className="rounded-full border border-white/[0.08] bg-surface px-2 py-0.5 text-[11px] text-fg-subtle"
                  >
                    {s.title}
                  </span>
                ))}
              </div>
            ) : null}

            {error ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-red-500/25 bg-red-500/[0.06] px-3 py-2 text-[13px] text-red-300">
                <span>{error.message || "Something went wrong. Please try again."}</span>
                <button
                  type="button"
                  onClick={() => reload()}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-white/5"
                >
                  <RotateCcw size={13} aria-hidden /> Retry
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-white/[0.07] p-3"
      >
        <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-surface px-3 py-2 focus-within:border-brand/50">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Ask about Son — or anything in AI, testing, architecture…"
            className="scrollbar-hidden max-h-28 flex-1 resize-none bg-transparent py-1 text-body-sm text-fg placeholder:text-fg-faint focus:outline-none"
            aria-label="Message"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              aria-label="Stop generating"
              className="inline-flex size-8 flex-none items-center justify-center rounded-lg bg-surface-raised text-fg-subtle hover:text-white"
            >
              <Square size={14} aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              className={cn(
                "inline-flex size-8 flex-none items-center justify-center rounded-lg transition-colors",
                input.trim() ? "bg-brand text-white hover:bg-brand-hover" : "bg-surface-raised text-fg-faint",
              )}
            >
              <ArrowUp size={16} aria-hidden />
            </button>
          )}
        </div>
        <p className="mt-1.5 px-1 text-[10.5px] text-fg-ghost">
          Answers come only from Son&apos;s portfolio. Enter to send · Shift+Enter for a new line.
        </p>
      </form>
    </div>
  );
}
