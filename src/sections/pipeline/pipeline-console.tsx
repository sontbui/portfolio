"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowDown, Pause, Play, RotateCcw } from "lucide-react";

import {
  PIPELINE_META,
  SCENARIOS,
  STAGES,
  type StageDef,
  type StageRun,
  type StageStatus,
} from "@/constants/pipeline-demo";
import { cn } from "@/lib/utils";

/* ==========================================================================
   PIPELINE CONSOLE — an orchestration-engine view of the real AI pipeline.

   Layout: phase-grouped rows (GitHub-Actions-style stages), because the real
   n8n workflow has exactly four phases — intake, generate & execute,
   self-correction, delivery. Every node is always visible; no horizontal
   overflow, no camera panning. The conditional phase renders as explicitly
   "skipped" on happy-path runs, which is itself part of the story.

   Engine: one 100ms tick advances a virtual clock; every visual state (node
   status, phase status, streaming logs) derives from that clock — no
   per-node timers. Reduced motion: nothing auto-plays; Run works without
   pulse effects.
   ========================================================================== */

const GAP_MS = 350;
const HOLD_MS = 6500;
const TICK_MS = 100;

type PhaseId = "intake" | "generate" | "correct" | "deliver";

const PHASES: readonly { id: PhaseId; n: string; label: string; desc: string }[] = [
  { id: "intake", n: "01", label: "Intake", desc: "ticket → normalized handoff" },
  { id: "generate", n: "02", label: "Generate & Execute", desc: "agent writes the spec · Playwright runs it" },
  { id: "correct", n: "03", label: "Self-Correction", desc: "only on failure · max 3 attempts" },
  { id: "deliver", n: "04", label: "Delivery", desc: "result → pull request → Jira handback" },
];

const PHASE_OF: Record<string, PhaseId> = {
  trigger: "intake",
  fetch: "intake",
  "gate-meta": "intake",
  handoff: "intake",
  "agent-gen": "generate",
  "run-1": "generate",
  "gate-pass": "generate",
  "agent-debug": "correct",
  "run-2": "correct",
  analyze: "correct",
  "jira-comment": "deliver",
  "git-pr": "deliver",
  "jira-update": "deliver",
};

interface Window_ {
  run: StageRun;
  start: number;
  end: number;
}

function buildSchedule(runs: readonly StageRun[]): { windows: Window_[]; total: number } {
  let t = 400;
  const windows: Window_[] = [];
  for (const run of runs) {
    windows.push({ run, start: t, end: t + run.duration });
    t += run.duration + GAP_MS;
  }
  return { windows, total: t };
}

interface LogLine {
  key: string;
  time: number;
  stage: string;
  text: string;
  level: "info" | "ok" | "warn" | "error";
}

const SYSTEM_TONE: Record<StageDef["system"], string> = {
  n8n: "text-fg-faint",
  jira: "text-brand-soft",
  "qa-service": "text-fg-subtle",
  claude: "text-accent-soft",
  playwright: "text-success-soft",
  github: "text-fg-strong",
};

type PhaseStatus = "pending" | "running" | "complete" | "skipped";

