import { useEffect, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

interface Ripple { x: number; y: number; t: number; }
interface Char { ch: string; x: number; y: number; }

const FONT_SIZE = 18;
const LINE_H = 26;
const BOX_H = 300;

export function WaterRippleShowcase() {
  const { text } = usePlayground();
  const wrapRef = useRef<HTMLDivElement>(null);
  const ripples = useRef<Ripple[]>([]);
  const [chars, setChars] = useState<Char[]>([]);
  const [, setTick] = useState(0);
  const [size, setSize] = useState({ w: 600 });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    setSize({ w: r.width });
  }, []);

  useEffect(() => {
    const w = size.w;
    if (w === 0) return;
    const c = document.createElement("canvas").getContext("2d")!;
    c.font = `${FONT_SIZE}px Fraunces, serif`;
    const words = text.replace(/\s+/g, " ").trim().split(" ").slice(0, 80);
    const out: Char[] = [];
    let x = 0, y = LINE_H;
    for (const word of words) {
      const ww = c.measureText(word + " ").width;
      if (x + ww > w - 8) { x = 0; y += LINE_H; }
      if (y > BOX_H - 8) break;
      let cx = x;
      for (const ch of word + " ") {
        const cw = c.measureText(ch).width;
        out.push({ ch, x: cx, y });
        cx += cw;
      }
      x += ww;
    }
    setChars(out);
  }, [text, size.w]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      ripples.current = ripples.current.filter((r) => Date.now() - r.t < 1800);
      setTick((t) => (t + 1) % 1000000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    let auto = setInterval(() => {
      ripples.current.push({
        x: Math.random() * size.w,
        y: Math.random() * BOX_H,
        t: Date.now(),
      });
    }, 1400);

    return () => { cancelAnimationFrame(raf); clearInterval(auto); };
  }, [size.w]);

  const handleClick = (e: React.MouseEvent) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    ripples.current.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: Date.now() });
  };

  const now = Date.now();
  return (
    <ShowcaseCard
      title="Water Ripple"
      description="Click anywhere to drop a ripple. Letters bob on the surface."
    >
      <div
        ref={wrapRef}
        onClick={handleClick}
        className="relative w-full rounded-lg overflow-hidden cursor-pointer select-none"
        style={{
          height: BOX_H,
          background: "linear-gradient(180deg, #0c2434 0%, #0a1a2a 100%)",
        }}
      >
        <svg className="absolute inset-0 pointer-events-none" width={size.w} height={BOX_H}>
          {ripples.current.map((r, i) => {
            const age = (now - r.t) / 1800;
            const radius = age * 200;
            return (
              <circle
                key={i}
                cx={r.x}
                cy={r.y}
                r={radius}
                fill="none"
                stroke="rgba(120,200,255,0.6)"
                strokeWidth={2 * (1 - age)}
                opacity={1 - age}
              />
            );
          })}
        </svg>
        {chars.map((c, i) => {
          let dx = 0, dy = 0, scale = 1;
          for (const r of ripples.current) {
            const age = (now - r.t) / 1800;
            const radius = age * 200;
            const dist = Math.hypot(c.x - r.x, c.y - r.y);
            const diff = dist - radius;
            if (Math.abs(diff) < 28) {
              const wave = Math.cos((diff / 28) * Math.PI) * (1 - age) * 12;
              const ang = Math.atan2(c.y - r.y, c.x - r.x);
              dx += Math.cos(ang) * wave;
              dy += Math.sin(ang) * wave;
              scale += wave * 0.02;
            }
          }
          return (
            <span
              key={i}
              className="absolute font-serif text-white/90"
              style={{
                left: c.x,
                top: c.y,
                fontSize: FONT_SIZE,
                transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${scale.toFixed(3)})`,
                willChange: "transform",
                whiteSpace: "pre",
              }}
            >
              {c.ch}
            </span>
          );
        })}
      </div>
    </ShowcaseCard>
  );
}
