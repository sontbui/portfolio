import type { ReactNode } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/* ==========================================================================
   DIAGRAM PRIMITIVES
   Shared building blocks for the architecture / workflow diagrams. Keeping
   nodes, arrows, and labels as small composable pieces means every diagram
   reads consistently and no styling is duplicated across sections.
   ========================================================================== */

const nodeVariants = cva(
  "rounded-[10px] border text-center transition-colors",
  {
    variants: {
      tone: {
        neutral: "border-white/[0.09] bg-surface-raised text-fg-strong",
        brand: "border-brand/[0.28] bg-brand/[0.08] text-brand-soft",
        accent: "border-accent/40 bg-accent/10 text-white",
        success: "border-success/25 bg-surface-raised text-success-soft",
      },
      size: {
        sm: "px-3 py-2.5 text-[12.5px]",
        md: "p-3 text-[13px]",
        lg: "p-4 text-sm",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
);

interface DiagramNodeProps extends VariantProps<typeof nodeVariants> {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  /** Render title in mono (used for artifact/tech labels). */
  mono?: boolean;
}

/** A labelled box: bold title with an optional muted subtitle underneath. */
export function DiagramNode({ title, subtitle, tone, size, mono, className }: DiagramNodeProps) {
  return (
    <div className={cn(nodeVariants({ tone, size }), className)}>
      <div className={cn("font-semibold leading-tight", mono && "font-mono font-medium")}>
        {title}
      </div>
      {subtitle ? <div className="mt-0.5 text-[11.5px] text-fg-faint">{subtitle}</div> : null}
    </div>
  );
}

/** Uppercase monospace caption used to label diagram stages. */
export function DiagramLabel({
  children,
  className,
  align = "left",
}: {
  children: ReactNode;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] uppercase tracking-[0.14em] text-fg-ghost",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Directional connector between diagram nodes. Hidden from assistive tech. */
export function FlowArrow({
  direction = "down",
  className,
}: {
  direction?: "down" | "right";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex items-center justify-center text-line-strong",
        direction === "down" ? "text-xl leading-none" : "text-lg",
        className,
      )}
    >
      {direction === "down" ? "↓" : "→"}
    </span>
  );
}

/** Wrapper that frames a diagram as an accessible figure with a caption. */
export function DiagramFrame({
  children,
  label,
  className,
}: {
  children: ReactNode;
  /** Accessible description of what the diagram shows. */
  label: string;
  className?: string;
}) {
  return (
    <figure role="group" aria-label={label} className={cn("rounded-2xl", className)}>
      {children}
    </figure>
  );
}
