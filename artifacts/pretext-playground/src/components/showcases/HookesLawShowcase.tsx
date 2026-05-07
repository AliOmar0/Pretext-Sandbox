import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

const ANCHOR = { x: 50, y: 30 };

function springPath(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  coils = 8
): string {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const amp = 8;
  let d = `M ${ax} ${ay}`;
  for (let i = 1; i <= coils * 2; i++) {
    const t = i / (coils * 2);
    const cx = ax + dx * t;
    const cy = ay + dy * t;
    const sign = i % 2 === 0 ? 1 : -1;
    d += ` L ${cx + px * amp * sign} ${cy + py * amp * sign}`;
  }
  d += ` L ${bx} ${by}`;
  return d;
}

export function HookesLawShowcase() {
  const { text } = usePlayground();

  const x = useMotionValue(0);
  const y = useMotionValue(120);
  const sx = useSpring(x, { stiffness: 80, damping: 6, mass: 1.2 });
  const sy = useSpring(y, { stiffness: 80, damping: 6, mass: 1.2 });

  const [path, setPath] = useState(() =>
    springPath(ANCHOR.x, ANCHOR.y, 50 + 16, 120 + 16)
  );
  const [pad, setPad] = useState(0);

  useEffect(() => {
    const update = () => {
      const bx = sx.get() + 50 + 16;
      const by = sy.get() + 120 + 16;
      setPath(springPath(ANCHOR.x, ANCHOR.y, bx, by));
      setPad(Math.min(40, Math.max(0, by - 100) * 0.25));
    };
    const u1 = sx.on("change", update);
    const u2 = sy.on("change", update);
    update();
    return () => {
      u1();
      u2();
    };
  }, [sx, sy]);

  const ringRef = useRef<HTMLDivElement>(null);
  const scale = useTransform([sx, sy], ([vx, vy]) => {
    const xn = vx as number;
    const yn = vy as number;
    return 1 + Math.min(0.15, Math.hypot(xn, yn - 120) / 800);
  });

  return (
    <ShowcaseCard
      title="Hooke's Law"
      description="Drag the weight, let it go. Spring physics; the text below breathes with it."
    >
      <div className="relative h-[160px] bg-white border border-border rounded-lg overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
          <line x1="0" y1="30" x2="400" y2="30" stroke="hsl(10, 76%, 53%)" strokeWidth="2" />
          <path d={path} fill="none" stroke="hsl(10, 76%, 35%)" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        <div
          ref={ringRef}
          className="absolute"
          style={{ left: 50, top: 120, width: 32, height: 32 }}
        >
          <motion.div
            drag
            dragConstraints={{ left: -40, right: 300, top: -100, bottom: 20 }}
            dragElastic={0.5}
            style={{ x: sx, y: sy, scale }}
            onDrag={(_, info) => {
              x.set(info.offset.x);
              y.set(120 + info.offset.y);
            }}
            onDragStart={() => {
              x.set(sx.get());
              y.set(sy.get());
            }}
            onDragEnd={() => {
              x.set(0);
              y.set(120);
            }}
            className="w-8 h-8 -mt-[120px] rounded-full bg-primary shadow-lg cursor-grab active:cursor-grabbing"
          />
        </div>
      </div>

      <motion.p
        className="mt-4 text-sm font-serif leading-relaxed text-foreground/80"
        style={{ paddingLeft: pad, paddingRight: pad }}
      >
        {text.split("\n\n")[0]}
      </motion.p>
    </ShowcaseCard>
  );
}
