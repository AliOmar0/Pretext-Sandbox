import { useEffect, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { Button } from "@/components/ui/button";

interface Body {
  word: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  angle: number;
  vAngle: number;
}

export function GravityWordsShowcase() {
  const { text } = usePlayground();
  const wrapRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const bodiesRef = useRef<Body[]>([]);
  const [, setTick] = useState(0);

  const sentence = (text.match(/[^.!?]+[.!?]+/g) || [text])[0] || text;
  const words = sentence.trim().split(/\s+/).slice(0, 14);
  const wordsKey = words.join("|");

  useEffect(() => {
    const wrap = wrapRef.current;
    const measure = measureRef.current;
    if (!wrap || !measure) return;
    const rect = wrap.getBoundingClientRect();
    const wordList = wordsKey.split("|");

    bodiesRef.current = wordList.map((w) => {
      measure.textContent = w;
      const mr = measure.getBoundingClientRect();
      const bw = mr.width + 16;
      const bh = mr.height + 6;
      return {
        word: w,
        x: 20 + Math.random() * Math.max(20, rect.width - bw - 40),
        y: 10 + Math.random() * 40,
        vx: (Math.random() - 0.5) * 4,
        vy: 0,
        w: bw,
        h: bh,
        angle: (Math.random() - 0.5) * 0.4,
        vAngle: (Math.random() - 0.5) * 0.05,
      };
    });
    setTick((t) => t + 1);
  }, [wordsKey]);

  useEffect(() => {
    let raf = 0;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const tick = () => {
      const rect = wrap.getBoundingClientRect();
      const bodies = bodiesRef.current;
      const g = 0.45;
      const friction = 0.985;
      const restitution = 0.35;

      for (const b of bodies) {
        b.vy += g;
        b.x += b.vx;
        b.y += b.vy;
        b.angle += b.vAngle;
        b.vAngle *= 0.98;
        b.vx *= friction;

        if (b.x < 0) { b.x = 0; b.vx = -b.vx * restitution; }
        if (b.x + b.w > rect.width) { b.x = rect.width - b.w; b.vx = -b.vx * restitution; }
        if (b.y + b.h > rect.height) {
          b.y = rect.height - b.h;
          b.vy = -b.vy * restitution;
          b.vx *= 0.85;
          if (Math.abs(b.vy) < 1) b.vy = 0;
          b.vAngle *= 0.5;
        }
      }

      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i];
          const c = bodies[j];
          if (
            a.x < c.x + c.w &&
            a.x + a.w > c.x &&
            a.y < c.y + c.h &&
            a.y + a.h > c.y
          ) {
            const overlapY = Math.min(a.y + a.h - c.y, c.y + c.h - a.y);
            const overlapX = Math.min(a.x + a.w - c.x, c.x + c.w - a.x);
            if (overlapY < overlapX) {
              if (a.y < c.y) {
                a.y -= overlapY / 2;
                c.y += overlapY / 2;
              } else {
                a.y += overlapY / 2;
                c.y -= overlapY / 2;
              }
              a.vy *= 0.5;
              c.vy *= 0.5;
            } else {
              if (a.x < c.x) {
                a.x -= overlapX / 2;
                c.x += overlapX / 2;
              } else {
                a.x += overlapX / 2;
                c.x -= overlapX / 2;
              }
              a.vx *= 0.5;
              c.vx *= 0.5;
            }
          }
        }
      }

      setTick((t) => (t + 1) % 1000000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const shake = () => {
    bodiesRef.current.forEach((b) => {
      b.vy = -10 - Math.random() * 8;
      b.vx = (Math.random() - 0.5) * 10;
      b.vAngle = (Math.random() - 0.5) * 0.2;
    });
  };

  return (
    <ShowcaseCard
      title="Gravity Words"
      description="Each word is a falling brick. Stack them, shake them, repeat."
      controls={
        <Button size="sm" variant="outline" onClick={shake}>
          Shake
        </Button>
      }
    >
      <div
        ref={wrapRef}
        className="relative h-[300px] bg-muted/40 border border-border rounded-lg overflow-hidden"
      >
        <span
          ref={measureRef}
          className="absolute -top-[9999px] left-0 font-serif text-base px-2 py-0.5"
          aria-hidden
        />
        {bodiesRef.current.map((b, i) => (
          <div
            key={i}
            className="absolute font-serif text-base px-2 py-0.5 bg-card border border-border rounded shadow-sm select-none"
            style={{
              transform: `translate(${b.x}px, ${b.y}px) rotate(${b.angle}rad)`,
              willChange: "transform",
            }}
          >
            {b.word}
          </div>
        ))}
      </div>
    </ShowcaseCard>
  );
}
