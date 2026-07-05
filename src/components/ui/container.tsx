import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Narrower reading-width container for prose blocks. */
  size?: "default" | "prose";
}

/**
 * Horizontal layout constraint. `default` caps at the design's 1200px content
 * width; `prose` caps at 720px for readable paragraphs. Padding is responsive.
 */
export function Container({ children, as: Tag = "div", className, size = "default" }: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-6 sm:px-8",
        size === "default" ? "max-w-[var(--container-max)]" : "max-w-[var(--prose-max)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
