import type { AnchorHTMLAttributes, ReactNode } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
  {
    variants: {
      variant: {
        primary: "bg-brand text-white hover:bg-brand-hover",
        secondary:
          "border border-white/10 bg-surface-raised text-white hover:border-white/25 hover:bg-surface-hover",
        ghost: "text-fg-subtle hover:bg-surface-raised hover:text-white",
      },
      size: {
        md: "px-5 py-3 text-body-sm",
        sm: "px-4 py-2 text-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

interface ButtonLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
}

/**
 * Anchor styled as a button. Automatically applies safe rel attributes when
 * opening in a new tab. Kept as an <a> (not a <button>) since every CTA in the
 * design navigates rather than triggers an action.
 */
export function ButtonLink({
  children,
  variant,
  size,
  className,
  target,
  rel,
  ...props
}: ButtonLinkProps) {
  const safeRel = target === "_blank" ? cn("noopener noreferrer", rel) : rel;
  return (
    <a
      className={cn(buttonVariants({ variant, size }), className)}
      target={target}
      rel={safeRel}
      {...props}
    >
      {children}
    </a>
  );
}
