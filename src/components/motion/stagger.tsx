"use client";

import { useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { MOTION_TAGS, type MotionTagName } from "@/components/motion/motion-tags";
import { staggerContainer, viewportOnce } from "@/constants/motion";

interface StaggerProps {
  children: ReactNode;
  as?: MotionTagName;
  className?: string;
  /** Seconds between each child's animation start. */
  stagger?: number;
  delayChildren?: number;
}

/**
 * Container that orchestrates staggered reveals of its <Reveal> children.
 * Children must use variants with "hidden"/"visible" states (the default).
 * No-ops (renders plain element) under reduced-motion.
 */
export function Stagger({
  children,
  as = "div",
  className,
  stagger = 0.08,
  delayChildren = 0,
}: StaggerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    const StaticTag = as;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  const MotionTag = MOTION_TAGS[as];

  return (
    <MotionTag
      className={className}
      variants={staggerContainer(stagger, delayChildren)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      {children}
    </MotionTag>
  );
}
