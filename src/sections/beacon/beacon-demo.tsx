"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/motion/reveal";
import { BeaconMark } from "@/sections/beacon/beacon-mark";
import { DEMO_SCENES } from "@/constants/beacon";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
   Beacon's real design tokens (src/renderer/styles/tokens.css), scoped to the
   demo frame as CSS variables — the same technique Beacon's own Daily Brief
   uses to keep its palette from leaking. The frame is a faithful lightweight
   recreation of the app (layout, type scale, copy), not an embed.
   -------------------------------------------------------------------------- */

const THEMES = {
  dark: {
    "--b-bg": "#101216",
    "--b-surface": "#14171c",
    "--b-surface2": "#181b21",
    "--b-raised": "#1b1f26",
    "--b-border": "#23272f",
    "--b-border2": "#2c313b",
    "--b-t1": "#e8eaed",
    "--b-t2": "#9aa1ab",
    "--b-t3": "#6b727c",
    "--b-amber": "#f2b45c",
    "--b-amber-bg": "rgba(242,180,92,.12)",
    "--b-amber-bd": "rgba(242,180,92,.28)",
    "--b-green": "#5bd6a0",
    "--b-green-bg": "rgba(91,214,160,.13)",
    "--b-red": "#f2708a",
    "--b-red-bg": "rgba(242,112,138,.13)",
    "--b-blue": "#78b7f0",
    "--b-blue-bg": "rgba(120,183,240,.13)",
  },
  light: {
    "--b-bg": "#f6f4ef",
    "--b-surface": "#ffffff",
    "--b-surface2": "#faf8f4",
    "--b-raised": "#f2efe9",
    "--b-border": "#e7e2d9",
    "--b-border2": "#d9d3c8",
    "--b-t1": "#231f18",
    "--b-t2": "#6c675e",
    "--b-t3": "#9a948a",
    "--b-amber": "#b47617",
    "--b-amber-bg": "rgba(224,154,16,.12)",
    "--b-amber-bd": "rgba(224,154,16,.32)",
    "--b-green": "#1a9e5c",
    "--b-green-bg": "rgba(26,158,92,.10)",
    "--b-red": "#d13438",
    "--b-red-bg": "rgba(209,52,56,.10)",
    "--b-blue": "#2f6fd0",
    "--b-blue-bg": "rgba(47,111,208,.10)",
  },
} as const;

