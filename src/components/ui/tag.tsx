import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const tagVariants = cva(
  "inline-flex items-center rounded-md border font-mono transition-colors",
  {
    variants: {
      tone: {
        neutral: "border-white/10 bg-surface-raised text-fg-strong",
        accent: "border-accent/30 bg-accent/[0.06] text-accent-soft",
        brand: "border-brand/30 bg-brand/[0.08] text-brand-soft",
        success: "border-success/25 bg-success/[0.06] text-success-soft",
        ghost: "border-white/[0.08] bg-surface text-fg-subtle",
      },
      size: {
        sm: "px-2 py-1 text-[11px]",
        md: "px-3 py-1.5 text-xs",
        lg: "px-4 py-2.5 text-[13px]",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
);

interface TagProps extends VariantProps<typeof tagVariants> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Monospace chip used for tech labels and small badges. A `<span>` by design
 * so it can nest freely inside lists and flex rows.
 */
export function Tag({ children, tone, size, className }: TagProps) {
  return <span className={cn(tagVariants({ tone, size }), className)}>{children}</span>;
}
