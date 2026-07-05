import type { ElementType, ReactNode } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-2xl border transition-colors", {
  variants: {
    surface: {
      base: "border-white/[0.08] bg-surface",
      raised: "border-white/10 bg-surface-raised",
      deep: "border-white/[0.08] bg-bg-deeper",
      accent: "border-accent/40 bg-accent/[0.06]",
    },
    interactive: {
      true: "hover:border-white/20",
      false: "",
    },
    padding: {
      none: "p-0",
      sm: "p-5",
      md: "p-6 sm:p-7",
      lg: "p-7 sm:p-8",
    },
  },
  defaultVariants: { surface: "base", interactive: false, padding: "md" },
});

interface CardProps extends VariantProps<typeof cardVariants> {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

/**
 * Surface container matching the design's card language (soft borders, dark
 * fills, generous radius). Composition-first: content is passed as children.
 */
export function Card({
  children,
  as: Tag = "div",
  surface,
  interactive,
  padding,
  className,
}: CardProps) {
  return (
    <Tag className={cn(cardVariants({ surface, interactive, padding }), className)}>{children}</Tag>
  );
}