export function BeaconDemo() {
  const [sceneId, setSceneId] = useState(DEMO_SCENES[0]!.id);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [hotspot, setHotspot] = useState(0);

  const scene = DEMO_SCENES.find((s) => s.id === sceneId) ?? DEMO_SCENES[0]!;
  const themeVars = THEMES[theme] as unknown as CSSProperties;

  const selectScene = (id: string) => {
    setSceneId(id);
    setHotspot(0);
  };

  return (
    <Section id="demo" ariaLabel="Interactive demo" tone="band">
      <Container>
        <SectionHeader
          eyebrow="Live Demo"
          title="Walk through the product"
          description="A lightweight recreation built from Beacon's actual design tokens and layouts — every color, module, and interaction pattern below is taken from the real app. Switch modules in the sidebar, toggle the theme, and tap the ✦ markers."
          className="mb-10"
        />

        <Reveal>
          {/* App window */}
          <div
            style={themeVars}
            className="overflow-hidden rounded-2xl border border-white/[0.1] shadow-card"
          >
            {/* Window chrome (portfolio-side) */}
            <div className="flex items-center gap-2 border-b border-white/[0.08] bg-surface-raised px-4 py-2.5">
              <span aria-hidden className="flex gap-1.5">
                <i className="size-[11px] rounded-full bg-[#f2708a]" />
                <i className="size-[11px] rounded-full bg-[#f2b45c]" />
                <i className="size-[11px] rounded-full bg-[#5bd6a0]" />
              </span>
              <span className="ml-2 font-mono text-[11px] text-fg-faint">Beacon — v278</span>
              <button
                type="button"
                onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                className="ml-auto rounded-md border border-white/10 px-2.5 py-1 font-mono text-[11px] text-fg-subtle transition-colors hover:border-white/25 hover:text-white"
              >
                {theme === "dark" ? "☀ Light" : "☾ Dark"}
              </button>
            </div>

            {/* App body — Beacon tokens from here down */}
            <div className="bg-[var(--b-bg)] text-[var(--b-t1)]">
              {/* Topbar */}
              <div className="flex h-10 items-center gap-3 border-b border-[var(--b-border)] px-4 text-[12px]">
                <span className="font-semibold">{scene.crumb.split(" › ")[0]}</span>
                {scene.crumb.includes(" › ") ? (
                  <span className="text-[var(--b-t3)]">› {scene.crumb.split(" › ")[1]}</span>
                ) : null}
                <span className="ml-auto flex items-center gap-1.5 text-[var(--b-t3)]">
                  <i className="size-1.5 animate-pulse-dot rounded-full bg-[var(--b-green)]" />
                  <span className="font-mono text-[10px]">synced</span>
                </span>
                <span className="rounded border border-[var(--b-border2)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--b-t3)]">
                  ⌘K
                </span>
              </div>

              <div className="flex min-h-[430px]">
                {/* Sidebar */}
                <nav
                  aria-label="Beacon modules"
                  className="flex w-12 flex-col gap-0.5 border-r border-[var(--b-border)] bg-[var(--b-surface)] p-1.5 sm:w-44 sm:p-2"
                >
                  <span className="mb-1.5 hidden items-center gap-1.5 px-2 pt-1 sm:flex">
                    <BeaconMark size={15} signal="var(--b-amber)" className="text-[var(--b-t1)]" />
                    <span className="text-[11.5px] font-semibold tracking-wide">beacon</span>
                  </span>
                  {DEMO_SCENES.map((s) => {
                    const isActive = s.id === scene.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => selectScene(s.id)}
                        aria-pressed={isActive}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-2 py-[7px] text-left text-[12.5px] transition-colors",
                          isActive
                            ? "bg-[var(--b-amber-bg)] font-semibold text-[var(--b-amber)]"
                            : "text-[var(--b-t2)] hover:bg-[var(--b-surface2)] hover:text-[var(--b-t1)]",
                        )}
                      >
                        <span aria-hidden className="w-4 text-center">
                          {s.icon}
                        </span>
                        <span className="hidden sm:inline">{s.nav}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Workspace */}
                <div className="min-w-0 flex-1 overflow-hidden p-4 sm:p-5">
                  {scene.id === "brief" ? <BriefScene onHotspot={setHotspot} /> : null}
                  {scene.id === "github" ? <GithubScene onHotspot={setHotspot} /> : null}
                  {scene.id === "plan" ? <PlanScene onHotspot={setHotspot} /> : null}
                  {scene.id === "calendar" ? <CalendarScene onHotspot={setHotspot} /> : null}
                  {scene.id === "reminders" ? <RemindersScene onHotspot={setHotspot} /> : null}
                  {scene.id === "sprint" ? <SprintScene onHotspot={setHotspot} /> : null}
                  {scene.id === "notes" ? <NotesScene onHotspot={setHotspot} /> : null}
                  {scene.id === "knowledge" ? <KnowledgeScene onHotspot={setHotspot} /> : null}
                </div>
              </div>

              {/* Status strip */}
              <div className="flex h-7 items-center gap-3 border-t border-[var(--b-border)] px-4 font-mono text-[10px] text-[var(--b-t3)]">
                <span className="hidden sm:inline">⏎ open · ⌘K palette · F focus</span>
                <span className="ml-auto">✔ Wrap up</span>
                <span>poll 60s</span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Narration */}
        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_340px]">
          <p className="text-[14px] leading-[1.7] text-fg-muted">{scene.caption}</p>
          <div aria-live="polite" className="flex flex-col gap-2.5">
            {scene.hotspots.map((h, i) => (
              <button
                key={h.title}
                type="button"
                onClick={() => setHotspot(i)}
                aria-pressed={hotspot === i}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  hotspot === i
                    ? "border-brand/50 bg-brand/[0.08]"
                    : "border-white/[0.08] bg-surface hover:border-white/20",
                )}
              >
                <span className="flex items-center gap-2 text-[13px] font-semibold text-white">
                  <HotspotDot n={i + 1} active={hotspot === i} />
                  {h.title}
                </span>
                <span className="mt-1.5 block text-[12.5px] leading-[1.6] text-fg-subtle">
                  {h.body}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------ shared bits ------------------------------- */

function HotspotDot({ n, active }: { n: number; active?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-[18px] flex-none items-center justify-center rounded-full font-mono text-[10px] font-bold",
        active ? "bg-brand text-white" : "bg-surface-active text-fg-subtle",
      )}
    >
      {n}
    </span>
  );
}

