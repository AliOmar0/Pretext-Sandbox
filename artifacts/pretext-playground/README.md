# Pretext Playground

A React + Vite frontend that turns a shared block of editable text into ~19 typographic showcases — games, simulations, and ambient pieces. Each showcase has its own page at `/showcase/:id`.

For project-wide context (workspace structure, other artifacts, deployment), see the [root README](../../README.md).

## Run it locally

From the repo root:

```bash
pnpm install
pnpm --filter @workspace/pretext-playground run dev
```

The app boots on the port given by the `PORT` env var (set automatically by the Replit workflow; defaults you can pass yourself when running ad-hoc).

## Project structure

```
artifacts/pretext-playground/
├── src/
│   ├── components/
│   │   ├── showcases/        # ← every showcase lives here, one file each
│   │   ├── ShowcaseCard.tsx  # framed container shared by all showcases
│   │   ├── TextInputPanel.tsx
│   │   └── ui/               # shadcn-style primitives (button, dialog, etc.)
│   ├── pages/
│   │   ├── HomePage.tsx      # grid of all showcases
│   │   └── ShowcasePage.tsx  # standalone /showcase/:id view
│   ├── lib/
│   │   ├── showcase-registry.tsx  # ← register new showcases here
│   │   ├── playground-context.ts  # shared text + localStorage persistence
│   │   └── flow-around.ts         # text layout around moving obstacles
│   └── App.tsx               # wouter router with BASE_URL-aware base path
├── index.html
├── vite.config.ts            # requires PORT and BASE_PATH at build time
└── package.json
```

## Adding a showcase

See [`docs/AUTHORING_SHOWCASES.md`](../../docs/AUTHORING_SHOWCASES.md) — three-step guide plus the codebase conventions (game-loop pattern, resize handling, palette).

## Deploying

See [`docs/DEPLOYMENT.md`](../../docs/DEPLOYMENT.md) — covers the GitHub Pages workflow, custom domains, and other static hosts.

## Stack

- **React 18 + Vite** with TypeScript (strict)
- **Wouter** for routing (lightweight; respects `import.meta.env.BASE_URL`)
- **Tailwind CSS v4** + a small set of shadcn-style primitives (Radix under the hood)
- **framer-motion** for entrance animations and the occasional spring
- **lucide-react** for icons

No backend dependency — everything is client-side.

## Source text

The shared editable text lives in `localStorage` under `pretext-playground:text`. The default text is in `lib/playground-context.ts`. Every showcase reads it via the `usePlayground()` hook; clearing localStorage (or hitting "Reset" in the input panel) restores the default.
