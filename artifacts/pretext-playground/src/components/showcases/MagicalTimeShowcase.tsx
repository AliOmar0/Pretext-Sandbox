import { useEffect, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { layoutAround, type WordPos } from "@/lib/flow-around";

const FONT = "15px Fraunces, serif";
const LINE_H = 22;
const BOX_H = 320;
const DVD_W = 86;
const DVD_H = 50;

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ec4899"];

export function MagicalTimeShowcase() {
  const { text } = usePlayground();
  const wrapRef = useRef<HTMLDivElement>(null);
  const dvd = useRef({ x: 40, y: 40, vx: 2.2, vy: 1.6, color: 0 });
  const [positions, setPositions] = useState<WordPos[]>([]);
  const [pos, setPos] = useState({ x: 40, y: 40, color: 0 });
  const [size, setSize] = useState({ w: 600, h: BOX_H });

  const words = text.replace(/\s+/g, " ").trim().split(" ").slice(0, 100);

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
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const d = dvd.current;
      d.x += d.vx;
      d.y += d.vy;
      let bounced = false;
      if (d.x <= 0) { d.x = 0; d.vx = Math.abs(d.vx); bounced = true; }
      if (d.x + DVD_W >= size.w) { d.x = size.w - DVD_W; d.vx = -Math.abs(d.vx); bounced = true; }
      if (d.y <= 0) { d.y = 0; d.vy = Math.abs(d.vy); bounced = true; }
      if (d.y + DVD_H >= BOX_H) { d.y = BOX_H - DVD_H; d.vy = -Math.abs(d.vy); bounced = true; }
      if (bounced) d.color = (d.color + 1 + Math.floor(Math.random() * (COLORS.length - 1))) % COLORS.length;
      setPos({ x: d.x, y: d.y, color: d.color });
      const obs = { x: d.x - 4, y: d.y - 2, w: DVD_W + 8, h: DVD_H + 4 };
      setPositions(layoutAround(words, size.w, BOX_H, LINE_H, FONT, obs));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [words.join(" "), size.w]);

  const color = COLORS[pos.color];
  return (
    <ShowcaseCard
      title="The Most Magical Time"
      description="A DVD logo bouncing across the page. The text refuses to sit still around it."
    >
      <div
        ref={wrapRef}
        className="relative w-full bg-[#0b0b14] rounded-lg overflow-hidden border border-border"
        style={{ height: BOX_H }}
      >
        {positions.map((p, i) => (
          <span
            key={i}
            className="absolute font-serif text-[15px] text-white/85"
            style={{ transform: `translate(${p.x}px, ${p.y}px)`, willChange: "transform" }}
          >
            {p.text}
          </span>
        ))}
        <div
          className="absolute flex items-center justify-center font-bold italic"
          style={{
            width: DVD_W,
            height: DVD_H,
            transform: `translate(${pos.x}px, ${pos.y}px)`,
            color,
            willChange: "transform",
            fontFamily: "Fraunces, serif",
            fontSize: 26,
            textShadow: `0 0 12px ${color}`,
          }}
        >
          DVD
        </div>
      </div>
    </ShowcaseCard>
  );
}
