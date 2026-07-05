import type { ReactNode } from "react";

import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow: string;
  title: ReactNode;
  /** Optional supporting paragraph under the title. */
  description?: ReactNode;
  tone?: "accent" | "brand" | "muted";
  className?: string;
  /** Heading level for correct document outline (defaults to h2). */
  as?: "h2" | "h3";
}

/**
 * Composes the eyebrow + heading (+ optional description) block that opens
 * most sections, wrapped in a scroll reveal. Enforces one consistent heading
 * rhythm so sections don't each re-implement it.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  tone = "brand",
  className,
  as: Heading = "h2",
}: SectionHeaderProps) {
  return (
    <Reveal className={cn("max-w-[620px]", className)}>
      <Eyebrow tone={tone} className="mb-4">
        {eyebrow}
      </Eyebrow>
      <Heading className="text-h2 font-bold tracking-[-0.025em] text-balance">{title}</Heading>
      {description ? (
        <p className="mt-4 max-w-[var(--prose-max)] text-lead leading-relaxed text-fg-subtle">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
