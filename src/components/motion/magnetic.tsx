"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

import { SPRING } from "@/constants/motion";

/**
 * Wraps a single interactive control (a CTA) so it drifts subtly toward the
 * pointer and lifts on hover — the restrained "magnetic" gesture used by
 * Linear/Vercel. Purpose: signal that primary actions are alive and precise,
 * without a page full of moving buttons. Kept to the 2–3 primary CTAs only.
 *
 * The pull is capped (default 6px) so it never separates the label from its
 * hit-target. Renders inline. No transform under reduced motion.
 */

interface MagneticProps {
  children: ReactNode;
  /** Maximum pull toward the pointer, in px. */
  strength?: number;
  className?: string;
}

export function Magnetic({ children, strength = 6, className }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING.snappy);
  const springY = useSpring(y, SPRING.snappy);

  if (reduceMotion) {
    return <span className={className}>{children}</span>;
  }

  const handleMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    const clamp = (v: number, half: number) =>
      Math.max(-strength, Math.min(strength, (v / half) * strength));
    x.set(clamp(relX, rect.width / 2));
    y.set(clamp(relY, rect.height / 2));
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x: springX, y: springY, display: "inline-flex" }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={SPRING.snappy}
    >
      {children}
    </motion.span>
  );
}
