"use client";

import { useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

import { MOTION_TAGS, type MotionTagName } from "@/components/motion/motion-tags";
import { fadeInUp, viewportOnce } from "@/constants/motion";

interface RevealProps {
  children: ReactNode;
  /** Motion variants to apply. Defaults to a subtle fade-up. */
  variants?: Variants;
  /** Stagger delay in seconds (useful when not using a stagger container). */
  delay?: number;
  /** Element to render as. Constrained to the supported motion tags. */
  as?: MotionTagName;
  className?: string;
  /** When true, animates each time it enters view instead of only once. */
  repeat?: boolean;
  /**
   * Use when this Reveal is a direct child of a <Stagger>. It then omits its
   * own viewport trigger and lets the parent orchestrate timing, so the
   * stagger actually applies instead of every child self-triggering.
   */
  item?: boolean;
}

/**
 * Scroll-reveal primitive. Wraps children in a motion element that fades/slides
 * in when scrolled into view. When the user prefers reduced motion, it renders
 * content immediately with no transform — the single place motion is gated,
 * so section components never need to branch on the preference themselves.
 */
export function Reveal({
  children,
  variants = fadeInUp,
  delay = 0,
  as = "div",
  className,
  repeat = false,
  item = false,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    const StaticTag = as;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  const MotionTag = MOTION_TAGS[as];

  // Orchestrated by a parent <Stagger>: only declare variants + delay.
  if (item) {
    return (
      <MotionTag className={className} variants={variants} transition={{ delay }}>
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...viewportOnce, once: !repeat }}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}
