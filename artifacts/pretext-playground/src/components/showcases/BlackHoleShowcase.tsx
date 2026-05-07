import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

const BOX_H = 480;
const EVENT_HORIZON = 32;
const MAX_ORBIT = 360;

interface Orbiter {
  id: number;
  text: string;
  angle: number;
  radius: number;
  angVel: number;
  size: number;
  consumed: number; // 0..1 fade when crossing horizon
}
interface Particle {
  id: number;
  angle: number;
  radius: number;
  angVel: number;
  size: number;
  life: number;
  born: number;
}
interface Shock {
  id: number;
  born: number;
  cx: number;
  cy: number;
}

export function BlackHoleShowcase() {
  const { text } = usePlayground();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 700, h: BOX_H });
  const [, setTick] = useState(0);
  const [consumedCount, setConsumedCount] = useState(0);

  const wordPool = useMemo(() => {
    const arr = text
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z']/g, ""))
      .filter((w) => w.length >= 2 && w.length <= 14);
    return arr.length ? arr : ["void", "stars", "drift", "horizon", "orbit"];
  }, [text]);

  const idRef = useRef(0);
  const orbiters = useRef<Orbiter[]>([]);
  const particles = useRef<Particle[]>([]);
  const shocks = useRef<Shock[]>([]);
  const lastFrame = useRef(performance.now());
  const lastParticle = useRef(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const apply = () => {
      const r = wrap.getBoundingClientRect();
      setSize({ w: r.width, h: BOX_H });
    };
    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    apply();
    return () => ro.disconnect();
  }, []);

  // seed orbiters
  useEffect(() => {
    orbiters.current = [];
    for (let i = 0; i < Math.min(18, wordPool.length); i++) {
      const w = wordPool[i % wordPool.length];
      orbiters.current.push({
        id: idRef.current++,
        text: w,
        angle: Math.random() * Math.PI * 2,
        radius: 100 + Math.random() * 220,
        angVel: 0.3 + Math.random() * 0.4,
        size: 13 + Math.random() * 6,
        consumed: 0,
      });
    }
    setConsumedCount(0);
  }, [wordPool]);

  useEffect(() => {
    let raf = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastFrame.current) / 1000);
      lastFrame.current = now;
      const cx = size.w / 2;
      const cy = size.h / 2;

      // update orbiters
      for (const o of orbiters.current) {
        // gravity: radius shrinks over time, faster when closer
        const pull = 12 + 600 / Math.max(40, o.radius);
        o.radius -= pull * dt;
        // angular speed grows as radius shrinks (conservation feel)
        const w = o.angVel * (200 / Math.max(40, o.radius));
        o.angle += w * dt;
        if (o.radius < EVENT_HORIZON + 6) {
          o.consumed += dt * 2.2;
        }
      }
      // remove fully consumed; spawn replacements at outer rim
      const survived: Orbiter[] = [];
      let consumedThis = 0;
      for (const o of orbiters.current) {
        if (o.consumed >= 1) {
          consumedThis++;
        } else {
          survived.push(o);
        }
      }
      while (survived.length < Math.min(18, wordPool.length)) {
        const w = wordPool[Math.floor(Math.random() * wordPool.length)];
        survived.push({
          id: idRef.current++,
          text: w,
          angle: Math.random() * Math.PI * 2,
          radius: MAX_ORBIT - Math.random() * 30,
          angVel: 0.3 + Math.random() * 0.35,
          size: 13 + Math.random() * 6,
          consumed: 0,
        });
      }
      orbiters.current = survived;
      if (consumedThis > 0) setConsumedCount((c) => c + consumedThis);

      // shockwaves
      shocks.current = shocks.current.filter((s) => {
        const age = (now - s.born) / 1000;
        if (age > 1.0) return false;
        const radius = age * 480;
        // push orbiters outward if within ring band
        for (const o of orbiters.current) {
          const ox = cx + Math.cos(o.angle) * o.radius;
          const oy = cy + Math.sin(o.angle) * o.radius;
          const d = Math.hypot(ox - s.cx, oy - s.cy);
          if (Math.abs(d - radius) < 28) {
            o.radius = Math.min(MAX_ORBIT, o.radius + 26 * (1 - age));
            o.consumed = Math.max(0, o.consumed - 0.4);
          }
        }
        return true;
      });

      // accretion-disk particles
      if (now - lastParticle.current > 18) {
        lastParticle.current = now;
        for (let i = 0; i < 3; i++) {
          particles.current.push({
            id: idRef.current++,
            angle: Math.random() * Math.PI * 2,
            radius: 60 + Math.random() * 140,
            angVel: 1.4 + Math.random() * 0.7,
            size: 0.8 + Math.random() * 1.6,
            life: 1.4 + Math.random() * 0.6,
            born: now / 1000,
          });
        }
      }
      for (const p of particles.current) {
        p.angle += p.angVel * dt;
        p.radius -= (8 + 220 / Math.max(20, p.radius)) * dt;
      }
      particles.current = particles.current.filter((p) => {
        return now / 1000 - p.born < p.life && p.radius > EVENT_HORIZON - 4;
      });

      setTick((x) => (x + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [size.w, size.h, wordPool]);

  const onClick = (e: React.PointerEvent) => {
    const r = wrapRef.current!.getBoundingClientRect();
    shocks.current.push({
      id: idRef.current++,
      cx: e.clientX - r.left,
      cy: e.clientY - r.top,
      born: performance.now(),
    });
  };

  const restart = () => {
    orbiters.current = [];
    particles.current = [];
    shocks.current = [];
    for (let i = 0; i < Math.min(18, wordPool.length); i++) {
      const w = wordPool[i % wordPool.length];
      orbiters.current.push({
        id: idRef.current++,
        text: w,
        angle: Math.random() * Math.PI * 2,
        radius: 100 + Math.random() * 220,
        angVel: 0.3 + Math.random() * 0.4,
        size: 13 + Math.random() * 6,
        consumed: 0,
      });
    }
    setConsumedCount(0);
  };

  const cx = size.w / 2;
  const cy = size.h / 2;

  return (
    <ShowcaseCard
      showcaseId="black-hole"
      title="Black Hole"
      description="Words orbit a singularity, spiraling inward. Click to send a shockwave that flings them back from the void."
      controls={
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="tabular-nums text-muted-foreground">
            consumed {consumedCount}
          </span>
          <Button size="sm" variant="outline" onClick={restart}>
            <RotateCcw className="w-3 h-3 mr-1.5" />
            Reset
          </Button>
        </div>
      }
    >
      <div
        ref={wrapRef}
        onPointerDown={onClick}
        className="relative w-full rounded-lg overflow-hidden select-none cursor-crosshair"
        style={{
          height: BOX_H,
          background: "radial-gradient(circle at 50% 50%, #1a1030 0%, #0a0518 50%, #02010a 100%)",
          touchAction: "none",
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" width={size.w} height={size.h}>
          <defs>
            <radialGradient id="bh-core" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#000" />
              <stop offset="70%" stopColor="#000" />
              <stop offset="100%" stopColor="#000" stopOpacity={0} />
            </radialGradient>
            <radialGradient id="bh-halo" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.0} />
              <stop offset="35%" stopColor="#fbbf24" stopOpacity={0.0} />
              <stop offset="55%" stopColor="#f97316" stopOpacity={0.55} />
              <stop offset="70%" stopColor="#7c3aed" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
            </radialGradient>
            <filter id="bh-glow"><feGaussianBlur stdDeviation="2" /></filter>
          </defs>

          {/* Halo ring around event horizon */}
          <circle cx={cx} cy={cy} r={120} fill="url(#bh-halo)" filter="url(#bh-glow)" />

          {/* Accretion-disk particles */}
          {particles.current.map((p) => {
            const px = cx + Math.cos(p.angle) * p.radius;
            const py = cy + Math.sin(p.angle) * p.radius * 0.55; // flattened disk
            const t = (performance.now() / 1000) - p.born;
            const op = Math.max(0, 1 - t / p.life);
            const hue = 30 + (p.radius / MAX_ORBIT) * 240;
            return (
              <circle
                key={p.id}
                cx={px}
                cy={py}
                r={p.size}
                fill={`hsl(${hue}, 90%, 65%)`}
                opacity={op}
              />
            );
          })}

          {/* Event horizon (the dark sphere) */}
          <circle cx={cx} cy={cy} r={EVENT_HORIZON} fill="url(#bh-core)" />
          <circle
            cx={cx}
            cy={cy}
            r={EVENT_HORIZON}
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={1}
          />

          {/* Shockwave rings */}
          {shocks.current.map((s) => {
            const age = (performance.now() - s.born) / 1000;
            const radius = age * 480;
            return (
              <circle
                key={s.id}
                cx={s.cx}
                cy={s.cy}
                r={radius}
                fill="none"
                stroke="#22d3ee"
                strokeWidth={2.5}
                opacity={Math.max(0, 1 - age)}
              />
            );
          })}

          {/* Orbiting words */}
          {orbiters.current.map((o) => {
            const x = cx + Math.cos(o.angle) * o.radius;
            const y = cy + Math.sin(o.angle) * o.radius * 0.78;
            const consumed = o.consumed;
            const op = Math.max(0, 1 - consumed);
            const stretch = 1 + consumed * 1.6;
            const hue = 30 + (o.radius / MAX_ORBIT) * 230;
            return (
              <g key={o.id} transform={`translate(${x} ${y}) rotate(${(o.angle * 180) / Math.PI + 90}) scale(${1 / stretch} ${stretch})`}>
                <text
                  textAnchor="middle"
                  fontFamily="Fraunces, serif"
                  fontSize={o.size}
                  fontWeight={600}
                  fill={`hsl(${hue}, 90%, 78%)`}
                  opacity={op}
                  style={{ filter: `drop-shadow(0 0 ${4 + consumed * 8}px hsla(${hue}, 90%, 60%, ${op * 0.8}))` }}
                >
                  {o.text}
                </text>
              </g>
            );
          })}

          {/* Bright rim around the singularity */}
          <circle
            cx={cx}
            cy={cy}
            r={EVENT_HORIZON + 1}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={1.5}
            opacity={0.7}
            filter="url(#bh-glow)"
          />
        </svg>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-mono uppercase tracking-[0.2em] text-violet-200/70 bg-black/40 px-3 py-1.5 rounded pointer-events-none">
          Click to push back the void
        </div>
      </div>
    </ShowcaseCard>
  );
}
