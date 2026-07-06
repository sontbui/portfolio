"use client";

interface Suggestion {
  emoji: string;
  label: string;
  /** The actual question sent to the assistant. */
  prompt: string;
}

const SUGGESTIONS: Suggestion[] = [
  { emoji: "👋", label: "Tell me about Son", prompt: "Tell me about Son — who he is and where he comes from." },
  { emoji: "🚀", label: "Explain the AI Automation Platform", prompt: "Explain the AI Automation Platform." },
  { emoji: "🔦", label: "What is Beacon?", prompt: "Tell me about Beacon and the engineering decisions behind it." },
  { emoji: "🏗", label: "Explain the Automation Framework", prompt: "Explain the Playwright automation framework." },
  { emoji: "⚙", label: "Engineering philosophy", prompt: "What engineering principles does Son follow?" },
  { emoji: "📈", label: "Biggest achievements", prompt: "What are Son's biggest engineering achievements?" },
  { emoji: "🧠", label: "Why Software Engineer in Test?", prompt: "Why did Son choose to be a Software Engineer in Test?" },
  { emoji: "🤖", label: "How is Son using AI?", prompt: "How is Son using AI in his engineering work?" },
  { emoji: "🖥", label: "Cross-platform testing", prompt: "Tell me about Son's cross-platform testing experience." },
  { emoji: "☁", label: "CI/CD & infrastructure", prompt: "Describe Son's CI/CD and automation infrastructure experience." },
  { emoji: "💡", label: "Problems Son enjoys solving", prompt: "What kinds of problems does Son enjoy solving?" },
  { emoji: "🧩", label: "Ask a technical question", prompt: "Compare Playwright and Selenium for a new E2E test suite — trade-offs?" },
];

/** Suggestion cards shown in the empty state (and re-usable elsewhere). */
export function SuggestedQuestions({
  onSelect,
  limit,
}: {
  onSelect: (prompt: string) => void;
  limit?: number;
}) {
  const items = limit ? SUGGESTIONS.slice(0, limit) : SUGGESTIONS;
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {items.map((s) => (
        <li key={s.label}>
          <button
            type="button"
            onClick={() => onSelect(s.prompt)}
            className="flex w-full items-center gap-2.5 rounded-xl border border-white/[0.08] bg-surface px-3.5 py-3 text-left text-[13px] text-fg-strong transition-colors hover:border-white/20 hover:bg-surface-raised focus-visible:border-brand/50"
          >
            <span aria-hidden className="text-base leading-none">
              {s.emoji}
            </span>
            <span>{s.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
