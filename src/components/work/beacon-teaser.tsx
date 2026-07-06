import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Tag } from "@/components/ui/tag";
import { BeaconMark } from "@/sections/beacon/beacon-mark";
import { BEACON } from "@/constants/beacon";

const TEASER_METRICS = [
  { value: "15.3K", label: "lines · vanilla JS" },
  { value: "60", label: "IPC channels" },
  { value: "12", label: "product modules" },
  { value: "278+", label: "internal builds" },
] as const;

const MINI_NAV = [
  { icon: "◈", label: "Dashboard", active: true },
  { icon: "☰", label: "Plan", active: false },
  { icon: "⑂", label: "GitHub", active: false },
  { icon: "◔", label: "Sprint", active: false },
  { icon: "◆", label: "Knowledge", active: false },
] as const;

/**
 * Featured entry for Beacon in Selected Work — deliberately not the generic
 * ProjectCard: the whole card is a link into the immersive case-study route,
 * with a miniature of the real app frame (Beacon's own dark tokens) as the
 * visual. One card, one destination, no competing actions.
 */
export function BeaconTeaser() {
  return (
    <Link
      href="/work/beacon"
      className="group lift block overflow-hidden rounded-2xl border border-brand/[0.25] bg-surface hover:border-brand/50"
      aria-label="Beacon — open the full engineering case study"
    >
      <div className="grid md:grid-cols-[1.15fr_1fr]">
        {/* Narrative */}
        <div className="flex flex-col p-[clamp(24px,3.5vw,40px)]">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs text-fg-ghost">02</span>
            <Tag tone="brand" size="sm" className="rounded-full">
              Featured Case Study
            </Tag>
            <Tag tone="neutral" size="sm" className="rounded-full">
              Personal · Desktop Platform
            </Tag>
          </div>
          <h3 className="mb-2.5 flex items-center gap-3 text-h3 font-bold tracking-[-0.02em]">
            <BeaconMark size={26} className="text-fg-strong" />
            Beacon — {BEACON.tagline}
          </h3>
          <p className="max-w-[640px] text-body leading-[1.65] text-fg-subtle">{BEACON.summary}</p>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {TEASER_METRICS.map((m) => (
              <div key={m.label}>
                <dd className="text-[22px] font-bold leading-none tracking-[-0.02em] text-white">
                  {m.value}
                </dd>
                <dt className="mt-1 font-mono text-[10.5px] text-fg-faint">{m.label}</dt>
              </div>
            ))}
          </dl>

          <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-soft">
            Explore the full case study — architecture explorer, interactive demo, honest ledger
            <ArrowRight
              size={15}
              aria-hidden
              className="transition-transform group-hover:translate-x-1"
            />
          </span>
        </div>

        {/* Miniature app frame — Beacon's real dark tokens */}
        <div
          aria-hidden
          className="relative hidden items-center border-l border-white/[0.06] bg-bg-deeper p-6 md:flex"
        >
          <div className="w-full overflow-hidden rounded-xl border border-white/[0.1] bg-[#101216] text-[#e8eaed] shadow-card">
            <div className="flex h-8 items-center gap-2 border-b border-[#23272f] px-3">
              <BeaconMark size={13} signal="#f2b45c" />
              <span className="text-[10px] font-semibold">beacon</span>
              <span className="ml-auto flex items-center gap-1 font-mono text-[8.5px] text-[#6b727c]">
                <i className="size-1 rounded-full bg-[#5bd6a0]" /> synced · ⌘K
              </span>
            </div>
            <div className="flex">
              <div className="flex w-[88px] flex-col gap-0.5 border-r border-[#23272f] bg-[#14171c] p-1.5">
                {MINI_NAV.map((item) => (
                  <span
                    key={item.label}
                    className={
                      item.active
                        ? "rounded bg-[rgba(242,180,92,.12)] px-1.5 py-1 text-[9px] font-semibold text-[#f2b45c]"
                        : "px-1.5 py-1 text-[9px] text-[#9aa1ab]"
                    }
                  >
                    {item.icon} {item.label}
                  </span>
                ))}
              </div>
              <div className="flex-1 space-y-1.5 p-2.5">
                <p className="text-[10px] font-bold">Good morning, Son</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    ["Focus", "78"],
                    ["Confidence", "82%"],
                    ["Finish", "17:40"],
                  ].map(([l, v]) => (
                    <div key={l} className="rounded border border-[#23272f] bg-[#14171c] p-1.5">
                      <p className="font-mono text-[7px] uppercase text-[#6b727c]">{l}</p>
                      <p className="text-[11px] font-bold">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded border border-[#23272f] bg-[#14171c] p-1.5">
                  <p className="font-mono text-[7px] uppercase text-[#f2b45c]">✦ Today&apos;s read</p>
                  <p className="mt-0.5 text-[8.5px] leading-[1.5] text-[#9aa1ab]">
                    Two reviews past SLA — clear those first. WAY-142 is the riskiest item; your
                    9–11 peak is reserved for it.
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <span className="rounded bg-[rgba(91,214,160,.13)] px-1.5 py-0.5 font-mono text-[7.5px] text-[#5bd6a0]">
                    ✦ ready
                  </span>
                  <span className="rounded bg-[rgba(242,180,92,.12)] px-1.5 py-0.5 font-mono text-[7.5px] text-[#f2b45c]">
                    reviewing
                  </span>
                  <span className="rounded bg-[rgba(120,183,240,.13)] px-1.5 py-0.5 font-mono text-[7.5px] text-[#78b7f0]">
                    posted
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
