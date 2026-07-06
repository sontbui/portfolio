"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BeaconMark } from "@/sections/beacon/beacon-mark";
import { useActiveSection } from "@/hooks/use-active-section";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#architecture", label: "Architecture" },
  { href: "#demo", label: "Live Demo" },
  { href: "#journey", label: "Journey" },
  { href: "#metrics", label: "Metrics" },
  { href: "#highlights", label: "Highlights" },
  { href: "#reflection", label: "Reflection" },
  { href: "#download", label: "Download" },
  { href: "#story", label: "The Story" },
] as const;

const SECTION_IDS = LINKS.map((l) => l.href.slice(1));

/**
 * Case-study top bar: replaces the homepage navbar on this route with a back
 * link and in-page anchors that highlight the section currently in view. The
 * anchor row scrolls horizontally below `md` so nothing is unreachable.
 */
export function BeaconSubnav() {
  const activeId = useActiveSection(SECTION_IDS);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-bg/70 backdrop-blur-xl">
      <nav
        aria-label="Case study"
        className="mx-auto flex h-[var(--header-h)] max-w-[var(--container-max)] items-center gap-4 px-6 sm:px-8"
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-[7px] px-2 py-[7px] text-sm text-fg-subtle transition-colors hover:bg-surface-raised hover:text-white"
        >
          <ArrowLeft size={15} aria-hidden />
          <span className="hidden sm:inline">Portfolio</span>
        </Link>
        <span aria-hidden className="h-5 w-px bg-line" />
        <span className="flex shrink-0 items-center gap-2 text-[15px] font-semibold tracking-[-0.01em]">
          <BeaconMark size={20} className="text-fg-strong" />
          Beacon
        </span>
        <ul className="scrollbar-hidden ml-auto flex items-center gap-0.5 overflow-x-auto">
          {LINKS.map((link) => {
            const isActive = activeId === link.href.slice(1);
            return (
              <li key={link.href} className="shrink-0">
                <a
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "rounded-[7px] px-2.5 py-[7px] text-[13px] text-fg-subtle transition-colors hover:bg-surface-raised hover:text-white",
                    isActive && "bg-surface-raised text-white",
                  )}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
