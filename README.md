# Pretext Playground

A sandbox where you edit a single block of text and watch it transformed by a gallery of typographic showcases — each one its own little world. Editorial palette (Fraunces serif, warm paper), playful motion, no dashboards.

The repo is a pnpm monorepo with several artifacts; the playground itself lives in `artifacts/pretext-playground`.

## Quick start

Requires Node.js 24 and pnpm 9+.

```bash
pnpm install
pnpm --filter @workspace/pretext-playground run dev
```

Then open the URL printed by Vite (or use the Replit preview).

Other useful commands:

```bash
pnpm run typecheck                                 # full typecheck across the workspace
pnpm run build                                     # typecheck + build everything
pnpm --filter @workspace/pretext-playground run build
```

## What's inside

- **Pretext Playground** (`artifacts/pretext-playground`) — the React + Vite frontend you came for. A side panel lets you edit the source text; the right side renders ~19 showcases, each with its own dedicated `/showcase/:id` page.
- **API Server** (`artifacts/api-server`) — an Express scaffold. The playground does not use it; it's here for future server-backed showcases.
- **Mockup Sandbox** (`artifacts/mockup-sandbox`) — Vite preview server for designing components in isolation on the canvas.
- **Shared libs** under `lib/` — composite TS packages (e.g. `@workspace/api-client-react`).

## Showcases at a glance

The playground ships with two groups:

**Community-inspired** — re-imaginings of effects that have been making the rounds lately.

- The Web Is Interesting Again — text becomes a window into a moving fluid; words push away from the cursor.
- Variable Typographic ASCII — letters morph through ASCII gradients.
- Illuminated Dragon — a chained dragon follows the mouse; click to breathe fire that the text reflows around.
- The Most Magical Time — text wraps around a moving sparkle field.
- Hooke's Law — words connected by springs that you can grab and fling.
- Fluid Interfaces — type behaves like liquid under cursor pressure.
- Water Ripple — pointer drops ripples that distort the page.
- Pretext Breaker — Breakout, but the bricks are the source text.

**Originals** — built specifically for this playground.

- Gravity Words, Typewriter, Constellation, Letter Swarm, ASCII Rain — calmer, ambient pieces.
- Type Defense — ZType-style: words descend, type to fire lasers, five hearts.
- Word Asteroids — mouse-aim a ship in zero-G; click to fire; long words split when struck.
- Black Hole — words orbit a singularity, spiraling inward; click to send a shockwave that flings them back.
- Word Snake — eat letters with arrows/WASD; eaten letters travel down your body and spell out the source text.
- Sand Letters — your text is built from coloured sand particles; drag to make them collapse.
- Letter Tetris — letters from your text fall one at a time; clear filled rows.

## Documentation

- [`docs/AUTHORING_SHOWCASES.md`](docs/AUTHORING_SHOWCASES.md) — how to add a new showcase, with conventions and patterns used in the codebase.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — deploying the playground to GitHub Pages via the included Actions workflow.
- [`replit.md`](replit.md) — operational notes (env vars, scripts, repo conventions) intended for an AI assistant working in this repo, also useful as a developer reference.

## License

MIT.
