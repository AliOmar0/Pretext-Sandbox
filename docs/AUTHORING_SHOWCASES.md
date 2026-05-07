# Authoring a new showcase

A showcase is a self-contained React component that consumes the playground's shared text and renders some kind of visual treatment of it. Adding one is a three-step process.

## 1. Create the component

Showcase files live in `artifacts/pretext-playground/src/components/showcases/`. Use a single default `*Showcase.tsx` file per piece.

The minimum scaffold:

```tsx
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

export function MyEffectShowcase() {
  const { text } = usePlayground();
  return (
    <ShowcaseCard
      showcaseId="my-effect"
      title="My Effect"
      description="One sentence that describes what the user sees."
    >
      {/* Your visualization goes here. */}
      <div className="text-2xl font-serif">{text}</div>
    </ShowcaseCard>
  );
}
```

`ShowcaseCard` provides the framed container, header, "Open" link to the dedicated page, and a slot for `controls` (reset buttons, score readouts, etc.). If you pass `showcaseId`, the link to `/showcase/<id>` appears automatically.

## 2. Register it

Add the showcase to `artifacts/pretext-playground/src/lib/showcase-registry.tsx`:

```tsx
import { MyEffectShowcase } from "@/components/showcases/MyEffectShowcase";

export const SHOWCASES: ShowcaseEntry[] = [
  // ... existing entries
  { id: "my-effect", title: "My Effect", group: "originals", component: MyEffectShowcase },
];
```

The `id` becomes the URL slug (`/showcase/my-effect`) and must be unique. The `group` is either `community` or `originals` and controls which section the card appears under on the home grid.

## 3. Verify

```bash
pnpm --filter @workspace/pretext-playground run typecheck
pnpm --filter @workspace/pretext-playground run dev
```

Visit `/` to see the new card in its group, or `/showcase/my-effect` for the standalone page.

---

## Patterns used across the codebase

Reading existing showcases is the fastest way to learn the house style. A few conventions worth knowing:

### Game-loop pattern with refs

For animations that update at 60 FPS, putting all the state in React triggers far too many re-renders. The pattern used in `IlluminatedDragonShowcase`, `WordAsteroidsShowcase`, and `BlackHoleShowcase` is:

1. Hold game state in `useRef` arrays (positions, velocities, particles).
2. Run a single `requestAnimationFrame` loop that mutates the refs.
3. Call `setTick((x) => (x + 1) % 1_000_000)` once per frame to nudge React to re-render.
4. Render JSX directly from the refs (`ref.current.map(...)`).

Reserve actual `useState` for "slow" things the user cares about: score, lives, game-over flag.

### Resize handling

Most showcases use a `ResizeObserver` on a wrapper div to track its rendered size and feed that into a `viewBox`-based SVG or to size a canvas's backing buffer (`canvas.width = clientWidth * devicePixelRatio`). See `WebIsInterestingAgainShowcase` for the canonical pattern.

### Cursor + keyboard activation

For showcases that listen on `window` for keyboard input (`TypeDefenseShowcase`, `WordSnakeShowcase`, `LetterTetrisShowcase`), gate the listener behind an `active` flag set on `pointerEnter` / `pointerLeave` and `focus` / `blur`, plus `tabIndex={0}` and a click-to-focus handler on the wrapper. This prevents typing in the home grid from triggering every keyboard-driven game at once.

### Text layout helpers

`lib/flow-around.ts` exports `layoutAround()` for laying out words around moving obstacles (used by Hooke's Law, Magical Time, and the Illuminated Dragon). The function accepts either a single obstacle or an array; the array form attempts to "jump past" the first hit before wrapping the line.

### Palette & typography

- Body text and headlines use **Fraunces** (already loaded globally).
- The primary accent is `hsl(10 76% 53%)` (warm orange).
- Game-style showcases lean on darker space-y backdrops with vivid accent colours; ambient ones stay on the warm-paper palette.
- Avoid emoji in any rendered output — typography is the point.

### Source-text usage

Always derive what you render from `usePlayground().text` so the user's edits show up live. Common approaches:

- Whole text (`{text}`)
- Words: `text.split(/\s+/).filter(Boolean)`
- Letters only: `text.replace(/[^a-zA-Z]/g, "")`
- First clause as a headline: see `WebIsInterestingAgainShowcase`'s `useMemo` block.

If your effect has a pool of items (asteroids, snake pellets, etc.), keep a `useMemo` that derives that pool from `text` so changing the input regenerates it.

### Accessibility

The showcases are intentionally visual, but the basics still apply:

- Wrappers that capture keyboard or pointer should have `tabIndex={0}`.
- Use `aria-label` on icon-only controls.
- Hint overlays ("hover here · type to fire") should be visible on first load and disappear once the user engages.

---

## Anatomy of `ShowcaseCard`

```tsx
<ShowcaseCard
  showcaseId="my-effect"            // optional — adds the "Open" link
  title="My Effect"
  description="What the user sees."
  controls={ <Button>Reset</Button> } // optional — header right-side slot
>
  {/* children */}
</ShowcaseCard>
```

The card has a built-in entrance animation (framer-motion) that triggers when the card scrolls into view on the home grid.

---

## Performance checklist

Before merging a new showcase:

- [ ] Animation runs at a steady 60 FPS in the dev build (Chrome perf monitor is fine).
- [ ] `pnpm --filter @workspace/pretext-playground run typecheck` passes.
- [ ] No `console.log` left in the render loop.
- [ ] Any added libraries are declared in `artifacts/pretext-playground/package.json` (most showcases need none — vanilla canvas + SVG is plenty).
- [ ] The standalone `/showcase/<id>` page renders correctly with a wide viewport and a narrow one.
