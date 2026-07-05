import type { Transition, Variants } from "framer-motion";

/**
 * Shared Framer Motion presets. Subtle by design — fades and short slides only.
 * All transitions honour `prefers-reduced-motion` because motion is applied
 * through the <Reveal> primitive, which disables offsets when reduced motion
 * is requested.
 */

export const EASE_OUT_SOFT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const baseTransition: Transition = {
  duration: 0.6,
  ease: EASE_OUT_SOFT,
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: baseTransition },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: baseTransition },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: baseTransition },
};

/** Parent container that staggers its children on reveal. */
export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Viewport config so sections animate once when ~15% enters the viewport. */
export const viewportOnce = { once: true, amount: 0.15 } as const;
