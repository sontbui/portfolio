import type { ReactNode } from "react";

import { Tag } from "@/components/ui/tag";
import { DiagramLabel } from "@/components/diagrams/primitives";
import type { DetailBlock } from "@/constants/data";

interface ProjectCardProps {
  index: string;
  context: string;
  /** Optional secondary badge (e.g. "representative model"). */
  badge?: string;
  title: string;
  summary: string;
  /** Optional header-aligned action (e.g. a GitHub link). */
  action?: ReactNode;
  children: ReactNode;
}

/**
 * Case-study card shell used by every Selected Work entry: a bordered header
 * (index, context badges, title, summary, optional action) above a body slot.
 * Composition-first — the body content (details + diagram) is passed as
 * children so each project controls its own internal layout.
 */
export function ProjectCard({
  index,
  context,
  badge,
  title,
  summary,
  action,
  children,
}: ProjectCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-surface">
      <header className="flex flex-wrap items-start justify-between gap-3.5 border-b border-white/[0.06] p-[clamp(24px,3.5vw,40px)]">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="font-mono text-xs text-fg-ghost">{index}</span>
            <Tag tone="neutral" size="sm" className="rounded-full">
              {context}
            </Tag>
            {badge ? (
              <Tag tone="brand" size="sm" className="rounded-full">
                {badge}
              </Tag>
            ) : null}
          </div>
          <h3 className="mb-2.5 text-h3 font-bold tracking-[-0.02em]">{title}</h3>
          <p className="max-w-[720px] text-body leading-[1.65] text-fg-subtle">{summary}</p>
        </div>
        {action ? <div className="flex-none">{action}</div> : null}
      </header>
      {children}
    </article>
  );
}

/**
 * Vertical list of labelled prose blocks (Problem / Trade-off / Lesson …),
 * the recurring narrative column of a case study.
 */
export function ProjectDetails({ blocks }: { blocks: readonly DetailBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block) => (
        <div key={block.label}>
          <DiagramLabel className="mb-2.5">{block.label}</DiagramLabel>
          <p className="text-body-sm leading-[1.65] text-fg-muted">{block.body}</p>
        </div>
      ))}
    </div>
  );
}
