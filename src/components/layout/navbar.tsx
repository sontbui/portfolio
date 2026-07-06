"use client";

import { useEffect, useState } from "react";
import { LayoutGroup, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";

import { NAV_LINKS, SITE } from "@/constants/site";
import { useActiveSection } from "@/hooks/use-active-section";
import { SPRING } from "@/constants/motion";
import { cn } from "@/lib/utils";

const SECTION_IDS = NAV_LINKS.map((l) => l.href.slice(1));

/**
 * Sticky top navigation. Highlights the section currently in view and provides
 * an accessible mobile menu (disclosure pattern) below the `md` breakpoint.
 *
 * Motion: a scroll-progress hairline sits under the header (reading position,
 * Vercel-style), and the active-link indicator is a single shared-layout pill
 * that *slides* between links as you scroll — communicating "where you are"
 * as continuous position rather than a discrete colour swap.
 */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const activeId = useActiveSection(SECTION_IDS);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 30, mass: 0.4 });

  // Close the mobile menu on Escape (keyboard operability, WCAG 2.1.2).
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-bg/70 backdrop-blur-xl">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[var(--header-h)] max-w-[var(--container-max)] items-center justify-between gap-6 px-6 sm:px-8"
      >
        <a
          href="#home"
          className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em]"
        >
          <span
            aria-hidden
            className="inline-flex size-[26px] items-center justify-center rounded-[7px] border border-white/10 bg-surface-raised font-mono text-xs font-semibold"
          >
            S
          </span>
          <span>{SITE.name}</span>
        </a>

        {/* Desktop links */}
        <LayoutGroup>
          <ul className="hidden items-center gap-0.5 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive = activeId === link.href.slice(1);
              return (
                <li key={link.href} className="relative">
                  {isActive && !link.cta ? (
                    <motion.span
                      aria-hidden
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-[7px] bg-surface-raised"
                      transition={reduceMotion ? { duration: 0 } : SPRING.snappy}
                    />
                  ) : null}
                  <a
                    href={link.href}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "relative z-[1] block rounded-[7px] px-3 py-[7px] text-sm transition-colors",
                      link.cta
                        ? "ml-2 border border-white/10 bg-surface-raised font-medium text-white hover:border-white/25"
                        : cn(
                            "text-fg-subtle hover:text-white",
                            isActive && "text-white",
                          ),
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </LayoutGroup>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-fg-subtle hover:bg-surface-raised hover:text-white md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
        </button>
      </nav>

      {/* Scroll-progress hairline (reading position) */}
      <motion.div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-brand via-accent to-brand"
        style={{ scaleX: progress }}
      />

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-white/[0.07] bg-bg/95 backdrop-blur-xl md:hidden"
      >
        <ul className="flex flex-col gap-1 px-6 py-4">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-[15px] transition-colors",
                  link.cta
                    ? "border border-white/10 bg-surface-raised font-medium text-white"
                    : "text-fg-subtle hover:bg-surface-raised hover:text-white",
                )}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
