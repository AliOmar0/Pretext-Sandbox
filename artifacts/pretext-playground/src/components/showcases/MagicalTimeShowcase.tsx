import { useEffect, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { Button } from "@/components/ui/button";

interface Box {
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
  w: number;
  h: number;
}

const PALETTE = [10, 200, 50, 320, 170, 280];

export function MagicalTimeShowcase() {
  const { text } = usePlayground();
  const wrapRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const boxesRef = useRef<Box[]>([]);
  const [, setTick] = useState(0);
  const [running, setRunning] = useState(true);

  const fragments = (text.match(/[^.!?,\n]+[.!?,]?/g) || [text])
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 6);
  const fragKey = fragments.join("|");

  useEffect(() => {
    const wrap = wrapRef.current;
    const measure = measureRef.current;
    if (!wrap || !measure) return;
    const rect = wrap.getBoundingClientRect();
    const list = fragKey.split("|");

    boxesRef.current = list.map((t, i) => {
      measure.textContent = t;
      const m = measure.getBoundingClientRect();
      const w = Math.min(rect.width - 8, m.width + 12);
      const h = m.height + 4;
      return {
        text: t,
        x: Math.random() * Math.max(1, rect.width - w),
        y: Math.random() * Math.max(1, rect.height - h),
        vx: (Math.random() < 0.5 ? -1 : 1) * (1.4 + Math.random() * 0.8),
        vy: (Math.random() < 0.5 ? -1 : 1) * (1.4 + Math.random() * 0.8),
        hue: PALETTE[i % PALETTE.length],
        w,
        h,
      };
    });
    setTick((t) => t + 1);
  }, [fragKey]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const wrap = wrapRef.current;
      if (!wrap) {
        raf = requestAnimationFrame(loop);
        return;
      }
      const rect = wrap.getBoundingClientRect();
      if (running) {
        for (const b of boxesRef.current) {
          b.x += b.vx;
          b.y += b.vy;
          if (b.x <= 0) {
            b.x = 0;
            b.vx = Math.abs(b.vx);
            b.hue = PALETTE[Math.floor(Math.random() * PALETTE.length)];
          }
          if (b.x + b.w >= rect.width) {
            b.x = rect.width - b.w;
            b.vx = -Math.abs(b.vx);
            b.hue = PALETTE[Math.floor(Math.random() * PALETTE.length)];
          }
          if (b.y <= 0) {
            b.y = 0;
            b.vy = Math.abs(b.vy);
            b.hue = PALETTE[Math.floor(Math.random() * PALETTE.length)];
          }
          if (b.y + b.h >= rect.height) {
            b.y = rect.height - b.h;
            b.vy = -Math.abs(b.vy);
            b.hue = PALETTE[Math.floor(Math.random() * PALETTE.length)];
          }
        }
        setTick((t) => (t + 1) % 1000000);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  return (
    <ShowcaseCard
      title="The Most Magical Time"
      description="Sentences set free. Bounce around the box, change color on every wall hit."
      controls={
        <Button size="sm" variant="outline" onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : "Resume"}
        </Button>
      }
    >
      <div
        ref={wrapRef}
        className="relative h-[320px] bg-[#0a0a14] rounded-lg overflow-hidden border border-border"
      >
        <span
          ref={measureRef}
          className="absolute -top-[9999px] left-0 font-serif text-base px-3 py-0.5"
          aria-hidden
        />
        {boxesRef.current.map((b, i) => (
          <div
            key={i}
            className="absolute font-serif text-base px-3 py-0.5 rounded shadow select-none whitespace-nowrap overflow-hidden text-ellipsis"
            style={{
              transform: `translate(${b.x}px, ${b.y}px)`,
              width: b.w,
              maxWidth: b.w,
              backgroundColor: `hsl(${b.hue}, 75%, 55%)`,
              color: "white",
              willChange: "transform",
            }}
          >
            {b.text}
          </div>
        ))}
      </div>
    </ShowcaseCard>
  );
}
