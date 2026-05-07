import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { Button } from "@/components/ui/button";
import { RotateCcw, Target } from "lucide-react";

const BOX_H = 480;
const SHIP_R = 14;
const BULLET_SP = 460;
const FIRE_COOLDOWN = 160;

interface Asteroid {
  id: number;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  r: number;
}
interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
}
interface Spark {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
  color: string;
}

export function WordAsteroidsShowcase() {
  const { text } = usePlayground();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 700, h: BOX_H });
  const [, setTick] = useState(0);
  const [score, setScore] = useState(0);

  const seedWords = useMemo(() => {
    const arr = text
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z]/g, ""))
      .filter((w) => w.length >= 3 && w.length <= 14);
    return arr.length ? arr : ["void", "stars", "drift", "comet", "orbit", "nova"];
  }, [text]);

  const idRef = useRef(0);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const ship = useRef({ x: 350, y: 240, angle: 0 });
  const mouse = useRef({ x: 350, y: 240, in: false });
  const lastFire = useRef(0);
  const firing = useRef(false);
  const lastFrame = useRef(performance.now());

  // resize
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const apply = () => {
      const r = wrap.getBoundingClientRect();
      setSize({ w: r.width, h: BOX_H });
      ship.current.x = r.width / 2;
      ship.current.y = BOX_H / 2;
    };
    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    apply();
    return () => ro.disconnect();
  }, []);

  // seed initial asteroids when sized + on text change
  useEffect(() => {
    asteroidsRef.current = [];
    for (let i = 0; i < 5; i++) {
      const ang = Math.random() * Math.PI * 2;
      const w = seedWords[Math.floor(Math.random() * seedWords.length)];
      asteroidsRef.current.push({
        id: idRef.current++,
        text: w,
        x: Math.random() * size.w,
        y: Math.random() * size.h,
        vx: Math.cos(ang) * 35,
        vy: Math.sin(ang) * 35,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.6,
        r: Math.max(20, w.length * 5),
      });
    }
    setScore(0);
  }, [seedWords, size.w]);

  // game loop
  useEffect(() => {
    let raf = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastFrame.current) / 1000);
      lastFrame.current = now;
      const W = size.w;
      const H = size.h;

      // ship aim
      const dx = mouse.current.x - ship.current.x;
      const dy = mouse.current.y - ship.current.y;
      ship.current.angle = Math.atan2(dy, dx);

      // continuous fire while held
      if (firing.current && now - lastFire.current > FIRE_COOLDOWN) {
        lastFire.current = now;
        bulletsRef.current.push({
          id: idRef.current++,
          x: ship.current.x + Math.cos(ship.current.angle) * (SHIP_R + 4),
          y: ship.current.y + Math.sin(ship.current.angle) * (SHIP_R + 4),
          vx: Math.cos(ship.current.angle) * BULLET_SP,
          vy: Math.sin(ship.current.angle) * BULLET_SP,
          born: now,
        });
      }

      // update asteroids (wrap edges)
      for (const a of asteroidsRef.current) {
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        a.rot += a.vrot * dt;
        if (a.x < -a.r) a.x += W + a.r * 2;
        if (a.x > W + a.r) a.x -= W + a.r * 2;
        if (a.y < -a.r) a.y += H + a.r * 2;
        if (a.y > H + a.r) a.y -= H + a.r * 2;
      }

      // update bullets
      bulletsRef.current = bulletsRef.current.filter((b) => {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        return now - b.born < 1400 && b.x > -10 && b.x < W + 10 && b.y > -10 && b.y < H + 10;
      });

      // collision
      const remB = new Set<number>();
      const newAsteroids: Asteroid[] = [];
      let removedThisFrame = 0;
      for (const a of asteroidsRef.current) {
        let hit = false;
        for (const b of bulletsRef.current) {
          if (remB.has(b.id)) continue;
          const dx2 = b.x - a.x;
          const dy2 = b.y - a.y;
          if (Math.hypot(dx2, dy2) < a.r) {
            hit = true;
            remB.add(b.id);
            // sparks
            for (let k = 0; k < 14; k++) {
              const sa = Math.random() * Math.PI * 2;
              const sp = 50 + Math.random() * 180;
              sparksRef.current.push({
                id: idRef.current++,
                x: a.x,
                y: a.y,
                vx: Math.cos(sa) * sp,
                vy: Math.sin(sa) * sp,
                born: now,
                life: 0.5 + Math.random() * 0.5,
                color: Math.random() > 0.5 ? "#facc15" : "#fb7185",
              });
            }
            // split or destroy
            if (a.text.length > 4) {
              const mid = Math.ceil(a.text.length / 2);
              const left = a.text.slice(0, mid);
              const right = a.text.slice(mid);
              const baseAng = Math.atan2(a.vy, a.vx);
              const sp = Math.hypot(a.vx, a.vy) * 1.15 + 25;
              newAsteroids.push(
                {
                  id: idRef.current++,
                  text: left,
                  x: a.x - 8,
                  y: a.y,
                  vx: Math.cos(baseAng + Math.PI / 3) * sp,
                  vy: Math.sin(baseAng + Math.PI / 3) * sp,
                  rot: a.rot,
                  vrot: (Math.random() - 0.5) * 1.2,
                  r: Math.max(14, left.length * 5),
                },
                {
                  id: idRef.current++,
                  text: right,
                  x: a.x + 8,
                  y: a.y,
                  vx: Math.cos(baseAng - Math.PI / 3) * sp,
                  vy: Math.sin(baseAng - Math.PI / 3) * sp,
                  rot: a.rot,
                  vrot: (Math.random() - 0.5) * 1.2,
                  r: Math.max(14, right.length * 5),
                },
              );
              setScore((s) => s + 5);
            } else {
              setScore((s) => s + 25);
              removedThisFrame++;
            }
            break;
          }
        }
        if (!hit) newAsteroids.push(a);
      }
      asteroidsRef.current = newAsteroids;
      bulletsRef.current = bulletsRef.current.filter((b) => !remB.has(b.id));

      // sparks
      sparksRef.current = sparksRef.current.filter((s) => {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vx *= 0.96;
        s.vy *= 0.96;
        return (now / 1000) - s.born / 1000 < s.life;
      });

      // respawn when empty
      if (asteroidsRef.current.length === 0) {
        for (let i = 0; i < 4; i++) {
          const ang = Math.random() * Math.PI * 2;
          const w = seedWords[Math.floor(Math.random() * seedWords.length)];
          const fromLeft = Math.random() < 0.5;
          asteroidsRef.current.push({
            id: idRef.current++,
            text: w,
            x: fromLeft ? -20 : W + 20,
            y: Math.random() * H,
            vx: Math.cos(ang) * 45,
            vy: Math.sin(ang) * 45,
            rot: Math.random() * Math.PI * 2,
            vrot: (Math.random() - 0.5) * 0.6,
            r: Math.max(20, w.length * 5),
          });
        }
      }

      void removedThisFrame;
      setTick((x) => (x + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [size.w, size.h, seedWords]);

  const onMove = (e: React.PointerEvent) => {
    const r = wrapRef.current!.getBoundingClientRect();
    mouse.current.x = e.clientX - r.left;
    mouse.current.y = e.clientY - r.top;
    mouse.current.in = true;
  };
  const onLeave = () => {
    mouse.current.in = false;
    firing.current = false;
  };
  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    firing.current = true;
  };
  const onUp = () => {
    firing.current = false;
  };

  const restart = () => {
    asteroidsRef.current = [];
    bulletsRef.current = [];
    sparksRef.current = [];
    setScore(0);
    for (let i = 0; i < 5; i++) {
      const ang = Math.random() * Math.PI * 2;
      const w = seedWords[Math.floor(Math.random() * seedWords.length)];
      asteroidsRef.current.push({
        id: idRef.current++,
        text: w,
        x: Math.random() * size.w,
        y: Math.random() * size.h,
        vx: Math.cos(ang) * 35,
        vy: Math.sin(ang) * 35,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.6,
        r: Math.max(20, w.length * 5),
      });
    }
  };

  const stars = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        x: ((i * 113) % 1000) / 1000,
        y: ((i * 67) % 1000) / 1000,
        r: i % 6 === 0 ? 1.2 : 0.5,
        o: 0.1 + (i % 8) * 0.06,
      })),
    [],
  );

  return (
    <ShowcaseCard
      showcaseId="word-asteroids"
      title="Word Asteroids"
      description="Aim with the mouse, click to fire. Long words split in half when struck — keep firing until they shatter."
      controls={
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="tabular-nums text-muted-foreground">
            <Target className="inline w-3 h-3 mr-0.5 text-cyan-500" />
            {score}
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
        onPointerMove={onMove}
        onPointerEnter={onMove}
        onPointerLeave={onLeave}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="relative w-full rounded-lg overflow-hidden cursor-none select-none"
        style={{
          height: BOX_H,
          background: "radial-gradient(ellipse at 50% 50%, #102030 0%, #050a14 60%, #02040a 100%)",
          touchAction: "none",
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" width={size.w} height={size.h}>
          <defs>
            <radialGradient id="wa-bullet">
              <stop offset="0%" stopColor="#fffbe0" />
              <stop offset="60%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
            </radialGradient>
          </defs>
          {stars.map((s, i) => (
            <circle key={i} cx={s.x * size.w} cy={s.y * size.h} r={s.r} fill="#fff" opacity={s.o} />
          ))}

          {/* asteroids */}
          {asteroidsRef.current.map((a) => (
            <g key={a.id} transform={`translate(${a.x} ${a.y}) rotate(${(a.rot * 180) / Math.PI})`}>
              <circle r={a.r} fill="rgba(120,140,180,0.12)" stroke="rgba(180,200,240,0.45)" strokeWidth={1.2} />
              <text
                x={0}
                y={5}
                textAnchor="middle"
                fill="#dbeafe"
                fontFamily="Fraunces, serif"
                fontSize={Math.max(12, a.r * 0.55)}
                fontWeight={700}
                style={{ filter: "drop-shadow(0 0 6px rgba(180,200,240,0.4))" }}
              >
                {a.text}
              </text>
            </g>
          ))}

          {/* bullets */}
          {bulletsRef.current.map((b) => (
            <g key={b.id}>
              <circle cx={b.x} cy={b.y} r={5} fill="url(#wa-bullet)" opacity={0.7} />
              <circle cx={b.x} cy={b.y} r={1.5} fill="#fff" />
            </g>
          ))}

          {/* sparks */}
          {sparksRef.current.map((s) => {
            const age = (performance.now() / 1000) - s.born / 1000;
            const op = Math.max(0, 1 - age / s.life);
            return <circle key={s.id} cx={s.x} cy={s.y} r={1.5} fill={s.color} opacity={op} />;
          })}

          {/* ship */}
          <g transform={`translate(${ship.current.x} ${ship.current.y}) rotate(${(ship.current.angle * 180) / Math.PI})`}>
            <path
              d={`M ${SHIP_R + 4} 0 L -${SHIP_R} -${SHIP_R - 2} L -${SHIP_R / 2} 0 L -${SHIP_R} ${SHIP_R - 2} Z`}
              fill="#0f172a"
              stroke="#22d3ee"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
            {firing.current && (
              <path
                d={`M -${SHIP_R / 2} 0 L -${SHIP_R + 8 + Math.random() * 4} -3 L -${SHIP_R + 12} 0 L -${SHIP_R + 8 + Math.random() * 4} 3 Z`}
                fill="#facc15"
                opacity={0.85}
              />
            )}
          </g>

          {/* crosshair */}
          {mouse.current.in && (
            <g transform={`translate(${mouse.current.x} ${mouse.current.y})`} opacity={0.7}>
              <circle r={10} fill="none" stroke="#22d3ee" strokeWidth={1} />
              <line x1={-14} y1={0} x2={-6} y2={0} stroke="#22d3ee" strokeWidth={1} />
              <line x1={6} y1={0} x2={14} y2={0} stroke="#22d3ee" strokeWidth={1} />
              <line x1={0} y1={-14} x2={0} y2={-6} stroke="#22d3ee" strokeWidth={1} />
              <line x1={0} y1={6} x2={0} y2={14} stroke="#22d3ee" strokeWidth={1} />
            </g>
          )}
        </svg>

        {!mouse.current.in && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-mono uppercase tracking-[0.2em] text-cyan-300/80 bg-black/40 px-3 py-1.5 rounded">
            Aim with mouse · click to fire
          </div>
        )}
      </div>
    </ShowcaseCard>
  );
}
