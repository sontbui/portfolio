"use client";

import { memo, useRef, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import "highlight.js/styles/github-dark.css";
import { cn } from "@/lib/utils";

/** Code block with a copy button; reads text from the rendered node so syntax
 *  highlighting (rehype-highlight) is preserved. */
function CodeBlock({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = ref.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <div className="group relative my-3">
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md border border-white/10 bg-surface-raised px-2 py-1 text-[11px] text-fg-subtle opacity-0 transition-opacity hover:text-white focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? <Check size={12} aria-hidden /> : <Copy size={12} aria-hidden />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre
        ref={ref}
        className="overflow-x-auto rounded-lg border border-white/[0.08] bg-bg-deeper p-4 text-[13px] leading-relaxed"
      >
        {children}
      </pre>
    </div>
  );
}

const components: Components = {
  p: ({ children }) => <p className="my-2 leading-relaxed first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-fg">{children}</strong>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-soft underline underline-offset-2 hover:text-brand"
    >
      {children}
    </a>
  ),
  h1: ({ children }) => <h4 className="mb-1 mt-3 text-base font-semibold">{children}</h4>,
  h2: ({ children }) => <h4 className="mb-1 mt-3 text-base font-semibold">{children}</h4>,
  h3: ({ children }) => <h5 className="mb-1 mt-3 text-sm font-semibold">{children}</h5>,
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  code: ({ className, children }) => {
    const isBlock = typeof className === "string" && className.includes("language-");
    if (isBlock) return <code className={className}>{children}</code>;
    return (
      <code className="rounded bg-surface-raised px-1.5 py-0.5 font-mono text-[0.85em] text-fg-strong">
        {children}
      </code>
    );
  },
};

/** Renders assistant markdown safely (no raw HTML) with GFM + syntax highlight. */
export const Markdown = memo(function Markdown({ content }: { content: string }) {
  return (
    <div className={cn("text-body-sm text-fg-muted")}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
});
