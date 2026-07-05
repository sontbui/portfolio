/**
 * Heading row for a diagram block inside the AI Platform case study: an h3
 * title with optional monospace meta aligned to the right. Kept small and
 * local to the flagship section, which is the only place this pattern appears.
 */
export function DiagramHeading({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
      <h3 className="text-h4 font-semibold tracking-[-0.01em]">{title}</h3>
      {meta ? <span className="font-mono text-xs text-fg-ghost">{meta}</span> : null}
    </div>
  );
}
