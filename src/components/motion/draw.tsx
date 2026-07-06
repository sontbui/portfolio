"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { DUR, EASE_STANDARD } from "@/constants/motion";

/**
 * Line that draws itself along one axis when scrolled into view.
 *
 * Purpose: decorative rails and hairlines (the experience timeline, diagram
 * spines) draw in the direction information flows, so the structure reads as
 * *built*, not merely present. Renders as an aria-hidden <span>; the caller
 * supplies size/color via className exactly as before — only a transform is
 * added. No-ops to a static line under reduced motion.
 */

interface DrawProps {
  /** "y" draws top→bottom, "x" draws left→right. */
  axis?: "x" | "y";
  className?: string;
  style?: CSSProperties;
  /** Draw duration in seconds. */
  duration?: number;
  /** Delay before drawing, in seconds. */
  delay?: number;
}

export function Draw({ axis = "y", className, style, duration = DUR.xslow, delay = 0 }: DrawProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <span aria-hidden="true" className={className} style={style} />;
  }

  const scaleKey = axis === "y" ? "scaleY" : "scaleX";

  return (
    <motion.span
      aria-hidden="true"
      className={className}
      style={{ transformOrigin: axis === "y" ? "top" : "left", ...style }}
      initial={{ [scaleKey]: 0 }}
      whileInView={{ [scaleKey]: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, ease: EASE_STANDARD, delay }}
    />
  );
}
