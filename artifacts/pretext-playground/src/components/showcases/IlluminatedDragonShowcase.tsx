import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { layoutAround, type Obstacle } from "@/lib/flow-around";

const FONT = "16px Fraunces, serif";
const LINE_H = 26;
const BOX_H = 420;
const SEG_COUNT = 11;
const LINK = 13;

interface Seg { x: number; y: number; r: number }
interface FireParticle {
  id: number;
  born: number;
  // position + velocity in pixels & px/sec
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  ember: boolean;
  life: number; // total seconds before dying
}

export function IlluminatedDragonShowcase() {
  const { text } = usePlayground();
  const wrapRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState({ w: 700, h: BOX_H });
  const [hovering, setHovering] = useState(false);
  const [, setTick] = useState(0);

  const words = useMemo(
    () => text.replace(/\s+/g, " ").trim().split(" "),
    [text],
  );

  // Mutable refs for animation state
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
  const breathing = useRef(false);
  const blink = useRef(1);
  const lastBlink = useRef(0);
  const lastFrame = useRef(performance.now());

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
      const dt = Math.min(0.05, (now - lastFrame.current) / 1000);
      lastFrame.current = now;

      // Steer head toward target
      const h = head.current;
      const ease = hovering ? 0.18 : 0.04;
      h.x += (target.current.x - h.x) * ease;
      h.y += (target.current.y - h.y) * ease;
      const ddx = target.current.x - h.x;
      const ddy = target.current.y - h.y;
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

      // Blink
      if (now - lastBlink.current > 2800) {
        blink.current = 0;
        if (now - lastBlink.current > 2940) {
          blink.current = 1;
          lastBlink.current = now;
        }
      }

      // Spawn fire while breathing (mouse held)
      if (breathing.current && now - lastFire.current > 28) {
        lastFire.current = now;
        const speed = 280 + Math.random() * 140;
        const spread = (Math.random() - 0.5) * 0.45;
        const ang = h.dir + spread;
        const ox = h.x + Math.cos(h.dir) * 22;
        const oy = h.y + Math.sin(h.dir) * 22;
        fire.current.push({
          id: fireId.current++,
          born: t,
          x: ox,
          y: oy,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          scale: 0.7 + Math.random() * 0.7,
          ember: Math.random() > 0.78,
          life: 0.9 + Math.random() * 0.3,
        });
      }

      // Integrate fire
      for (const f of fire.current) {
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        // mild upward drift + drag
        f.vy -= 60 * dt;
        f.vx *= 0.985;
        f.vy *= 0.985;
      }
      fire.current = fire.current.filter((f) => t - f.born < f.life);

      setTick((x) => (x + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [hovering]);

  // Build obstacles: dragon body + each fire particle (as a small box).
  // Recomputed every animation frame via the tick state below.
  const obstacles: Obstacle[] = (() => {
    const list: Obstacle[] = [];

    // Dragon body — single bbox covering head + first 5 thick segments
    const pts = [{ x: head.current.x, y: head.current.y }, ...segs.current.slice(0, 5)];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of pts) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
    const pad = 22;
    list.push({
      x: Math.max(0, minX - pad),
      y: Math.max(0, minY - pad),
      w: maxX - minX + pad * 2,
      h: maxY - minY + pad * 2,
    });

    // Fire — each particle as a small obstacle (text reflows around the projectile)
    const t = performance.now() / 1000;
    for (const f of fire.current) {
      const age = t - f.born;
      const lifeFrac = age / f.life;
      const r = (1 - lifeFrac) * 16 * f.scale + 4;
      list.push({
        x: f.x - r - 2,
        y: f.y - r - 2,
        w: r * 2 + 4,
        h: r * 2 + 4,
      });
    }
    return list;
  })();

  const layout = layoutAround(
    words,
    size.w - 16,
    size.h - 16,
    LINE_H,
    FONT,
    obstacles,
  ).map((p) => ({ ...p, x: p.x + 8, y: p.y + 8 }));

  // Pointer handlers
  const onMove = (e: React.PointerEvent) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    target.current.x = e.clientX - r.left;
    target.current.y = e.clientY - r.top;
    setHovering(true);
  };
  const onLeave = () => {
    setHovering(false);
    breathing.current = false;
  };
  const onDown = (e: React.PointerEvent) => {
    const wrap = wrapRef.current;
    if (wrap) wrap.setPointerCapture(e.pointerId);
    breathing.current = true;
  };
  const onUp = (e: React.PointerEvent) => {
    const wrap = wrapRef.current;
    if (wrap) {
      try { wrap.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    }
    breathing.current = false;
  };

  const h = head.current;

  return (
    <ShowcaseCard
      showcaseId="illuminated-dragon"
      title="Illuminated Dragon"
      description="Move your mouse to steer the dragon. Click and hold to breathe fire — the text scatters from both."
    >
      <div
        ref={wrapRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerEnter={() => setHovering(true)}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="relative w-full rounded-lg overflow-hidden cursor-none select-none"
        style={{
          height: BOX_H,
          background:
            "radial-gradient(ellipse at 50% 30%, #f6ecd3 0%, #ecdcb3 60%, #d8c089 100%)",
          touchAction: "none",
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
        {layout.map((p, i) => (
          <span
            key={i}
            className="absolute font-serif text-base text-[#3a1a08]"
            style={{ left: p.x, top: p.y, willChange: "transform" }}
          >
            {p.text}
          </span>
        ))}

        {/* Dragon + Fire SVG overlay */}
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

          {/* Body — back to front */}
          {[...segs.current].slice().reverse().map((s, ridx) => {
            const i = segs.current.length - 1 - ridx;
            return (
              <g key={`seg-${i}`}>
                <circle cx={s.x} cy={s.y} r={s.r} fill="url(#dgVerm)" stroke="#2a0608" strokeWidth={1.2} />
                <ellipse cx={s.x} cy={s.y + s.r * 0.45} rx={s.r * 0.7} ry={s.r * 0.25} fill="#e8b94a" opacity={0.55} />
                {i > 0 && i < segs.current.length - 1 && (
                  <circle cx={s.x} cy={s.y - s.r * 0.7} r={2.4} fill="#e8b94a" />
                )}
              </g>
            );
          })}

          {/* Head */}
          <g transform={`translate(${h.x} ${h.y}) rotate(${(h.dir * 180) / Math.PI})`}>
            <path d="M -8 -10 L -14 -22 L -2 -14 Z" fill="#e8b94a" stroke="#2a0608" strokeWidth={0.8} />
            <path d="M 2 -12 L 4 -24 L 10 -12 Z" fill="#f1d27a" stroke="#2a0608" strokeWidth={0.8} />
            <path
              d="M -14 -10 Q 6 -14 22 -6 Q 28 0 22 8 Q 6 14 -8 12 Q -18 8 -18 0 Q -20 -6 -14 -10 Z"
              fill="url(#dgVerm)"
              stroke="#2a0608"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
            <path
              d="M 8 4 Q 18 8 24 0 L 22 4 Q 16 8 10 8 Z"
              fill="#3a0a08"
              stroke="#2a0608"
              strokeWidth={0.8}
            />
            <path d="M 14 6 L 15 9 L 17 6 Z" fill="#fff8d6" />
            <ellipse cx={20} cy={-2} rx={1.4} ry={0.9} fill="#2a0608" />
            <ellipse cx={4} cy={-3} rx={4.5} ry={3.5} fill="#fff8d6" stroke="#2a0608" strokeWidth={0.8} />
            <ellipse cx={4.5} cy={-3} rx={1.8} ry={3 * blink.current} fill="#e8b94a" />
            <ellipse cx={4.5} cy={-3} rx={0.7} ry={2.6 * blink.current} fill="#2a0608" />
          </g>

          {/* Fire projectiles */}
          {fire.current.map((f) => {
            const t = performance.now() / 1000;
            const age = t - f.born;
            const lifeFrac = age / f.life;
            if (lifeFrac < 0 || lifeFrac > 1) return null;
            const r = (1 - lifeFrac) * 16 * f.scale + 4;
            const opacity = Math.max(0, 1 - lifeFrac);
            return (
              <circle
                key={f.id}
                cx={f.x}
                cy={f.y}
                r={r}
                fill={f.ember ? "url(#dgEmber)" : "url(#dgFlame)"}
                opacity={opacity}
                filter={lifeFrac > 0.4 ? "url(#dgBlur)" : undefined}
              />
            );
          })}
        </svg>

        {!hovering && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-medium tracking-wide uppercase text-foreground/60 bg-white/60 backdrop-blur px-3 py-1.5 rounded-full pointer-events-none">
            Move your mouse · click to breathe fire
          </div>
        )}
      </div>
    </ShowcaseCard>
  );
}

function segRadius(i: number) {
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
