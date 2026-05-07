import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { Button } from "@/components/ui/button";
import { RotateCcw, Heart, Zap } from "lucide-react";

const BOX_H = 480;
const MAX_LIVES = 5;

interface Enemy {
  id: number;
  word: string;
  x: number;
  y: number;
  vy: number;
  typed: number;
  shake: number;
}

interface Laser {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  born: number;
}

interface Burst {
  id: number;
  x: number;
  y: number;
  born: number;
}

export function TypeDefenseShowcase() {
  const { text } = usePlayground();
  const wordPool = useMemo(() => {
    const arr = Array.from(
      new Set(
        text
          .split(/\s+/)
          .map((w) => w.replace(/[^a-zA-Z']/g, ""))
          .filter((w) => w.length >= 2 && w.length <= 12),
      ),
    );
    return arr.length ? arr : ["type", "defend", "void", "stars", "lasers"];
  }, [text]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 700, h: BOX_H });
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [lasers, setLasers] = useState<Laser[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [active, setActive] = useState(false);

  const idRef = useRef(0);
  const targetId = useRef<number | null>(null);
  const lastSpawn = useRef(0);
  const lastFrame = useRef(performance.now());
  const scoreRef = useRef(0);
  scoreRef.current = score;

  // resize
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

  // game loop
  useEffect(() => {
    if (gameOver) return;
    let raf = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastFrame.current) / 1000);
      lastFrame.current = now;

      // spawn
      const interval = Math.max(700, 1900 - scoreRef.current * 4);
      if (now - lastSpawn.current > interval) {
        lastSpawn.current = now;
        const w = wordPool[Math.floor(Math.random() * wordPool.length)];
        const margin = 40 + w.length * 4;
        setEnemies((prev) => [
          ...prev,
          {
            id: idRef.current++,
            word: w,
            x: margin + Math.random() * Math.max(1, size.w - margin * 2),
            y: -10,
            vy: 28 + Math.random() * 18 + scoreRef.current * 0.25,
            typed: 0,
            shake: 0,
          },
        ]);
      }

      // move enemies
      let lost = 0;
      setEnemies((prev) => {
        const next: Enemy[] = [];
        for (const e of prev) {
          const ny = e.y + e.vy * dt;
          if (ny > size.h - 30) {
            lost++;
            if (e.id === targetId.current) targetId.current = null;
            continue;
          }
          next.push({ ...e, y: ny, shake: e.shake * 0.85 });
        }
        return next;
      });
      if (lost > 0) {
        setLives((l) => Math.max(0, l - lost));
        setCombo(0);
      }

      // age lasers + bursts
      setLasers((prev) => prev.filter((l) => now - l.born < 220));
      setBursts((prev) => prev.filter((b) => now - b.born < 500));

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [gameOver, size.w, size.h, wordPool]);

  // Game over watcher
  useEffect(() => {
    if (lives <= 0 && !gameOver) setGameOver(true);
  }, [lives, gameOver]);

  // keyboard handler
  useEffect(() => {
    if (gameOver) return;
    const onKey = (e: KeyboardEvent) => {
      if (!active) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key;
      if (key.length !== 1 || !/[a-zA-Z']/.test(key)) return;
      e.preventDefault();
      const lower = key.toLowerCase();

      setEnemies((prev) => {
        let target = prev.find((en) => en.id === targetId.current) ?? null;
        if (!target) {
          // pick the lowest-on-screen enemy whose first letter matches
          const candidates = prev.filter((en) => en.word[0]?.toLowerCase() === lower);
          if (!candidates.length) return prev;
          target = candidates.reduce((a, b) => (a.y > b.y ? a : b));
          targetId.current = target.id;
        }
        const expected = target.word[target.typed]?.toLowerCase();
        if (expected !== lower) {
          setCombo(0);
          return prev.map((en) =>
            en.id === target!.id ? { ...en, shake: 6 } : en,
          );
        }
        const newTyped = target.typed + 1;
        // laser
        setLasers((ls) => [
          ...ls,
          {
            id: idRef.current++,
            x1: size.w / 2,
            y1: size.h - 30,
            x2: target!.x,
            y2: target!.y + 8,
            born: performance.now(),
          },
        ]);
        if (newTyped >= target.word.length) {
          // destroyed
          setBursts((bs) => [
            ...bs,
            { id: idRef.current++, x: target!.x, y: target!.y + 8, born: performance.now() },
          ]);
          targetId.current = null;
          setScore((s) => s + target!.word.length * 10 + Math.min(50, combo * 2));
          setCombo((c) => c + 1);
          return prev.filter((en) => en.id !== target!.id);
        }
        return prev.map((en) =>
          en.id === target!.id ? { ...en, typed: newTyped } : en,
        );
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, gameOver, size.w, size.h, combo]);

  const restart = () => {
    setEnemies([]);
    setLasers([]);
    setBursts([]);
    setScore(0);
    setLives(MAX_LIVES);
    setCombo(0);
    setGameOver(false);
    targetId.current = null;
    lastSpawn.current = performance.now();
  };

  const stars = useMemo(
    () => Array.from({ length: 80 }, (_, i) => ({
      x: ((i * 97) % 1000) / 1000,
      y: ((i * 73) % 1000) / 1000,
      r: i % 5 === 0 ? 1.4 : 0.6,
      o: 0.1 + (i % 7) * 0.08,
    })),
    [],
  );

  return (
    <ShowcaseCard
      showcaseId="type-defense"
      title="Type Defense"
      description="Words descend from the void. Type them to fire — first letter locks a target."
      controls={
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="tabular-nums text-muted-foreground">
            <Zap className="inline w-3 h-3 mr-0.5 text-amber-500" />
            {score}
          </span>
          {combo > 1 && <span className="tabular-nums text-amber-600">×{combo}</span>}
          <span className="flex items-center gap-0.5">
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <Heart
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < lives ? "text-rose-500 fill-rose-500" : "text-muted-foreground/30"
                }`}
              />
            ))}
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
        tabIndex={0}
        onPointerEnter={() => setActive(true)}
        onPointerLeave={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        onClick={() => wrapRef.current?.focus()}
        className="relative w-full rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-amber-400/60"
        style={{
          height: BOX_H,
          background:
            "radial-gradient(ellipse at 50% 100%, #1a1438 0%, #0a0716 55%, #050309 100%)",
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" width={size.w} height={size.h}>
          {stars.map((s, i) => (
            <circle key={i} cx={s.x * size.w} cy={s.y * size.h} r={s.r} fill="#fff" opacity={s.o} />
          ))}
          {/* lasers */}
          {lasers.map((l) => {
            const op = Math.max(0, 1 - (performance.now() - l.born) / 220);
            return (
              <g key={l.id}>
                <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#facc15" strokeWidth={3} opacity={op * 0.4} strokeLinecap="round" />
                <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#fffbe0" strokeWidth={1.2} opacity={op} strokeLinecap="round" />
              </g>
            );
          })}
          {/* bursts */}
          {bursts.map((b) => {
            const age = (performance.now() - b.born) / 500;
            const r = 6 + age * 40;
            return (
              <circle
                key={b.id}
                cx={b.x}
                cy={b.y}
                r={r}
                fill="none"
                stroke="#facc15"
                strokeWidth={2}
                opacity={Math.max(0, 1 - age)}
              />
            );
          })}
          {/* turret */}
          <g transform={`translate(${size.w / 2} ${size.h - 22})`}>
            <ellipse cx={0} cy={6} rx={36} ry={4} fill="rgba(250,204,21,0.18)" />
            <path d="M -22 4 L -14 -10 L 14 -10 L 22 4 Z" fill="#3a3550" stroke="#facc15" strokeWidth={1.2} />
            <rect x={-3} y={-22} width={6} height={14} rx={2} fill="#facc15" />
            <circle cx={0} cy={-26} r={3} fill="#fffbe0" opacity={active ? 1 : 0.4} />
          </g>
        </svg>

        {/* enemies */}
        {enemies.map((e) => (
          <div
            key={e.id}
            className="absolute font-mono text-base font-semibold select-none whitespace-nowrap"
            style={{
              left: e.x,
              top: e.y,
              transform: `translate(calc(-50% + ${(Math.random() - 0.5) * e.shake}px), 0)`,
              textShadow:
                e.id === targetId.current
                  ? "0 0 14px rgba(250,204,21,0.9), 0 0 4px rgba(250,204,21,0.6)"
                  : "0 0 8px rgba(180,160,255,0.5)",
              padding: e.id === targetId.current ? "2px 8px" : "2px 6px",
              borderRadius: 4,
              background:
                e.id === targetId.current ? "rgba(250,204,21,0.12)" : "transparent",
              border:
                e.id === targetId.current
                  ? "1px solid rgba(250,204,21,0.5)"
                  : "1px solid transparent",
            }}
          >
            <span className="text-amber-400">{e.word.slice(0, e.typed)}</span>
            <span
              className={
                e.id === targetId.current ? "text-white" : "text-violet-200/95"
              }
            >
              {e.word.slice(e.typed)}
            </span>
          </div>
        ))}

        {!active && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-amber-300/80 text-sm font-mono uppercase tracking-[0.2em] bg-black/40 px-4 py-2 rounded">
              Hover here · type to fire
            </p>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#fefaf0] rounded-lg p-6 text-center shadow-2xl">
              <p className="font-serif text-2xl text-foreground">The void wins.</p>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                Final score: {score}
              </p>
              <Button size="sm" className="mt-4" onClick={restart}>
                <RotateCcw className="w-3 h-3 mr-1.5" />
                Play again
              </Button>
            </div>
          </div>
        )}
      </div>
    </ShowcaseCard>
  );
}
