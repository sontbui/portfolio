"use client";

import { useEffect, useRef } from "react";

/**
 * DATA FLOW BACKGROUND
 * ============================================================================
 * An ambient canvas that renders a slow-moving distributed-system graph behind
 * the entire site: drifting nodes, faint edges, and occasional data pulses
 * that travel the graph and propagate hop-to-hop — as if a real system were
 * quietly doing work in the background.
 *
 * It is *coupled to the page*, which is what makes it storytelling rather than
 * wallpaper:
 *   • Activity (pulse emission rate + colour) rises when the AI Platform
 *     section is centred in the viewport — the system "gets busy" during the
 *     flagship case study.
 *   • Latent connections fade in while Architecture sections are in view — the
 *     graph visibly *connects itself up* as you read how things fit together.
 *   • The pointer creates a soft local disturbance (nodes ease away, nearby
 *     edges brighten) — a subtle sense of touching a live system, never a
 *     dramatic effect.
 *
 * Engineering constraints (met):
 *   • 2D canvas, capped DPR, single rAF loop, work is O(nodes+edges+pulses)
 *     with ~16 nodes — trivially 60 FPS on modern hardware.
 *   • Section coupling uses one IntersectionObserver, not a scroll listener.
 *   • Pauses when the tab is hidden.
 *   • prefers-reduced-motion → one static frame, no loop, no pointer listener.
 *   • Effective opacity ~5–9%; sits at z-index -1 so opaque section bands
 *     naturally mask it, giving the page calm/active rhythm for free.
 * ============================================================================
 */

/* ----------------------------- Tuning knobs ----------------------------- */
const CONFIG = {
  layers: [2, 3, 4, 3, 2], // nodes per column → 14-node DAG, source→sink
  marginX: 0.06,
  marginY: 0.14,
  driftAmp: 0.014, // node drift radius (fraction of viewport dim)
  driftSpeed: 0.06,
  edgeAlpha: 0.05,
  latentEdgeAlpha: 0.055, // added on top of edgeAlpha when architecture revealed
  nodeAlpha: 0.1,
  hubNodeAlpha: 0.16,
  pulseCoreAlpha: 0.6,
  pulseSpeed: 0.28, // fraction of an edge per second
  spawnBase: 2.6, // seconds between spawns at idle
  spawnActive: 1.0, // seconds between spawns at full activity
  maxHops: 4,
  pointerRadius: 150, // px
  pointerPush: 12, // px
  ease: 0.05, // per-frame easing for activity/architecture/pointer state
};

const COLOR = {
  edge: "255, 255, 255",
  node: "255, 255, 255",
  brand: "59, 130, 246",
  accent: "139, 92, 246",
} as const;

interface Node {
  bx: number; // base position, normalized 0..1
  by: number;
  phase: number;
  speedX: number;
  speedY: number;
  hub: boolean;
  // live screen position (px), filled each frame
  x: number;
  y: number;
}

interface Edge {
  a: number;
  b: number;
  latent: boolean;
  /** Individual slow phase so latent links drift in/out — evolving topology. */
  phase: number;
}

interface Pulse {
  edge: number;
  t: number; // 0..1 along edge
  hops: number;
  accent: boolean;
}

/** Small seeded RNG so the topology is stable across reloads. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function buildGraph() {
  const rng = makeRng(20240611);
  const nodes: Node[] = [];
  const layerIdx: number[][] = [];
  const L = CONFIG.layers.length;

  CONFIG.layers.forEach((count, li) => {
    const ids: number[] = [];
    const x = CONFIG.marginX + (li / (L - 1)) * (1 - 2 * CONFIG.marginX);
    for (let n = 0; n < count; n++) {
      const span = 1 - 2 * CONFIG.marginY;
      const y = CONFIG.marginY + (count === 1 ? span / 2 : (n / (count - 1)) * span);
      ids.push(nodes.length);
      nodes.push({
        bx: x + (rng() - 0.5) * 0.03,
        by: y + (rng() - 0.5) * 0.05,
        phase: rng() * Math.PI * 2,
        speedX: (0.6 + rng() * 0.8) * CONFIG.driftSpeed,
        speedY: (0.6 + rng() * 0.8) * CONFIG.driftSpeed,
        hub: li === Math.floor(L / 2), // middle column = the "orchestrator" tier
        x: 0,
        y: 0,
      });
    }
    layerIdx.push(ids);
  });

  const edges: Edge[] = [];
  for (let li = 0; li < L - 1; li++) {
    const from = layerIdx[li];
    const to = layerIdx[li + 1];
    if (!from || !to || to.length === 0) continue;
    for (const a of from) {
      const nodeA = nodes[a];
      if (!nodeA) continue;
      // Nearest node in the next layer (structural edge)…
      let nearest = to[0]!;
      for (const b of to) {
        const nb = nodes[b];
        const nn = nodes[nearest];
        if (nb && nn && Math.abs(nb.by - nodeA.by) < Math.abs(nn.by - nodeA.by)) nearest = b;
      }
      edges.push({ a, b: nearest, latent: false, phase: rng() * Math.PI * 2 });
      // …plus one initially-latent connection for variety.
      const other = to[Math.floor(rng() * to.length)];
      if (other !== undefined && other !== nearest)
        edges.push({ a, b: other, latent: true, phase: rng() * Math.PI * 2 });
    }
  }

  const outgoing: number[][] = nodes.map(() => []);
  edges.forEach((e, i) => {
    const list = outgoing[e.a];
    if (list) list.push(i);
  });

  const sources = layerIdx[0] ?? [];
  return { nodes, edges, outgoing, sources };
}

/** Stable defaults (module scope) so the effect never re-runs on re-render. */
const DEFAULT_ACTIVITY = ["#ai-platform", "#ai-platform-title"];
const DEFAULT_ARCHITECTURE = ["#ai-arch", "#work", "#architecture"];

