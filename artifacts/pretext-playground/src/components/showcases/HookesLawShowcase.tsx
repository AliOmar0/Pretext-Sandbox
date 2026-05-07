import { useEffect, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { layoutAround, type WordPos } from "@/lib/flow-around";

const FONT = "16px Fraunces, serif";
const LINE_H = 24;
const BALL_R = 28;
const BOX_H = 320;

export function HookesLawShowcase() {
  const { text } = usePlayground();
  const wrapRef = useRef<HTMLDivElement>(null);
  const ball = useRef({ x: 200, y: 120, vx: 3.6, vy: 0, anchor: 200 });
  const dragging = useRef(false);
  const [positions, setPositions] = useState<WordPos[]>([]);
  const [ballPos, setBallPos] = useState({ x: 200, y: 120 });
  const [size, setSize] = useState({ w: 600, h: BOX_H });

  const words = text.replace(/\s+/g, " ").trim().split(" ").slice(0, 90);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => {
      const r = wrap.getBoundingClientRect();
      setSize({ w: r.width, h: BOX_H });
    });
    ro.observe(wrap);
    const r = wrap.getBoundingClientRect();
    setSize({ w: r.width, h: BOX_H });
    ball.current.anchor = r.width / 2;
    ball.current.x = r.width / 2;
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    const k = 0.04;
    const damping = 0.985;
    const gravity = 0.18;
    const loop = () => {
      const b = ball.current;
      if (!dragging.current) {
        const fx = -k * (b.x - b.anchor);
        b.vx += fx;
        b.vy += gravity;
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= damping;
        b.vy *= damping;
        if (b.y + BALL_R > BOX_H) {
          b.y = BOX_H - BALL_R;
          b.vy *= -0.7;
        }
        if (b.y - BALL_R < 0) {
          b.y = BALL_R;
          b.vy *= -0.7;
        }
      }
      setBallPos({ x: b.x, y: b.y });
      const obs = {
        x: b.x - BALL_R - 4,
        y: b.y - BALL_R - 2,
        w: BALL_R * 2 + 8,
        h: BALL_R * 2 + 4,
      };
      setPositions(
        layoutAround(words, size.w, size.h, LINE_H, FONT, obs),
      );
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [words.join(" "), size.w, size.h]);

  const onPointerDown = (e: React.PointerEvent) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    wrap.setPointerCapture(e.pointerId);
    dragging.current = true;
    const r = wrap.getBoundingClientRect();
    ball.current.x = e.clientX - r.left;
    ball.current.y = e.clientY - r.top;
    ball.current.vx = 0;
    ball.current.vy = 0;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    ball.current.x = Math.max(BALL_R, Math.min(r.width - BALL_R, e.clientX - r.left));
    ball.current.y = Math.max(BALL_R, Math.min(BOX_H - BALL_R, e.clientY - r.top));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const wrap = wrapRef.current;
    if (wrap) wrap.releasePointerCapture(e.pointerId);
    dragging.current = false;
    ball.current.vx = (ball.current.anchor - ball.current.x) * -0.05;
    ball.current.vy = -2;
  };

  return (
    <ShowcaseCard
      showcaseId="hookes-law"
      title="Hooke's Law"
      description="Drag the ball, let it spring. Text reflows around the live simulation."
    >
      <div
        ref={wrapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative w-full bg-white rounded-lg overflow-hidden border border-border cursor-grab active:cursor-grabbing select-none"
        style={{ height: BOX_H }}
      >
        <svg className="absolute inset-0 pointer-events-none" width={size.w} height={BOX_H}>
          <path
            d={`M ${ball.current.anchor} 0 ${zigzag(ball.current.anchor, 0, ballPos.x, ballPos.y - BALL_R)}`}
            stroke="hsl(10, 76%, 53%)"
            strokeWidth={2}
            fill="none"
          />
        </svg>
        {positions.map((p, i) => (
          <span
            key={i}
            className="absolute font-serif text-base text-foreground/85"
            style={{
              transform: `translate(${p.x}px, ${p.y}px)`,
              willChange: "transform",
            }}
          >
            {p.text}
          </span>
        ))}
        <div
          className="absolute rounded-full shadow-lg pointer-events-none"
          style={{
            width: BALL_R * 2,
            height: BALL_R * 2,
            transform: `translate(${ballPos.x - BALL_R}px, ${ballPos.y - BALL_R}px)`,
            background:
              "radial-gradient(circle at 35% 30%, #fff 0%, hsl(10, 76%, 53%) 55%, hsl(10, 60%, 35%) 100%)",
            willChange: "transform",
          }}
        />
      </div>
    </ShowcaseCard>
  );
}

function zigzag(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const segs = Math.max(6, Math.floor(len / 6));
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  let d = "";
  for (let i = 1; i <= segs; i++) {
    const t = i / segs;
    const off = i % 2 === 0 ? 4 : -4;
    const xx = x1 + dx * t + px * off;
    const yy = y1 + dy * t + py * off;
    d += ` L ${xx.toFixed(1)} ${yy.toFixed(1)}`;
  }
  return d;
}
