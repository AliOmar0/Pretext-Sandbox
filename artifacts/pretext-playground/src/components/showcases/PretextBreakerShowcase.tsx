import { useEffect, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { Button } from "@/components/ui/button";

interface Brick { x: number; y: number; w: number; h: number; text: string; alive: boolean; hue: number; }

const W = 600;
const H = 360;
const PADDLE_W = 80;
const PADDLE_H = 10;
const BALL_R = 6;

export function PretextBreakerShowcase() {
  const { text } = usePlayground();
  const wrapRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    paddleX: W / 2,
    ballX: W / 2,
    ballY: H - 40,
    vx: 3.2,
    vy: -3.2,
    bricks: [] as Brick[],
    running: false,
    lost: false,
    won: false,
  });
  const [, setTick] = useState(0);

  const init = () => {
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.font = "13px Fraunces, serif";
    const words = text.replace(/\s+/g, " ").trim().split(" ").slice(0, 30);
    const bricks: Brick[] = [];
    const padX = 8;
    const padY = 6;
    let x = padX;
    let y = padX;
    for (let i = 0; i < words.length; i++) {
      const w = ctx.measureText(words[i]).width + 14;
      const h = 22;
      if (x + w > W - padX) { x = padX; y += h + padY; }
      if (y + h > H * 0.4) break;
      bricks.push({ x, y, w, h, text: words[i], alive: true, hue: (i * 47) % 360 });
      x += w + padY;
    }
    stateRef.current.bricks = bricks;
    stateRef.current.ballX = W / 2;
    stateRef.current.ballY = H - 40;
    stateRef.current.vx = 3.2 * (Math.random() > 0.5 ? 1 : -1);
    stateRef.current.vy = -3.2;
    stateRef.current.lost = false;
    stateRef.current.won = false;
    stateRef.current.running = true;
  };

  useEffect(() => {
    init();
    setTick((t) => t + 1);
  }, [text]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const s = stateRef.current;
      if (s.running && !s.lost && !s.won) {
        s.ballX += s.vx;
        s.ballY += s.vy;
        if (s.ballX - BALL_R < 0) { s.ballX = BALL_R; s.vx = Math.abs(s.vx); }
        if (s.ballX + BALL_R > W) { s.ballX = W - BALL_R; s.vx = -Math.abs(s.vx); }
        if (s.ballY - BALL_R < 0) { s.ballY = BALL_R; s.vy = Math.abs(s.vy); }
        if (s.ballY + BALL_R > H) { s.lost = true; s.running = false; }
        const py = H - 24;
        if (
          s.vy > 0 &&
          s.ballY + BALL_R >= py &&
          s.ballY + BALL_R <= py + PADDLE_H + 4 &&
          s.ballX >= s.paddleX - PADDLE_W / 2 - BALL_R &&
          s.ballX <= s.paddleX + PADDLE_W / 2 + BALL_R
        ) {
          s.vy = -Math.abs(s.vy);
          const off = (s.ballX - s.paddleX) / (PADDLE_W / 2);
          s.vx = off * 4.2;
        }
        for (const b of s.bricks) {
          if (!b.alive) continue;
          if (
            s.ballX + BALL_R > b.x &&
            s.ballX - BALL_R < b.x + b.w &&
            s.ballY + BALL_R > b.y &&
            s.ballY - BALL_R < b.y + b.h
          ) {
            b.alive = false;
            const overlapX = Math.min(s.ballX + BALL_R - b.x, b.x + b.w - (s.ballX - BALL_R));
            const overlapY = Math.min(s.ballY + BALL_R - b.y, b.y + b.h - (s.ballY - BALL_R));
            if (overlapX < overlapY) s.vx = -s.vx;
            else s.vy = -s.vy;
            break;
          }
        }
        if (s.bricks.every((b) => !b.alive)) { s.won = true; s.running = false; }
      }
      setTick((t) => (t + 1) % 1000000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onMove = (e: React.PointerEvent) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    const ratio = (e.clientX - r.left) / r.width;
    stateRef.current.paddleX = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, ratio * W));
  };

  const s = stateRef.current;

  return (
    <ShowcaseCard
      showcaseId="pretext-breaker"
      title="Pretext Breaker"
      description="Move your mouse to play. Break every word."
      controls={
        <Button size="sm" variant="outline" onClick={() => { init(); setTick((t) => t + 1); }}>
          Restart
        </Button>
      }
    >
      <div
        ref={wrapRef}
        onPointerMove={onMove}
        className="relative w-full rounded-lg overflow-hidden border border-border cursor-none"
        style={{ aspectRatio: `${W} / ${H}`, background: "#0a0a14" }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
          {s.bricks.map((b, i) =>
            b.alive ? (
              <g key={i}>
                <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={3} fill={`hsl(${b.hue}, 70%, 55%)`} />
                <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 4.5} textAnchor="middle" fontFamily="Fraunces, serif" fontSize={13} fill="#fff">
                  {b.text}
                </text>
              </g>
            ) : null,
          )}
          <rect x={s.paddleX - PADDLE_W / 2} y={H - 24} width={PADDLE_W} height={PADDLE_H} rx={4} fill="hsl(10, 76%, 53%)" />
          <circle cx={s.ballX} cy={s.ballY} r={BALL_R} fill="#fff8d6" />
        </svg>
        {(s.lost || s.won) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white gap-3">
            <p className="font-serif text-2xl">{s.won ? "Cleared!" : "Game over"}</p>
            <Button size="sm" onClick={() => { init(); setTick((t) => t + 1); }}>
              Play again
            </Button>
          </div>
        )}
      </div>
    </ShowcaseCard>
  );
}