/** In-frame ✦ marker — selects the matching narration card. */
function Marker({ n, onHotspot }: { n: number; onHotspot: (i: number) => void }) {
  return (
    <button
      type="button"
      onClick={() => onHotspot(n - 1)}
      aria-label={`Show explanation ${n}`}
      className="inline-flex size-[18px] flex-none items-center justify-center rounded-full border border-[var(--b-amber-bd)] bg-[var(--b-amber-bg)] font-mono text-[10px] font-bold text-[var(--b-amber)] transition-transform hover:scale-110"
    >
      {n}
    </button>
  );
}

function BCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[10px] border border-[var(--b-border)] bg-[var(--b-surface)] p-3.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function BChip({
  children,
  tone = "amber",
}: {
  children: ReactNode;
  tone?: "amber" | "green" | "red" | "blue" | "muted";
}) {
  const tones = {
    amber: "bg-[var(--b-amber-bg)] text-[var(--b-amber)]",
    green: "bg-[var(--b-green-bg)] text-[var(--b-green)]",
    red: "bg-[var(--b-red-bg)] text-[var(--b-red)]",
    blue: "bg-[var(--b-blue-bg)] text-[var(--b-blue)]",
    muted: "bg-[var(--b-surface2)] text-[var(--b-t2)]",
  } as const;
  return (
    <span className={cn("rounded px-1.5 py-0.5 font-mono text-[10px] font-medium", tones[tone])}>
      {children}
    </span>
  );
}

/* -------------------------------- scenes ---------------------------------- */

function BriefScene({ onHotspot }: { onHotspot: (i: number) => void }) {
  return (
    <div className="flex flex-col gap-3.5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--b-t3)]">
          AI Daily Brief · Monday
        </p>
        <h4 className="mt-1 text-[19px] font-bold tracking-[-0.01em]">Good morning, Son</h4>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {[
          ["Focus score", "78", "green"],
          ["Plan confidence", "82%", "amber"],
          ["Est. finish", "17:40", "blue"],
        ].map(([label, value, tone], i) => (
          <BCard key={label} className="relative">
            <p className="font-mono text-[9.5px] uppercase tracking-wider text-[var(--b-t3)]">
              {label}
            </p>
            <p className="mt-1 text-[20px] font-bold leading-none">{value}</p>
            {i === 0 ? (
              <span className="absolute right-2 top-2">
                <Marker n={1} onHotspot={onHotspot} />
              </span>
            ) : null}
            <span className="sr-only">{tone}</span>
          </BCard>
        ))}
      </div>
      <BCard className="relative">
        <p className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wider text-[var(--b-amber)]">
          ✦ Today&apos;s read
          <span className="absolute right-2 top-2">
            <Marker n={2} onHotspot={onHotspot} />
          </span>
        </p>
        <p className="mt-1.5 text-[12.5px] leading-[1.65] text-[var(--b-t2)]">
          Three reviews are waiting and two are past your 4h SLA — clear those first. Your sprint
          coverage is at 86% with WAY-142 the riskiest item; the plan reserves your 9–11 peak for
          it. One meeting at 14:00 — the schedule routes around it.
        </p>
      </BCard>
      <BCard>
        <p className="font-mono text-[9.5px] uppercase tracking-wider text-[var(--b-t3)]">
          Today&apos;s execution schedule
        </p>
        <div className="mt-2 flex flex-col gap-1.5 text-[12px]">
          {[
            ["09:00", "WAY-142 · schedule drift diff", "amber"],
            ["11:15", "Review queue · 3 PRs batched", "blue"],
            ["14:00", "Sprint planning (meeting)", "muted"],
          ].map(([time, label, tone]) => (
            <div key={time} className="flex items-center gap-2.5">
              <span className="w-10 font-mono text-[10.5px] text-[var(--b-t3)]">{time}</span>
              <span className="min-w-0 flex-1 truncate text-[var(--b-t1)]">{label}</span>
              <BChip tone={tone as "amber"}>{tone === "muted" ? "terrain" : "planned"}</BChip>
            </div>
          ))}
        </div>
      </BCard>
    </div>
  );
}

