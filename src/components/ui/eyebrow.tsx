import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  /** Marker + label accent colour. */
  tone?: "accent" | "brand" | "muted";
  className?: string;
}

const TONE = {
  accent: { dot: "bg-accent", text: "text-accent-soft" },
  brand: { dot: "bg-brand", text: "text-brand-soft" },
  muted: { dot: "bg-fg-ghost", text: "text-fg-faint" },
} as const;

/**
 * Small monospace, letter-spaced kicker with a square marker — the design's
 * section label pattern (e.g. "Flagship Project · Proof of Concept").
 */
export function Eyebrow({ children, tone = "accent", className }: EyebrowProps) {
  const t = TONE[tone];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className={cn("size-1.5 rounded-[1px]", t.dot)} aria-hidden />
      <span
        className={cn(
          "font-mono text-xs font-medium uppercase tracking-[0.14em]",
          t.text,
        )}
      >
        {children}
      </span>
    </div>
  );
}
