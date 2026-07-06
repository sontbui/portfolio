"use client";

import type { ElementType, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { DUR, EASE_ENTRANCE, viewportOnce } from "@/constants/motion";

/**
 * Headline that wipes up from behind a mask when scrolled into view — a clean,
 * typographic reveal distinct from the block fade used elsewhere. Purpose:
 * give the page's most important lines (hero, closing CTA) their own entrance
 * so hierarchy is felt, not just seen.
 *
 * The mask (overflow-hidden wrapper) has a small vertical bleed so descenders
 * and tight tracking are never clipped. No-ops to plain text under reduced
 * motion. Font styling is passed via `className` and lands on the moving line.
 */

interface TextRevealProps {
  children: ReactNode;
  className?: string;
  /** Wrapper element — use the semantic tag (h1/h2/p). Default span. */
  as?: ElementType;
  delay?: number;
}

export function TextReveal({ children, className, as: Tag = "span", delay = 0 }: TextRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag
      className="block overflow-hidden"
      style={{ paddingBottom: "0.1em", marginBottom: "-0.1em" }}
    >
      <motion.span
        className={className}
        style={{ display: "block" }}
        initial={{ y: "112%" }}
        whileInView={{ y: "0%" }}
        viewport={viewportOnce}
        transition={{ duration: DUR.slow, ease: EASE_ENTRANCE, delay }}
      >
        {children}
      </motion.span>
    </Tag>
  );
}