export function PipelineConsole() {
  const reduceMotion = useReducedMotion();

  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [clock, setClock] = useState(0);
  const [playing, setPlaying] = useState<boolean | null>(null);
  const [speed, setSpeed] = useState(1);
  const [selectedId, setSelectedId] = useState<string>("agent-gen");
  const [tab, setTab] = useState<"overview" | "logs" | "io" | "artifact">("overview");

  useEffect(() => {
    setPlaying((p) => (p === null ? !reduceMotion : p));
  }, [reduceMotion]);

  const scenario = SCENARIOS[scenarioIdx % SCENARIOS.length]!;
  const { windows, total } = useMemo(() => buildSchedule(scenario.runs), [scenario]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setClock((c) => c + TICK_MS * speed), TICK_MS);
    return () => window.clearInterval(id);
  }, [playing, speed]);

  useEffect(() => {
    if (clock < total + HOLD_MS) return;
    setScenarioIdx((i) => i + 1);
    setCycle((c) => c + 1);
    setClock(0);
  }, [clock, total]);

  const finished = clock >= total;

  /* -------- derived state -------- */

  const stageState = useMemo(() => {
    const map = new Map<string, { status: StageStatus; window?: Window_ }>();
    for (const s of STAGES) map.set(s.id, { status: "skipped" });
    for (const w of windows) {
      const status: StageStatus =
        clock >= w.end
          ? w.run.outcome === "failed"
            ? "failed"
            : "passed"
          : clock >= w.start
            ? "running"
            : "queued";
      map.set(w.run.stage, { status, window: w });
    }
    return map;
  }, [windows, clock]);

  const phaseStatus = useMemo(() => {
    const map = new Map<PhaseId, PhaseStatus>();
    for (const phase of PHASES) {
      const members = STAGES.filter((s) => PHASE_OF[s.id] === phase.id);
      const sts = members.map((m) => stageState.get(m.id)!.status);
      if (sts.some((s) => s === "running")) map.set(phase.id, "running");
      else if (sts.every((s) => s === "skipped")) map.set(phase.id, "skipped");
      else if (sts.every((s) => s === "passed" || s === "failed" || s === "skipped"))
        map.set(phase.id, "complete");
      else if (sts.some((s) => s === "passed" || s === "failed"))
        map.set(phase.id, "running"); // between nodes of the same phase
      else map.set(phase.id, "pending");
    }
    return map;
  }, [stageState]);

  const logs = useMemo<LogLine[]>(() => {
    const out: LogLine[] = [];
    for (const w of windows) {
      for (const [i, l] of w.run.logs.entries()) {
        const t = w.start + l.at * w.run.duration;
        if (t <= clock) {
          out.push({
            key: `${cycle}-${w.run.stage}-${i}`,
            time: t,
            stage: w.run.stage,
            text: l.text,
            level: l.level ?? "info",
          });
        }
      }
    }
    return out.slice(-120);
  }, [windows, clock, cycle]);

  const running = windows.find((w) => clock >= w.start && clock < w.end);
  const selected = STAGES.find((s) => s.id === selectedId) ?? STAGES[0]!;
  const selectedState = stageState.get(selected.id);
  const selectedLogs = logs.filter((l) => l.stage === selected.id);
  const gateFailed = stageState.get("gate-pass")?.status === "failed";
  const gateDecided =
    stageState.get("gate-pass")?.status === "passed" || gateFailed;

  const restart = () => {
    setClock(0);
    setPlaying(true);
  };

  const execId = PIPELINE_META.execBase + cycle;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-bg-deeper shadow-card">
      {/* ---- Console header ---- */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/[0.07] bg-surface px-4 py-3">
        <span className="font-mono text-[12px] font-semibold text-fg-strong">
          {PIPELINE_META.workflow}
        </span>
        <span className="hidden font-mono text-[10.5px] text-fg-faint sm:inline">
          exec #{execId} · corr qa1427-{((execId * 2654435761) % 0xffff).toString(16)}
        </span>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold",
            scenario.id === "fail"
              ? "bg-accent/[0.12] text-accent-soft"
              : "bg-success/10 text-success-soft",
          )}
        >
          {scenario.label}
        </span>
        <span aria-hidden className="ml-auto font-mono text-[11px] tabular-nums text-fg-subtle">
          {finished ? "completed" : running ? `t+${(clock / 1000).toFixed(1)}s` : "starting…"}
        </span>
        <span className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause pipeline" : "Resume pipeline"}
            className="inline-flex size-7 items-center justify-center rounded-md border border-white/10 text-fg-subtle transition-colors hover:border-white/25 hover:text-white"
          >
            {playing ? <Pause size={12} aria-hidden /> : <Play size={12} aria-hidden />}
          </button>
          <button
            type="button"
            onClick={restart}
            aria-label="Restart pipeline"
            className="inline-flex size-7 items-center justify-center rounded-md border border-white/10 text-fg-subtle transition-colors hover:border-white/25 hover:text-white"
          >
            <RotateCcw size={12} aria-hidden />
          </button>
          {[1, 2, 4].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              aria-pressed={speed === s}
              className={cn(
                "rounded-md border px-1.5 py-1 font-mono text-[10px] transition-colors",
                speed === s
                  ? "border-brand/50 bg-brand/10 text-brand-soft"
                  : "border-white/10 text-fg-faint hover:text-white",
              )}
            >
              {s}×
            </button>
          ))}
        </span>
      </div>

      {/* ---- Phase-grouped workflow ---- */}
      <div className="flex flex-col gap-1 border-b border-white/[0.07] bg-bg-deep p-3 sm:p-4">
        {PHASES.map((phase, pi) => {
          const pStatus = phaseStatus.get(phase.id)!;
          const members = STAGES.filter((s) => PHASE_OF[s.id] === phase.id);
          return (
            <div key={phase.id}>
              {/* transition marker between phases — sits on the side where the
                  snake wraps (right after L→R rows, left after R→L rows). */}
              {pi > 0 ? (
                <PhaseTransition
                  from={PHASES[pi - 1]!.id}
                  to={phase.id}
                  side={pi % 2 === 1 ? "right" : "left"}
                  gateDecided={gateDecided}
                  gateFailed={gateFailed}
                />
              ) : null}

              <div
                className={cn(
                  "flex flex-col gap-2.5 rounded-xl border p-3 transition-colors duration-[300ms] sm:flex-row sm:items-center sm:gap-4",
                  pStatus === "running" && "border-brand/[0.35] bg-brand/[0.04]",
                  pStatus === "complete" && "border-white/[0.07] bg-surface/40 opacity-80",
                  pStatus === "pending" && "border-white/[0.06] opacity-60",
                  pStatus === "skipped" && "border-dashed border-white/[0.07] opacity-45",
                )}
              >
                {/* phase rail */}
                <div className="w-full shrink-0 sm:w-[168px]">
                  <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-ghost">
                    <span
                      aria-hidden
                      className={cn(
                        pStatus === "running" && "animate-pulse-dot text-brand-soft",
                        pStatus === "complete" && "text-success-soft",
                        pStatus === "skipped" && "text-fg-ghost",
                        pStatus === "pending" && "text-fg-ghost",
                      )}
                    >
                      {pStatus === "running"
                        ? "●"
                        : pStatus === "complete"
                          ? "✓"
                          : pStatus === "skipped"
                            ? "—"
                            : "○"}
                    </span>
                    {phase.n} · {phase.label}
                  </p>
                  <p className="mt-0.5 text-[10.5px] leading-snug text-fg-faint">
                    {pStatus === "skipped" ? "skipped — passed on first attempt" : phase.desc}
                  </p>
                </div>

                {/* nodes — snake layout: odd rows flow right → left */}
                <div
                  className={cn(
                    "flex min-w-0 flex-1 flex-wrap items-center gap-y-2",
                    pi % 2 === 1 && "flex-row-reverse",
                  )}
                >
                  {members.map((s, i) => {
                    const st = stageState.get(s.id)!;
                    const isSelected = selectedId === s.id;
                    const dur = st.window
                      ? Math.max(
                          0,
                          Math.min(clock, st.window.end) - st.window.start,
                        )
                      : 0;
                    return (
                      <div
                        key={s.id}
                        className={cn(
                          "flex min-w-0 flex-1 items-center basis-[160px]",
                          pi % 2 === 1 && "flex-row-reverse",
                        )}
                      >
                        {i > 0 ? (
                          <span
                            aria-hidden
                            className={cn(
                              "px-1 text-[13px]",
                              st.status === "queued" || st.status === "skipped"
                                ? "text-line-strong"
                                : "text-fg-faint",
                            )}
                          >
                            {pi % 2 === 1 ? "←" : "→"}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(s.id);
                            setTab("overview");
                          }}
                          aria-pressed={isSelected}
                          className={cn(
                            "relative min-w-0 flex-1 rounded-[10px] border px-2.5 py-2 text-left transition-colors duration-[300ms]",
                            st.status === "running" && "border-brand/60 bg-brand/[0.1]",
                            st.status === "passed" && "border-success/30 bg-surface",
                            st.status === "failed" && "border-[#f2708a]/50 bg-[#f2708a]/[0.08]",
                            st.status === "queued" && "border-white/[0.09] bg-surface",
                            st.status === "skipped" &&
                              "border-dashed border-white/[0.08] bg-transparent",
                            isSelected && "outline outline-1 outline-brand/60",
                          )}
                        >
                          <span className="block truncate pr-4 text-[11.5px] font-semibold leading-tight text-fg-strong">
                            {s.name}
                          </span>
                          <span className="flex items-baseline gap-2">
                            <span className={cn("font-mono text-[9.5px]", SYSTEM_TONE[s.system])}>
                              {s.system}
                            </span>
                            {st.status === "passed" || st.status === "failed" ? (
                              <span className="font-mono text-[9px] tabular-nums text-fg-faint">
                                {(dur / 1000).toFixed(1)}s
                              </span>
                            ) : null}
                          </span>
                          <span
                            aria-hidden
                            className={cn(
                              "absolute right-2 top-2 font-mono text-[9px]",
                              st.status === "running" && "animate-pulse-dot text-brand-soft",
                              st.status === "passed" && "text-success-soft",
                              st.status === "failed" && "text-[#f2708a]",
                              (st.status === "queued" || st.status === "skipped") &&
                                "text-fg-faint",
                            )}
                          >
                            {st.status === "running"
                              ? "●"
                              : st.status === "passed"
                                ? "✓"
                                : st.status === "failed"
                                  ? "✕"
                                  : st.status === "queued"
                                    ? "…"
                                    : "—"}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- Log stream + inspector ---- */}
      <div className="grid md:grid-cols-[1fr_360px]">
        <LogStream logs={logs} clock={clock} finished={finished} />
        <Inspector
          stage={selected}
          status={selectedState?.status ?? "skipped"}
          window={selectedState?.window}
          logs={selectedLogs}
          tab={tab}
          setTab={setTab}
          clock={clock}
        />
      </div>

      {/* ---- Service strip ---- */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-white/[0.07] bg-surface px-4 py-2">
        {PIPELINE_META.services.map((svc) => (
          <span
            key={svc.name}
            className="flex items-center gap-1.5 font-mono text-[10px] text-fg-faint"
          >
            <i aria-hidden className="size-1.5 animate-pulse-dot rounded-full bg-success" />
            <span className="text-fg-subtle">{svc.name}</span> {svc.detail}
          </span>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- Phase transitions --------------------------- */

function PhaseTransition({
  from,
  to,
  side,
  gateDecided,
  gateFailed,
}: {
  from: PhaseId;
  to: PhaseId;
  side: "left" | "right";
  gateDecided: boolean;
  gateFailed: boolean;
}) {
  const align = cn(
    "flex items-center gap-2 py-1 font-mono text-[9.5px]",
    side === "right" ? "justify-end pr-6" : "pl-6",
  );
  // The interesting junction: after "generate", the gate routes the run.
  if (from === "generate" && to === "correct") {
    return (
      <div className={align}>
        <ArrowDown size={10} aria-hidden className="text-fg-ghost" />
        <span className={cn(gateDecided && gateFailed ? "text-[#f2b45c]" : "text-fg-ghost")}>
          on FAIL → self-correction
        </span>
        <span className="text-fg-ghost">·</span>
        <span className={cn(gateDecided && !gateFailed ? "text-success-soft" : "text-fg-ghost")}>
          on PASS → straight to delivery
        </span>
      </div>
    );
  }
  if (from === "correct" && to === "deliver") {
    return (
      <div className={cn(align, "text-fg-ghost")}>
        <ArrowDown size={10} aria-hidden />
        <span>after retry PASS + analysis verdict</span>
      </div>
    );
  }
  return (
    <div aria-hidden className={align}>
      <ArrowDown size={10} className="text-fg-ghost" />
    </div>
  );
}

/* ------------------------------ Log stream ------------------------------- */

function LogStream({
  logs,
  clock,
  finished,
}: {
  logs: LogLine[];
  clock: number;
  finished: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [logs.length]);

  const levelCls = {
    info: "text-fg-subtle",
    ok: "text-success-soft",
    warn: "text-[#f2b45c]",
    error: "text-[#f2708a]",
  } as const;

  return (
    <div className="border-b border-white/[0.07] md:border-b-0 md:border-r">
      <p className="border-b border-white/[0.06] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-ghost">
        execution log
      </p>
      <div
        ref={ref}
        className="h-[240px] overflow-y-auto px-4 py-2 font-mono text-[11px] leading-[1.75]"
      >
        {logs.map((l) => (
          <p key={l.key} className="whitespace-nowrap">
            <span className="text-fg-ghost">{(l.time / 1000).toFixed(1).padStart(5)}s</span>{" "}
            <span className={levelCls[l.level]}>{l.text}</span>
          </p>
        ))}
        {finished ? (
          <p className="text-fg-faint">— run complete · next cycle in a few seconds —</p>
        ) : (
          <p aria-hidden className="text-fg-ghost">
            {clock > 0 ? "▌" : ""}
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Inspector ------------------------------- */

function Inspector({
  stage,
  status,
  window: win,
  logs,
  tab,
  setTab,
  clock,
}: {
  stage: StageDef;
  status: StageStatus;
  window?: Window_;
  logs: LogLine[];
  tab: "overview" | "logs" | "io" | "artifact";
  setTab: (t: "overview" | "logs" | "io" | "artifact") => void;
  clock: number;
}) {
  const elapsed = win ? Math.max(0, Math.min(clock, win.end) - win.start) : 0;

  const tabs = (
    [
      ["overview", "Overview"],
      ["logs", "Logs"],
      ["io", "I/O"],
      ...(stage.artifact ? ([["artifact", "Artifact"]] as const) : []),
    ] as const
  ).map(([id, label]) => (
    <button
      key={id}
      type="button"
      onClick={() => setTab(id)}
      aria-pressed={tab === id}
      className={cn(
        "rounded-md px-2 py-1 font-mono text-[10.5px] transition-colors",
        tab === id ? "bg-surface-raised text-white" : "text-fg-faint hover:text-white",
      )}
    >
      {label}
    </button>
  ));

  const statusCls = {
    running: "text-brand-soft",
    passed: "text-success-soft",
    failed: "text-[#f2708a]",
    queued: "text-fg-faint",
    skipped: "text-fg-ghost",
  } as const;

  return (
    <div className="flex min-h-[280px] flex-col">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-white/[0.06] px-4 py-2">
        <span className="min-w-0 truncate text-[12.5px] font-semibold text-white">
          {stage.name}
        </span>
        <span className={cn("font-mono text-[10px]", statusCls[status])}>
          {status}
          {win && status !== "queued" && status !== "skipped"
            ? ` · ${(elapsed / 1000).toFixed(1)}s`
            : ""}
        </span>
        <span className="ml-auto flex gap-0.5">{tabs}</span>
      </div>

      <div className="scrollbar-hidden h-[240px] overflow-y-auto p-4">
        {tab === "overview" ? (
          <dl className="flex flex-col gap-2.5">
            {stage.detail.map((row) => (
              <div key={row.label} className="grid grid-cols-[110px_1fr] gap-2">
                <dt className="font-mono text-[10px] uppercase tracking-wide text-fg-ghost">
                  {row.label}
                </dt>
                <dd className="break-words font-mono text-[11px] leading-[1.5] text-fg-muted">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {tab === "logs" ? (
          logs.length ? (
            <div className="font-mono text-[11px] leading-[1.75]">
              {logs.map((l) => (
                <p key={l.key} className="text-fg-subtle">
                  {l.text}
                </p>
              ))}
            </div>
          ) : (
            <p className="font-mono text-[11px] text-fg-faint">
              no output yet — node hasn&apos;t run in this cycle
            </p>
          )
        ) : null}

        {tab === "io" ? (
          <div className="flex flex-col gap-3">
            {stage.input ? <IoBlock label="input" body={stage.input} /> : null}
            {stage.output ? <IoBlock label="output" body={stage.output} /> : null}
            {!stage.input && !stage.output ? (
              <p className="font-mono text-[11px] text-fg-faint">
                control-flow node — no payload of its own
              </p>
            ) : null}
          </div>
        ) : null}

        {tab === "artifact" && stage.artifact ? (
          <IoBlock label={stage.artifact.title} body={stage.artifact.body} />
        ) : null}
      </div>
    </div>
  );
}

function IoBlock({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-ghost">
        {label}
      </p>
      <pre className="overflow-x-auto rounded-lg border border-white/[0.07] bg-bg p-3 font-mono text-[10.5px] leading-[1.6] text-fg-muted">
        <code>{body}</code>
      </pre>
    </div>
  );
}