interface DataFlowBackgroundProps {
  /** Selectors that raise activity when centred (AI platform sections). */
  activitySelectors?: string[];
  /** Selectors that reveal latent connections when in view (architecture). */
  architectureSelectors?: string[];
}

export function DataFlowBackground({
  activitySelectors = DEFAULT_ACTIVITY,
  architectureSelectors = DEFAULT_ARCHITECTURE,
}: DataFlowBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasHover =
      typeof window.matchMedia === "function" && window.matchMedia("(hover: hover)").matches;

    const { nodes, edges, outgoing, sources } = buildGraph();
    const pulses: Pulse[] = [];

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // ---- Live, eased state ----
    const state = {
      activity: 0,
      activityTarget: 0,
      arch: 0,
      archTarget: 0,
      px: -9999,
      py: -9999,
      pxT: -9999,
      pyT: -9999,
    };

    // ---- Section coupling via one IntersectionObserver ----
    const activeSet = new Set<Element>();
    const archSet = new Set<Element>();
    let observer: IntersectionObserver | null = null;

    const activityEls = activitySelectors
      .flatMap((s) => Array.from(document.querySelectorAll(s)))
      .filter(Boolean);
    const archEls = architectureSelectors
      .flatMap((s) => Array.from(document.querySelectorAll(s)))
      .filter(Boolean);

    if (activityEls.length || archEls.length) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const inActivity = activityEls.includes(entry.target);
            const set = inActivity ? activeSet : archSet;
            if (entry.isIntersecting) set.add(entry.target);
            else set.delete(entry.target);
          }
          state.activityTarget = activeSet.size > 0 ? 1 : 0;
          state.archTarget = archSet.size > 0 ? 1 : 0;
        },
        { rootMargin: "-25% 0px -25% 0px", threshold: [0, 0.4] },
      );
      [...activityEls, ...archEls].forEach((el) => observer!.observe(el));
    }

    // ---- Pointer ----
    const onPointerMove = (e: PointerEvent) => {
      state.pxT = e.clientX;
      state.pyT = e.clientY;
    };
    const onPointerLeave = () => {
      state.pxT = -9999;
      state.pyT = -9999;
    };
    if (!reduceMotion && hasHover) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave, { passive: true });
    }

    // ---- Idle detection: an unattended system calms down ----
    let lastInteraction = performance.now();
    const stamp = () => {
      lastInteraction = performance.now();
    };
    if (!reduceMotion) {
      window.addEventListener("scroll", stamp, { passive: true });
      window.addEventListener("pointermove", stamp, { passive: true });
      window.addEventListener("keydown", stamp, { passive: true });
    }

    const spawnPulse = (accent: boolean) => {
      const src = sources[Math.floor(Math.random() * sources.length)];
      if (src === undefined) return;
      const outs = outgoing[src];
      if (!outs || outs.length === 0) return;
      const edge = outs[Math.floor(Math.random() * outs.length)];
      if (edge === undefined) return;
      pulses.push({ edge, t: 0, hops: 0, accent });
    };

    const computePositions = (t: number) => {
      for (const node of nodes) {
        const dx = Math.sin(t * node.speedX + node.phase) * CONFIG.driftAmp;
        const dy = Math.cos(t * node.speedY + node.phase * 1.3) * CONFIG.driftAmp;
        let x = (node.bx + dx) * width;
        let y = (node.by + dy) * height;
        // Local pointer disturbance — nodes ease away from the cursor.
        if (state.px > -9000) {
          const ddx = x - state.px;
          const ddy = y - state.py;
          const dist = Math.hypot(ddx, ddy);
          if (dist < CONFIG.pointerRadius && dist > 0.01) {
            const force = (1 - dist / CONFIG.pointerRadius) * CONFIG.pointerPush;
            x += (ddx / dist) * force;
            y += (ddy / dist) * force;
          }
        }
        node.x = x;
        node.y = y;
      }
    };

    const drawFrame = (t: number) => {
      computePositions(t);
      ctx.clearRect(0, 0, width, height);

      // Edges
      ctx.lineWidth = 1;
      const tint =
        state.activity > 0.05
          ? `${Math.round(255 - state.activity * 196)}, ${Math.round(255 - state.activity * 125)}, 255`
          : COLOR.edge;
      for (const edge of edges) {
        const a = nodes[edge.a];
        const b = nodes[edge.b];
        if (!a || !b) continue;
        // Latent links: fully revealed in architecture sections; elsewhere they
        // drift in and out on ~40s individual cycles — the topology slowly
        // evolves for anyone patient enough to watch.
        const drift = 0.5 + 0.5 * Math.sin(t * 0.16 + edge.phase);
        let alpha = edge.latent
          ? CONFIG.latentEdgeAlpha * Math.max(state.arch, 0.35 * drift)
          : CONFIG.edgeAlpha;
        // Pointer proximity brightens nearby edges slightly.
        if (state.px > -9000) {
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const d = Math.hypot(mx - state.px, my - state.py);
          if (d < CONFIG.pointerRadius) alpha += (1 - d / CONFIG.pointerRadius) * 0.06;
        }
        if (alpha <= 0.002) continue;
        ctx.strokeStyle = `rgba(${tint}, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Pulses
      for (const p of pulses) {
        const edge = edges[p.edge];
        if (!edge) continue;
        const a = nodes[edge.a];
        const b = nodes[edge.b];
        if (!a || !b) continue;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const col = p.accent ? COLOR.accent : COLOR.brand;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 9);
        glow.addColorStop(0, `rgba(${col}, ${CONFIG.pulseCoreAlpha})`);
        glow.addColorStop(1, `rgba(${col}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();
      }

      // Nodes
      for (const node of nodes) {
        let alpha = node.hub ? CONFIG.hubNodeAlpha : CONFIG.nodeAlpha;
        if (state.px > -9000) {
          const d = Math.hypot(node.x - state.px, node.y - state.py);
          if (d < CONFIG.pointerRadius) alpha += (1 - d / CONFIG.pointerRadius) * 0.12;
        }
        const r = node.hub ? 2.6 : 1.8;
        ctx.fillStyle = `rgba(${COLOR.node}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fill();
        if (node.hub) {
          ctx.strokeStyle = `rgba(${COLOR.brand}, ${alpha * 0.7})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    };

    // ---- Reduced motion: one static frame, no loop ----
    if (reduceMotion) {
      state.arch = 1; // show the full graph, calmly
      drawFrame(0);
      const onResizeStatic = () => {
        resize();
        drawFrame(0);
      };
      window.addEventListener("resize", onResizeStatic);
      return () => {
        window.removeEventListener("resize", onResizeStatic);
        observer?.disconnect();
      };
    }

    // ---- Animation loop ----
    let raf = 0;
    let last = performance.now();
    let sinceSpawn = 0;
    let running = true;

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05); // clamp after tab-switch
      last = now;
      const t = now / 1000;

      // Ease live state toward targets
      state.activity += (state.activityTarget - state.activity) * CONFIG.ease;
      state.arch += (state.archTarget - state.arch) * CONFIG.ease;
      state.px += (state.pxT - state.px) * 0.12;
      state.py += (state.pyT - state.py) * 0.12;

      // Spawn pulses at an activity-scaled rate; after ~30s without input the
      // network winds down to half traffic (idleness eases 0 → 1 over 30-60s).
      sinceSpawn += dt;
      const idleness = Math.min(Math.max((now - lastInteraction - 30_000) / 30_000, 0), 1);
      const interval =
        (CONFIG.spawnBase + (CONFIG.spawnActive - CONFIG.spawnBase) * state.activity) *
        (1 + idleness);
      if (sinceSpawn >= interval) {
        sinceSpawn = 0;
        spawnPulse(state.activity > 0.5);
      }

      // Advance pulses; propagate onward at nodes
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        if (!p) continue;
        p.t += CONFIG.pulseSpeed * dt * (1 + state.activity * 0.6);
        if (p.t >= 1) {
          const edge = edges[p.edge];
          const outs = edge ? outgoing[edge.b] : undefined;
          const next =
            outs && outs.length ? outs[Math.floor(Math.random() * outs.length)] : undefined;
          if (p.hops < CONFIG.maxHops && next !== undefined && Math.random() < 0.8) {
            p.edge = next;
            p.t = 0;
            p.hops += 1;
          } else {
            pulses.splice(i, 1);
          }
        }
      }

      drawFrame(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", stamp);
      window.removeEventListener("pointermove", stamp);
      window.removeEventListener("keydown", stamp);
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
    };
  }, [activitySelectors, architectureSelectors]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}