function GithubScene({ onHotspot }: { onHotspot: (i: number) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {["beacon", "console-ui", "gateway-api"].map((repo, i) => (
          <span
            key={repo}
            className={cn(
              "rounded-full border px-2.5 py-1 font-mono text-[10.5px]",
              i === 0
                ? "border-[var(--b-amber-bd)] bg-[var(--b-amber-bg)] text-[var(--b-amber)]"
                : "border-[var(--b-border2)] text-[var(--b-t2)]",
            )}
          >
            {repo}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-4 border-b border-[var(--b-border)] pb-2 text-[12px]">
        <span className="border-b-2 border-[var(--b-amber)] pb-1.5 font-semibold">
          Requested <BChip>3</BChip>
        </span>
        <span className="text-[var(--b-t3)]">Assigned</span>
        <span className="text-[var(--b-t3)]">All</span>
        <span className="ml-auto">
          <Marker n={1} onHotspot={onHotspot} />
        </span>
      </div>
      {[
        ["#412", "fix: planner belief reset loses velocity sample", "✦ ready", "green", "2h"],
        ["#409", "feat: knowledge hub agent packaging v2", "reviewing", "amber", "5h ⏳"],
        ["#405", "refactor: differential sync for user_data", "posted", "blue", "1d"],
      ].map(([num, title, status, tone, age], i) => (
        <BCard key={num} className="relative flex items-center gap-3">
          <span className="font-mono text-[11px] text-[var(--b-t3)]">{num}</span>
          <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium">{title}</span>
          <BChip tone={tone as "green"}>{status}</BChip>
          <span className="hidden font-mono text-[10px] text-[var(--b-t3)] sm:inline">{age}</span>
          {i === 1 ? <Marker n={2} onHotspot={onHotspot} /> : null}
        </BCard>
      ))}
      <p className="font-mono text-[10px] text-[var(--b-t3)]">
        ✦ auto-review queue: 1 running · findings saved to ai_reviews · re-review on new commits
      </p>
    </div>
  );
}

function PlanScene({ onHotspot }: { onHotspot: (i: number) => void }) {
  const blocks = [
    { time: "09:00", h: 52, label: "WAY-142 · drift diff", state: "accepted" },
    { time: "11:15", h: 34, label: "Review batch · 3 PRs", state: "reserved" },
    { time: "12:00", h: 30, label: "Lunch", state: "terrain" },
    { time: "13:15", h: 30, label: "WAY-150 · QA pass (50%)", state: "reserved" },
    { time: "14:00", h: 34, label: "Sprint planning", state: "locked" },
    { time: "15:30", h: 44, label: "WAY-138 · onboarding fix", state: "placed" },
  ] as const;
  const styles = {
    accepted: "border-[var(--b-amber-bd)] bg-[var(--b-amber-bg)] text-[var(--b-t1)]",
    reserved: "border-dashed border-[var(--b-border2)] bg-[var(--b-surface2)] text-[var(--b-t2)]",
    terrain: "border-[var(--b-border)] bg-[var(--b-raised)] text-[var(--b-t3)]",
    locked: "border-[var(--b-blue)] bg-[var(--b-blue-bg)] text-[var(--b-t1)]",
    placed: "border-[var(--b-green-bd,var(--b-border2))] bg-[var(--b-green-bg)] text-[var(--b-t1)]",
  } as const;
  const badge = { accepted: "A", reserved: "◌", terrain: "▦", locked: "🔒", placed: "⌖" } as const;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold">
          Today · <span className="text-[var(--b-t2)]">6 blocks · buffer 30m</span>
        </p>
        <span className="flex items-center gap-2">
          <BChip>P(done) 86%</BChip>
          <Marker n={2} onHotspot={onHotspot} />
        </span>
      </div>
      <div className="relative flex flex-col gap-1.5">
        {/* now-line */}
        <div
          aria-hidden
          className="absolute left-0 right-0 top-[88px] z-10 border-t border-[var(--b-amber)] opacity-70"
        >
          <span className="absolute -top-2 right-0 rounded bg-[var(--b-amber)] px-1 font-mono text-[9px] font-bold text-[#231704]">
            10:42
          </span>
        </div>
        {blocks.map((b, i) => (
          <div key={b.time} className="flex items-stretch gap-2.5">
            <span className="w-10 pt-1 font-mono text-[10px] text-[var(--b-t3)]">{b.time}</span>
            <div
              style={{ minHeight: b.h }}
              className={cn(
                "relative flex min-w-0 flex-1 items-center gap-2 rounded-md border px-3 text-[12px]",
                styles[b.state],
              )}
            >
              <span aria-hidden className="font-mono text-[10px] opacity-70">
                {badge[b.state]}
              </span>
              <span className="truncate">{b.label}</span>
              {i === 1 ? (
                <span className="ml-auto">
                  <Marker n={1} onHotspot={onHotspot} />
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <p className="font-mono text-[10px] text-[var(--b-t3)]">
        ◌ reserved — engine may move · A accepted · ⌖ placed by you · 🔒 locked
      </p>
    </div>
  );
}

function CalendarScene({ onHotspot }: { onHotspot: (i: number) => void }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
  type Block = { label: string; kind: "event" | "engine" | "focus" };
  const cols: Record<(typeof days)[number], Block[]> = {
    Mon: [
      { label: "WAY-142 · drift diff", kind: "engine" },
      { label: "Sprint planning", kind: "event" },
    ],
    Tue: [
      { label: "Review batch", kind: "engine" },
      { label: "1:1 · lead", kind: "event" },
    ],
    Wed: [{ label: "Focus · deep work", kind: "focus" }],
    Thu: [
      { label: "Demo prep", kind: "engine" },
      { label: "Team demo", kind: "event" },
    ],
    Fri: [{ label: "Margin day · 50%", kind: "engine" }],
  };
  const kindCls = {
    event: "border-[var(--b-blue)] bg-[var(--b-blue-bg)] text-[var(--b-t1)]",
    engine:
      "border-dashed border-[var(--b-amber-bd)] bg-[var(--b-amber-bg)] text-[var(--b-t1)]",
    focus: "border-dashed border-[var(--b-border2)] bg-[var(--b-surface2)] text-[var(--b-t2)]",
  } as const;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold">
          Week 28 · <span className="text-[var(--b-t2)]">grid 08→20, auto-expands</span>
        </p>
        <span className="flex items-center gap-2">
          <BChip tone="muted">day</BChip>
          <BChip>week</BChip>
          <BChip tone="muted">month</BChip>
        </span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {days.map((day, di) => (
          <div key={day} className="min-w-0">
            <p className="mb-1 text-center font-mono text-[9.5px] uppercase text-[var(--b-t3)]">
              {day}
            </p>
            <div className="relative flex min-h-[190px] flex-col gap-1.5 rounded-md border border-[var(--b-border)] bg-[var(--b-surface)] p-1.5">
              {cols[day].map((b) => (
                <div
                  key={b.label}
                  className={cn(
                    "rounded border px-1.5 py-1.5 text-[9.5px] leading-tight",
                    kindCls[b.kind],
                  )}
                >
                  {b.label}
                </div>
              ))}
              {/* reminder pip */}
              {di === 1 ? (
                <span
                  className="absolute bottom-6 left-1.5 flex items-center gap-1"
                  title="Reminder · 16:00"
                >
                  <i className="size-1.5 rounded-full bg-[var(--b-amber)]" />
                  <span className="font-mono text-[8px] text-[var(--b-t3)]">16:00</span>
                </span>
              ) : null}
              {di === 0 ? (
                <span className="absolute right-1 top-1">
                  <Marker n={1} onHotspot={onHotspot} />
                </span>
              ) : null}
              {di === 1 ? (
                <span className="absolute bottom-1 right-1">
                  <Marker n={2} onHotspot={onHotspot} />
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <p className="font-mono text-[10px] text-[var(--b-t3)]">
        solid = event (terrain) · dashed amber = published plan block · pip = reminder
      </p>
    </div>
  );
}

function RemindersScene({ onHotspot }: { onHotspot: (i: number) => void }) {
  const rows = [
    { time: "06:10", title: "Drink water", meta: "daily", tone: "muted" as const, overdue: false },
    { time: "15:00", title: "Deploy checklist", meta: "Fri · 45 min", tone: "amber" as const, overdue: false },
    { time: "16:00", title: "Reply security review thread", meta: "once", tone: "muted" as const, overdue: true },
    { time: "18:30", title: "Standup notes for tomorrow", meta: "weekly · Mon–Fri", tone: "muted" as const, overdue: false },
  ];
  return (
    <div className="flex flex-col gap-2.5">
      <BCard className="relative">
        <p className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wider text-[var(--b-amber)]">
          ✦ AI create
          <span className="absolute right-2 top-2">
            <Marker n={1} onHotspot={onHotspot} />
          </span>
        </p>
        <p className="mt-1.5 rounded border border-dashed border-[var(--b-border2)] bg-[var(--b-surface2)] px-2.5 py-2 font-mono text-[11px] text-[var(--b-t2)]">
          &quot;deploy checklist Fri 3pm, 45 min&quot; → time 15:00 · repeat weekly (Fri) · duration
          45m ✓
        </p>
      </BCard>
      <div className="flex items-center gap-4 border-b border-[var(--b-border)] pb-2 text-[12px]">
        <span className="text-[var(--b-red)]">
          Overdue <BChip tone="red">1</BChip>
        </span>
        <span className="border-b-2 border-[var(--b-amber)] pb-1.5 font-semibold">
          Today <BChip>3</BChip>
        </span>
        <span className="text-[var(--b-t3)]">Later</span>
      </div>
      {rows.map((r, i) => (
        <BCard key={r.title} className="relative flex items-center gap-3">
          <span
            className={cn(
              "font-mono text-[10.5px]",
              r.overdue ? "text-[var(--b-red)]" : "text-[var(--b-t3)]",
            )}
          >
            {r.time}
          </span>
          <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium">{r.title}</span>
          <BChip tone={r.tone}>{r.meta}</BChip>
          {i === 1 ? (
            <>
              <BChip tone="green">↔ plan</BChip>
              <Marker n={2} onHotspot={onHotspot} />
            </>
          ) : null}
        </BCard>
      ))}
      <p className="font-mono text-[10px] text-[var(--b-t3)]">
        a reminder with a duration is also a Reserved plan block — ticking either completes both
      </p>
    </div>
  );
}

function NotesScene({ onHotspot }: { onHotspot: (i: number) => void }) {
  return (
    <div className="flex flex-col gap-2.5">
      <BCard>
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] font-semibold">Retro follow-ups</span>
          <span className="text-[var(--b-amber)]" title="Pinned">
            ★
          </span>
          <span className="ml-auto font-mono text-[9.5px] text-[var(--b-t3)]">markdown-lite</span>
        </div>
        <p className="mt-2 text-[12px] leading-[1.7] text-[var(--b-t2)]">
          Flaky login spec needs a retry budget — maybe 2h to wire it into the fixture layer.
          <br />
          Also: ask infra about the staging cert before Friday&apos;s deploy.
        </p>
      </BCard>
      <BCard className="relative">
        <p className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wider text-[var(--b-amber)]">
          ✦ AI note — extracted
          <span className="absolute right-2 top-2">
            <Marker n={1} onHotspot={onHotspot} />
          </span>
        </p>
        <div className="mt-2 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 rounded-md border border-[var(--b-border)] bg-[var(--b-surface2)] px-2.5 py-2 text-[12px]">
            <span className="font-mono text-[10px] text-[var(--b-t3)]">plan</span>
            <span className="min-w-0 flex-1 truncate">Wire retry budget into fixture layer</span>
            <BChip>est 2h</BChip>
          </div>
          <div className="relative flex items-center gap-2 rounded-md border border-[var(--b-border)] bg-[var(--b-surface2)] px-2.5 py-2 text-[12px]">
            <span className="font-mono text-[10px] text-[var(--b-t3)]">remind</span>
            <span className="min-w-0 flex-1 truncate">Ask infra about staging cert</span>
            <BChip tone="blue">Thu 10:00</BChip>
            <Marker n={2} onHotspot={onHotspot} />
          </div>
        </div>
        <p className="mt-2 font-mono text-[10px] text-[var(--b-t3)]">
          ⇤ source: &quot;Retro follow-ups&quot; — every extracted item links back to its note
        </p>
      </BCard>
    </div>
  );
}

function KnowledgeScene({ onHotspot }: { onHotspot: (i: number) => void }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-4 border-b border-[var(--b-border)] pb-2 text-[12px]">
        <span className="text-[var(--b-t3)]">Sources</span>
        <span className="border-b-2 border-[var(--b-amber)] pb-1.5 font-semibold">Rules</span>
        <span className="text-[var(--b-t3)]">Agents</span>
        <span className="text-[var(--b-t3)]">Health</span>
      </div>
      <BCard className="relative">
        <p className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wider text-[var(--b-amber)]">
          ✦ Learn from reviews — proposals
          <span className="absolute right-2 top-2">
            <Marker n={1} onHotspot={onHotspot} />
          </span>
        </p>
        <div className="mt-2 flex flex-col gap-1.5">
          {[
            ["Always await IPC calls in renderer handlers", "×7"],
            ["Prefer fixed argv over string commands in main", "×4"],
          ].map(([rule, n]) => (
            <div
              key={rule}
              className="flex items-center gap-2 rounded-md border border-[var(--b-border)] bg-[var(--b-surface2)] px-2.5 py-2 text-[12px]"
            >
              <span className="min-w-0 flex-1 truncate">{rule}</span>
              <BChip tone="muted">{n} times</BChip>
              <span className="font-mono text-[11px] text-[var(--b-green)]">✓</span>
              <span className="font-mono text-[11px] text-[var(--b-red)]">✕</span>
            </div>
          ))}
        </div>
      </BCard>
      <BCard className="relative flex items-center gap-3">
        <span className="text-[13px]">📦</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium">review-agent</span>
          <span className="block font-mono text-[10px] text-[var(--b-t3)]">
            packaged: 2 skills · 1 sub-agent · 3 commands — ships with every run
          </span>
        </span>
        <BChip tone="green">imported</BChip>
        <Marker n={2} onHotspot={onHotspot} />
      </BCard>
      <p className="font-mono text-[10px] text-[var(--b-t3)]">
        stored in MongoDB (≤60KB/doc) → compiles to local-only Claude skills via .git/info/exclude
      </p>
    </div>
  );
}

function SprintScene({ onHotspot }: { onHotspot: (i: number) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2.5">
        <BCard className="relative">
          <p className="font-mono text-[9.5px] uppercase tracking-wider text-[var(--b-t3)]">
            Sprint health
          </p>
          <p className="mt-1 text-[20px] font-bold leading-none text-[var(--b-green)]">68%</p>
          <p className="mt-1 font-mono text-[10px] text-[var(--b-t3)]">21 / 31 pts</p>
        </BCard>
        <BCard className="relative">
          <p className="font-mono text-[9.5px] uppercase tracking-wider text-[var(--b-t3)]">
            ◔ My forecast
            <span className="absolute right-2 top-2">
              <Marker n={1} onHotspot={onHotspot} />
            </span>
          </p>
          <p className="mt-1 text-[20px] font-bold leading-none text-[var(--b-amber)]">86%</p>
          <p className="mt-1 font-mono text-[10px] text-[var(--b-t3)]">riskiest: WAY-142</p>
        </BCard>
        <BCard>
          <p className="font-mono text-[9.5px] uppercase tracking-wider text-[var(--b-t3)]">
            Days left
          </p>
          <p className="mt-1 text-[20px] font-bold leading-none">3.5</p>
          <p className="mt-1 font-mono text-[10px] text-[var(--b-t3)]">margin day 50%</p>
        </BCard>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <BCard>
          <p className="mb-2 font-mono text-[9.5px] uppercase tracking-wider text-[var(--b-t3)]">
            Today
          </p>
          {[
            ["WAY-142", "5 pts", "amber"],
            ["WAY-150", "3 pts · QA 50%", "blue"],
          ].map(([key, meta, tone]) => (
            <div
              key={key}
              className="mb-1.5 flex items-center justify-between rounded-md border border-[var(--b-border)] bg-[var(--b-surface2)] px-2.5 py-2 text-[12px] last:mb-0"
            >
              <span className="font-mono text-[11px] font-semibold">{key}</span>
              <BChip tone={tone as "amber"}>{meta}</BChip>
            </div>
          ))}
        </BCard>
        <BCard className="relative">
          <p className="mb-2 font-mono text-[9.5px] uppercase tracking-wider text-[var(--b-t3)]">
            Ceremonies
            <span className="absolute right-2 top-2">
              <Marker n={2} onHotspot={onHotspot} />
            </span>
          </p>
          <div className="flex flex-col gap-1.5 text-[12px] text-[var(--b-t2)]">
            <span>⌘⇧S Standup — drafted from real activity</span>
            <span>✦ Polish with Claude before posting</span>
            <span>Retro board · review summary</span>
          </div>
        </BCard>
      </div>
      <p className="font-mono text-[10px] text-[var(--b-t3)]">
        forecast = points remaining × measured velocity vs. hours left · QA tickets count 50%
      </p>
    </div>
  );
}
