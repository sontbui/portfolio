import type { ReactNode } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const sectionVariants = cva("relative scroll-mt-[var(--header-h)]", {
  variants: {
    /** Vertical rhythm. One place owns section padding for the whole site. */
    space: {
      sm: "py-[clamp(56px,7vw,88px)]",
      md: "py-[clamp(60px,8vw,100px)]",
      lg: "py-[clamp(72px,10vw,130px)]",
      xl: "py-[clamp(90px,12vw,150px)]",
    },
    /** Optional separators / fills for full-bleed bands. */
    tone: {
      none: "",
      band: "border-y border-white/[0.06] bg-bg-deep",
      "band-top": "border-t border-white/[0.06] bg-bg-deep",
      "divide-top": "border-t border-white/[0.06]",
    },
  },
  defaultVariants: { space: "lg", tone: "none" },
});

interface SectionProps extends VariantProps<typeof sectionVariants> {
  id: string;
  children: ReactNode;
  className?: string;
  /** Accessible label for the landmark region (screen readers). */
  ariaLabel?: string;
  /** id of a heading that labels this region (preferred over ariaLabel). */
  ariaLabelledby?: string;
}

/**
 * Semantic <section> landmark. Single source of truth for vertical rhythm
 * (via `space`) and full-bleed band treatments (via `tone`), and for the
 * scroll offset that keeps anchored navigation clear of the sticky header.
 */
export function Section({
  id,
  children,
  className,
  ariaLabel,
  ariaLabelledby,
  space,
  tone,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={cn(sectionVariants({ space, tone }), className)}
    >
      {children}
    </section>
  );
}
