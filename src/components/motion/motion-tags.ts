import { motion } from "framer-motion";

/**
 * Statically-resolved motion components.
 *
 * `motion(tag)` must never be called during render — it returns a new component
 * type each time, which forces React to remount the subtree. We resolve the
 * small set of elements the motion primitives actually need once, at module
 * scope, and index into this map by tag name.
 */
export const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  span: motion.span,
} as const;

/** The set of element names the Reveal/Stagger primitives can render as. */
export type MotionTagName = keyof typeof MOTION_TAGS;
