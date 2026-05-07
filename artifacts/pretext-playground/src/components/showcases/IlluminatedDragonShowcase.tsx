import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { Button } from "@/components/ui/button";
import { layoutAround } from "@/lib/flow-around";
import { Flame, RotateCcw } from "lucide-react";

const FONT = "16px Fraunces, serif";
const LINE_H = 26;
const BOX_H = 420;
const SEG_COUNT = 11;
const LINK = 13;
const FIRE_RANGE = 130;
const FIRE_HALF_ANGLE = Math.PI / 7; // ~25.7°

interface Seg { x: number; y: number; r: number }
interface Burning { idx: number; text: string; x: number; y: number; w: number; born: number }
interface FireParticle { id: number; born: number; angle: number; speed: number; scale: number; ember: boolean }

export function IlluminatedDragonShowcase() {
  const { text } = usePlayground();
  const wrapRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState({ w: 700, h: BOX_H });
  const [burnedSet, setBurnedSet] = useState<Set<number>>(new Set());
  const [burning, setBurning] = useState<Burning[]>([]);
  const [hovering, setHovering] = useState(false);
  const [tick, setTick] = useState(0);

  // Reset burned set when source text changes
  const words = useMemo(
    () => text.replace(/\s+/g, " ").trim().split(" "),
    [text],
  );
  useEffect(() => {
    setBurnedSet(new Set());
    setBurning([]);
  }, [words.join(" ")]);

  // Mutable refs (avoid React re-render storms)
  const head = useRef({ x: 200, y: 60, dir: 0 });
  const target = useRef({ x: 200, y: 60 });
  const segs = useRef<Seg[]>(
    Array.from({ length: SEG_COUNT }, (_, i) => ({
      x: 200 - i * LINK,
      y: 60,
      r: segRadius(i),
    })),
  );
  const fire = useRef<FireParticle[]>([]);
  const fireId = useRef(0);
  const lastFire = useRef(0);
  const blink = useRef(1);
  const lastBlink = useRef(0);
  const layoutCacheRef = useRef<{ idx: number; text: string; x: number; y: number; w: number }[]>([]);

  // Resize observer
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const r = wrap.getBoundingClientRect();
      setSize({ w: r.width, h: BOX_H });
      target.current.x = r.width / 2;
      target.current.y = BOX_H * 0.4;
    };
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    measure();
    return () => ro.disconnect();
  }, []);

  // Animation loop
  useEffect(() => {
    let raf = 0;
    const loop = (now: number) => {
      const t = now / 1000;

      // Steer head toward target with easing
      const h = head.current;
      const tgt = target.current;
      const ease = hovering ? 0.18 : 0.04;
      h.x += (tgt.x - h.x) * ease;
      h.y += (tgt.y - h.y) * ease;
      // Direction = vector toward target (so dragon faces motion even at rest)
      const ddx = tgt.x - h.x;
      const ddy = tgt.y - h.y;
      if (Math.hypot(ddx, ddy) > 1) {
        h.dir = h.dir + angleDelta(h.dir, Math.atan2(ddy, ddx)) * 0.2;
      }

      // Chain follow
      let prev = { x: h.x, y: h.y };
      for (let i = 0; i < segs.current.length; i++) {
        const s = segs.current[i];
        const dx = s.x - prev.x;
        const dy = s.y - prev.y;
        const d = Math.hypot(dx, dy) || 1;
        const ratio = LINK / d;
        s.x = prev.x + dx * ratio;
        s.y = prev.y + dy * ratio;
        prev = { x: s.x, y: s.y };
      }

      // Blink occasionally
      if (now - lastBlink.current > 2800) {
        blink.current = 0;
        if (now - lastBlink.current > 2940) {
          blink.current = 1;
          lastBlink.current = now;
        }
      }

      // Spawn fire when hovering and breathing
      if (hovering && now - lastFire.current > 32) {
        lastFire.current = now;
        fire.current.push({
          id: fireId.current++,
          born: t,
          angle: (Math.random() - 0.5) * FIRE_HALF_ANGLE * 1.4,
          speed: 90 + Math.random() * 80,
          scale: 0.65 + Math.random() * 0.7,
          ember: Math.random() > 0.78,
        });
      }
      // Cull old fire
      fire.current = fire.current.filter((f) => t - f.born < 1.0);

      // Hit-test alive words against fire cone
      if (hovering && layoutCacheRef.current.length) {
        const ox = h.x + Math.cos(h.dir) * 22;
        const oy = h.y + Math.sin(h.dir) * 22;
        const ignite: Burning[] = [];
        for (const wp of layoutCacheRef.current) {
          if (burnedSet.has(wp.idx)) continue;
          // word center in obstacle-local coords; convert to absolute pixels:
          // layout positions are already local to container (0,0)
          const cx = wp.x + wp.w / 2;
          const cy = wp.y + LINE_H / 2;
          const dx = cx - ox;
          const dy = cy - oy;
          const dist = Math.hypot(dx, dy);
          if (dist > FIRE_RANGE) continue;
          const ang = Math.atan2(dy, dx);
          const diff = Math.abs(angleDelta(h.dir, ang));
          if (diff < FIRE_HALF_ANGLE) {
            ignite.push({ idx: wp.idx, text: wp.text, x: wp.x, y: wp.y, w: wp.w, born: t });
          }
        }
        if (ignite.length) {
          setBurnedSet((prev) => {
            const next = new Set(prev);
            ignite.forEach((b) => next.add(b.idx));
            return next;
          });
          setBurning((prev) => [...prev, ...ignite]);
        }
      }

      // Cull finished burns (after 0.9s)
      if (burning.length) {
        const stillBurning = burning.filter((b) => t - b.born < 0.9);
        if (stillBurning.length !== burning.length) setBurning(stillBurning);
      }

      setTick((x) => (x + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [hovering, burnedSet, burning]);

  // Layout text around the dragon's bounding box (head + first few thick segments)
  const aliveList = useMemo(
    () => words.map((w, i) => ({ text: w, idx: i })).filter((w) => !burnedSet.has(w.idx)),
    [words, burnedSet],
  );

  const obstacle = useMemo(() => {
    // Cover head + first 4 thick body segments — small bounding box that text wraps around
    const pts = [{ x: head.current.x, y: head.current.y }, ...segs.current.slice(0, 5)];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of pts) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
    const pad = 22;
    return {
      x: Math.max(0, minX - pad),
      y: Math.max(0, minY - pad),
      w: maxX - minX + pad * 2,
      h: maxY - minY + pad * 2,
    };
    // Recompute every tick (head moves)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const layout = useMemo(() => {
    const positions = layoutAround(
      aliveList.map((a) => a.text),
      size.w - 16,
      size.h - 16,
      LINE_H,
      FONT,
      obstacle,
    );
    const out = positions.map((p, i) => ({
      idx: aliveList[i].idx,
      text: p.text,
      x: p.x + 8,
      y: p.y + 8,
      w: p.w,
    }));
    layoutCacheRef.current = out;
    return out;
  }, [aliveList, size.w, size.h, obstacle]);

  // Mouse handlers
  const onMove = (e: React.PointerEvent) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    target.current.x = e.clientX - r.left;
    target.current.y = e.clientY - r.top;
    setHovering(true);
  };
  const onLeave = () => setHovering(false);

  const restoreAll = () => {
    setBurnedSet(new Set());
    setBurning([]);
  };

  const score = burnedSet.size;
  const total = words.length;
  const h = head.current;

  return (
    <ShowcaseCard
      showcaseId="illuminated-dragon"
      title="Illuminated Dragon"
      description="Move your mouse — the dragon hunts your words and burns them to ash."
      controls={
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground tabular-nums">
            <Flame className="inline w-3.5 h-3.5 mr-1 -mt-0.5 text-primary" />
            {score} / {total}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={restoreAll}
            disabled={score === 0 && burning.length === 0}
          >
            <RotateCcw className="w-3 h-3 mr-1.5" /> Restore
          </Button>
        </div>
      }
    >
      <div
        ref={wrapRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerEnter={() => setHovering(true)}
        className="relative w-full rounded-lg overflow-hidden cursor-none select-none"
        style={{
          height: BOX_H,
          background:
            "radial-gradient(ellipse at 50% 30%, #f6ecd3 0%, #ecdcb3 60%, #d8c089 100%)",
        }}
      >
        {/* Parchment grain */}
        <div
          className="absolute inset-0 opacity-25 mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0 0.08  0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />

        {/* Words */}
        {layout.map((p) => (
          <span
            key={p.idx}
            className="absolute font-serif text-base text-[#3a1a08]"
            style={{
              left: p.x,
              top: p.y,
              willChange: "transform",
            }}
          >
            {p.text}
          </span>
        ))}

        {/* Burning words (briefly visible, embered & fading) */}
        {burning.map((b) => {
          const age = (performance.now() / 1000) - b.born;
          const alpha = Math.max(0, 1 - age / 0.9);
          const lift = -age * 14;
          return (
            <span
              key={`brn-${b.idx}`}
              className="absolute font-serif text-base pointer-events-none"
              style={{
                left: b.x,
                top: b.y + lift,
                color: `rgba(${214 + age * 40}, ${69 - age * 60}, ${31 - age * 30}, ${alpha})`,
                textShadow: `0 0 ${4 + age * 12}px rgba(255,160,40,${alpha})`,
                filter: `blur(${age * 1.5}px)`,
              }}
            >
              {b.text}
            </span>
          );
        })}

        {/* Dragon SVG overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          width={size.w}
          height={BOX_H}
        >
          <defs>
            <linearGradient id="dgVerm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d6451f" />
              <stop offset="60%" stopColor="#a82218" />
              <stop offset="100%" stopColor="#6e0f0d" />
            </linearGradient>
            <radialGradient id="dgFlame" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#fff4c2" />
              <stop offset="35%" stopColor="#ffb43d" />
              <stop offset="75%" stopColor="#d6451f" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#6e0f0d" stopOpacity={0} />
            </radialGradient>
            <radialGradient id="dgEmber" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#fff8d6" />
              <stop offset="60%" stopColor="#f1c14a" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#f1c14a" stopOpacity={0} />
            </radialGradient>
            <filter id="dgBlur"><feGaussianBlur stdDeviation="2.5" /></filter>
          </defs>

          {/* Body segments — back-to-front so head is on top */}
          {[...segs.current].slice().reverse().map((s, ridx) => {
            const i = segs.current.length - 1 - ridx;
            return (
              <g key={`seg-${i}`}>
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={s.r}
                  fill="url(#dgVerm)"
                  stroke="#2a0608"
                  strokeWidth={1.2}
                />
                {/* belly highlight */}
                <ellipse
                  cx={s.x}
                  cy={s.y + s.r * 0.45}
                  rx={s.r * 0.7}
                  ry={s.r * 0.25}
                  fill="#e8b94a"
                  opacity={0.55}
                />
                {/* spine spike */}
                {i > 0 && i < segs.current.length - 1 && (
                  <circle cx={s.x} cy={s.y - s.r * 0.7} r={2.4} fill="#e8b94a" />
                )}
              </g>
            );
          })}

          {/* Head */}
          <g transform={`translate(${h.x} ${h.y}) rotate(${(h.dir * 180) / Math.PI})`}>
            {/* horns */}
            <path d="M -8 -10 L -14 -22 L -2 -14 Z" fill="#e8b94a" stroke="#2a0608" strokeWidth={0.8} />
            <path d="M 2 -12 L 4 -24 L 10 -12 Z" fill="#f1d27a" stroke="#2a0608" strokeWidth={0.8} />
            {/* head silhouette */}
            <path
              d="M -14 -10
                 Q 6 -14 22 -6
                 Q 28 0 22 8
                 Q 6 14 -8 12
                 Q -18 8 -18 0
                 Q -20 -6 -14 -10 Z"
              fill="url(#dgVerm)"
              stroke="#2a0608"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
            {/* mouth open */}
            <path
              d="M 8 4 Q 18 8 24 0 L 22 4 Q 16 8 10 8 Z"
              fill="#3a0a08"
              stroke="#2a0608"
              strokeWidth={0.8}
            />
            {/* fang */}
            <path d="M 14 6 L 15 9 L 17 6 Z" fill="#fff8d6" />
            {/* nostril */}
            <ellipse cx={20} cy={-2} rx={1.4} ry={0.9} fill="#2a0608" />
            {/* eye */}
            <ellipse cx={4} cy={-3} rx={4.5} ry={3.5} fill="#fff8d6" stroke="#2a0608" strokeWidth={0.8} />
            <ellipse cx={4.5} cy={-3} rx={1.8} ry={3 * blink.current} fill="#e8b94a" />
            <ellipse cx={4.5} cy={-3} rx={0.7} ry={2.6 * blink.current} fill="#2a0608" />
          </g>

          {/* Fire particles */}
          {fire.current.map((f) => {
            const t = performance.now() / 1000;
            const age = t - f.born;
            if (age < 0 || age > 1) return null;
            const ox = h.x + Math.cos(h.dir) * 22;
            const oy = h.y + Math.sin(h.dir) * 22;
            const dist = age * f.speed;
            const fx = ox + Math.cos(h.dir + f.angle) * dist;
            const fy = oy + Math.sin(h.dir + f.angle) * dist;
            const r = (1 - age) * 14 * f.scale + 2;
            return (
              <circle
                key={f.id}
                cx={fx}
                cy={fy}
                r={r}
                fill={f.ember ? "url(#dgEmber)" : "url(#dgFlame)"}
                opacity={Math.max(0, 1 - age)}
                filter={age > 0.4 ? "url(#dgBlur)" : undefined}
              />
            );
          })}
        </svg>

        {!hovering && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-medium tracking-wide uppercase text-foreground/60 bg-white/60 backdrop-blur px-3 py-1.5 rounded-full pointer-events-none">
            Move your mouse to wake the dragon
          </div>
        )}

        {score === total && total > 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur px-6 py-4 rounded-lg shadow-lg text-center pointer-events-auto">
              <p className="font-serif text-xl text-foreground">Nothing left to read.</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={restoreAll}>
                <RotateCcw className="w-3 h-3 mr-1.5" /> Restore the manuscript
              </Button>
            </div>
          </div>
        )}
      </div>
    </ShowcaseCard>
  );
}

function segRadius(i: number) {
  // Thick at the front (i=0) tapering to tail
  if (i < 2) return 13 - i * 0.5;
  if (i < 5) return 12 - (i - 2) * 1.2;
  return Math.max(3, 9 - (i - 5) * 1.4);
}

function angleDelta(a: number, b: number) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
