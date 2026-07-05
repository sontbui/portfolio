# Son Bui — Engineering Portfolio

Production-grade personal portfolio for a Software Engineer in Test focused on AI-powered test
automation, built from an approved visual design. Includes an **AI Portfolio Assistant** — a
retrieval-augmented (RAG) chat that answers questions about Son strictly from a curated knowledge
base (see `docs/ai-assistant/ARCHITECTURE.md`).

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Framer
Motion · Lucide Icons · Vercel AI SDK · OpenRouter · local Transformers.js embeddings.

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # static export → ./out
npm run typecheck  # tsc --noEmit (strict)
npm run lint       # next lint
```

Copy `.env.example` to `.env.local` to configure the canonical URL, base path, and analytics.
Everything is optional; the app builds and runs with no environment variables.

---

## Architecture

The site is a single page composed from independent section components. Rendering is
**server-first** — only interactive leaves (the nav and the Framer Motion wrappers) are Client
Components. This keeps shipped JavaScript small (~150 kB first load) while the entire content is
present in the server-rendered HTML for SEO and no-JS resilience.

```
src/
├── app/                 # App Router entry, metadata, SEO routes, fonts
│   ├── layout.tsx        # Root layout, <head> metadata, fonts, analytics
│   ├── page.tsx          # Page = composition of sections
│   ├── globals.css       # Design system (Tailwind v4 @theme tokens)
│   ├── fonts.ts          # Self-hosted Geist + JetBrains Mono (next/font/local)
│   ├── opengraph-image.tsx  # Build-time OG/Twitter image (1200×630)
│   ├── sitemap.ts / robots.ts / manifest.ts
│   └── fonts/            # Vendored woff2 files
├── sections/            # One component per page section
│   └── ai-platform/      # Flagship case study (sub-components)
├── components/
│   ├── layout/           # Navbar, Footer, Analytics, StructuredData
│   ├── ui/               # Reusable primitives (Card, Tag, Button, SkillMeter…)
│   ├── motion/           # Reveal / Stagger (Framer Motion, reduced-motion aware)
│   ├── diagrams/         # Architecture & workflow diagram components
│   └── work/             # Project-card shell for Selected Work
├── constants/           # site config, portfolio content (data), motion presets
├── hooks/               # useActiveSection (nav highlighting)
├── lib/                 # cn(), analytics facade, path helpers
└── types/               # Domain types (content model)
```

### Design system

All visual tokens — colors, typography (fluid `clamp()` scale), radii, shadows, spacing, motion
easings — live once in `globals.css` under Tailwind v4's `@theme`. Components reference tokens
(`bg-surface`, `text-h2`, `border-accent/30`), never raw hex values or magic numbers.

### Content model

Every piece of copy and data is extracted from the approved design and centralised in
`src/constants/data.ts`, typed by `src/types`. Sections are pure presentation over that data, so
content can change without touching components.

---

## Key engineering decisions

- **Hybrid rendering on Vercel** — marketing pages are statically prerendered for fast first paint;
  only the RAG chat (`/api/chat`) runs as a serverless function. (The site began as a static export;
  adding the server-side assistant required a runtime, so it now targets Vercel.)
- **Grounded, single-key AI** — OpenRouter for generation, local Transformers.js for embeddings, so
  the assistant answers only from the knowledge base and needs just one API key.
- **Self-hosted fonts** — Geist and JetBrains Mono are vendored as woff2 and loaded via
  `next/font/local`. This removes a render-blocking third-party request (better LCP), makes builds
  reproducible offline, and avoids leaking visitor IPs to a font CDN.
- **Motion gated in one place** — `<Reveal>` / `<Stagger>` are the only motion primitives and both
  honour `prefers-reduced-motion`, so no section component branches on the preference itself.
- **Provider-agnostic analytics** — no tracking IDs are hard-coded; GA, Plausible, or Vercel
  Analytics activate only when their env var is present.

---

## Accessibility

- Semantic landmarks (`header`, `main`, `footer`, labelled `section`s) and a skip-to-content link.
- Logical heading hierarchy (single `h1`, sectioned `h2`→`h4`).
- Visible keyboard focus styles; accessible mobile menu (disclosure pattern with `aria-expanded`).
- Diagrams are wrapped as labelled `figure`s with descriptive text for screen readers; decorative
  icons and connectors are `aria-hidden`.
- Skill meters expose progress via `role="meter"` with value labels.
- Full `prefers-reduced-motion` support (JS and CSS).

---

## AI Portfolio Assistant (RAG)

A retrieval-augmented chat answering questions about Son from `content/*.md` only. Generation runs
through **OpenRouter**; embeddings run **locally** (Transformers.js `bge-small-en-v1.5`) so only one
key is needed. Full design: `docs/ai-assistant/ARCHITECTURE.md`.

**Setup**

1. `cp .env.example .env.local` and set `OPENROUTER_API_KEY` (optionally `OPENROUTER_MODEL`).
2. `npm run ingest` — chunks + embeds `content/` into `data/knowledge.json` (incremental; re-embeds
   only changed chunks). Commit `data/knowledge.json` so it ships with the deploy.
3. `npm run dev` and open the "Ask about Son" launcher.

Adding knowledge later = drop a `.md` in `content/` and re-run `npm run ingest`. To scale beyond the
in-memory store, set `VECTOR_STORE=upstash` + Upstash env vars — the retriever is unchanged.

## Deployment — Vercel

The assistant needs a server runtime, so the app deploys on **Vercel** (Hobby tier is free). Import
the repo and set, in project settings:

- `OPENROUTER_API_KEY` (required for the assistant)
- optional: `OPENROUTER_MODEL`, `NEXT_PUBLIC_SITE_URL`, `VECTOR_STORE`/Upstash vars, analytics vars

Marketing pages are statically prerendered; only `/api/chat` runs on demand. Run `npm run ingest`
before deploy (or in CI) so `data/knowledge.json` is present.

---

## Notes

- `_design-reference/` holds the original approved design HTML as the visual spec. It is
  git-ignored and not part of the build.
- Replace `public/Son-Bui-Resume.pdf` with the actual résumé (referenced by the Resume CTAs).
