import { useEffect, useRef } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

interface Star {
  word: string;
  x: number;
  y: number;
  size: number;
  twinkle: number;
  origIdx: number;
}

export function ConstellationShowcase() {
  const { text } = usePlayground();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let raf = 0;
    let stars: Star[] = [];
    let rotation = 0;

    const seed = (s: number) => {
      let v = s;
      return () => {
        v = (v * 9301 + 49297) % 233280;
        return v / 233280;
      };
    };

    const layout = () => {
      const r = wrap.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;

      const words = text
        .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2)
        .slice(0, 36);

      const rand = seed(words.join("").length || 1);
      stars = words.map((word, i) => ({
        word,
        x: rand() * r.width * dpr,
        y: rand() * r.height * dpr,
        size: 2 + rand() * 2,
        twinkle: rand() * Math.PI * 2,
        origIdx: i,
      }));
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(wrap);

    const draw = () => {
      rotation += 0.0006;
      ctx.fillStyle = "rgba(8, 6, 16, 0.6)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      const projected = stars.map((s) => {
        const dx = s.x - cx;
        const dy = s.y - cy;
        const ca = Math.cos(rotation);
        const sa = Math.sin(rotation);
        return {
          ...s,
          px: cx + dx * ca - dy * sa,
          py: cy + dx * sa + dy * ca,
        };
      });

      ctx.strokeStyle = "rgba(220, 200, 160, 0.25)";
      ctx.lineWidth = 1 * dpr;
      for (let i = 0; i < projected.length - 1; i++) {
        const a = projected[i];
        const b = projected[i + 1];
        const dist = Math.hypot(a.px - b.px, a.py - b.py);
        if (dist < 180 * dpr) {
          ctx.beginPath();
          ctx.moveTo(a.px, a.py);
          ctx.lineTo(b.px, b.py);
          ctx.stroke();
        }
      }

      const t = performance.now() / 1000;
      ctx.font = `${11 * dpr}px Fraunces, serif`;
      for (const s of projected) {
        const tw = 0.6 + 0.4 * Math.sin(t * 2 + s.twinkle);
        ctx.fillStyle = `hsla(38, 100%, 80%, ${tw})`;
        ctx.beginPath();
        ctx.arc(s.px, s.py, s.size * dpr, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(245, 235, 215, ${tw * 0.85})`;
        ctx.fillText(s.word, s.px + 6 * dpr, s.py - 4 * dpr);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [text]);

  return (
    <ShowcaseCard
      showcaseId="constellation"
      title="Word Cloud Constellation"
      description="Words become stars. Faint lines connect neighbors. The sky slowly turns."
      className="md:col-span-2"
    >
      <div
        ref={wrapRef}
        className="relative h-[340px] rounded-xl overflow-hidden border border-border bg-[#08060f]"
      >
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>
    </ShowcaseCard>
  );
}
