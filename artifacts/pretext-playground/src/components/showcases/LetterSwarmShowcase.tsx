import { useEffect, useRef } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

interface Particle {
  ch: string;
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function LetterSwarmShowcase() {
  const { text } = usePlayground();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let raf = 0;
    let particles: Particle[] = [];

    const sentence = (text.match(/[^.!?]+[.!?]+/g) || [text])[0]?.trim() || text;

    const layout = () => {
      const r = wrap.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;

      const fontSize = 18 * dpr;
      ctx.font = `${fontSize}px Fraunces, serif`;
      const words = sentence.split(/\s+/);
      const lineHeight = fontSize * 1.5;
      const maxWidth = canvas.width - 40 * dpr;
      const lines: string[] = [];
      let line = "";
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (ctx.measureText(test).width > maxWidth) {
          if (line) lines.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);

      const totalH = lines.length * lineHeight;
      let y = (canvas.height - totalH) / 2 + fontSize;
      const newParticles: Particle[] = [];
      for (const ln of lines) {
        const w = ctx.measureText(ln).width;
        let x = (canvas.width - w) / 2;
        for (const ch of ln) {
          const cw = ctx.measureText(ch).width;
          if (ch !== " ") {
            newParticles.push({
              ch,
              hx: x,
              hy: y,
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
              vx: 0,
              vy: 0,
            });
          }
          x += cw;
        }
        y += lineHeight;
      }
      particles = newParticles;
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(wrap);

    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) * dpr;
      mouseRef.current.y = (e.clientY - rect.top) * dpr;
      mouseRef.current.active = true;
    };
    const onLeave = () => {
      mouseRef.current.active = false;
    };
    wrap.addEventListener("mousemove", onMove);
    wrap.addEventListener("mouseleave", onLeave);

    const draw = () => {
      ctx.fillStyle = "rgba(248, 244, 236, 0.55)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const fontSize = 18 * dpr;
      ctx.font = `${fontSize}px Fraunces, serif`;
      ctx.fillStyle = "hsl(10, 76%, 25%)";

      for (const p of particles) {
        const dxh = p.hx - p.x;
        const dyh = p.hy - p.y;
        p.vx += dxh * 0.012;
        p.vy += dyh * 0.012;

        if (mouseRef.current.active) {
          const dxm = p.x - mouseRef.current.x;
          const dym = p.y - mouseRef.current.y;
          const d2 = dxm * dxm + dym * dym;
          const radius = 80 * dpr;
          if (d2 < radius * radius && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const force = (1 - d / radius) * 4;
            p.vx += (dxm / d) * force;
            p.vy += (dym / d) * force;
          }
        }

        p.vx *= 0.85;
        p.vy *= 0.85;
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillText(p.ch, p.x, p.y);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
    };
  }, [text]);

  return (
    <ShowcaseCard
      showcaseId="letter-swarm"
      title="Letter Swarm"
      description="Letters flock to their reading positions. Move your cursor to scatter them."
    >
      <div
        ref={wrapRef}
        className="relative h-[300px] rounded-lg overflow-hidden border border-border bg-[#f8f4ec]"
      >
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>
    </ShowcaseCard>
  );
}
