import { useEffect, useRef } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

export function AsciiRainShowcase() {
  const { text } = usePlayground();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<string[]>([]);

  useEffect(() => {
    const cleaned = text.replace(/\s+/g, "").split("");
    charsRef.current = cleaned.length > 0 ? cleaned : ["P", "R", "E", "T", "E", "X", "T"];
  }, [text]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const dpr = window.devicePixelRatio || 1;
    const fontSize = 14;
    let cols = 0;
    let drops: number[] = [];

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      cols = Math.floor(r.width / fontSize);
      drops = new Array(cols).fill(0).map(() => Math.random() * -50);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const draw = () => {
      ctx.fillStyle = "rgba(26, 20, 16, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize * dpr}px ui-monospace, Menlo, monospace`;

      for (let i = 0; i < cols; i++) {
        const ch =
          charsRef.current[
            Math.floor(Math.random() * charsRef.current.length)
          ] || "?";
        const x = i * fontSize * dpr;
        const y = drops[i] * fontSize * dpr;

        ctx.fillStyle = "hsl(38, 100%, 78%)";
        ctx.fillText(ch, x, y);
        ctx.fillStyle = "hsl(10, 76%, 60%)";
        ctx.fillText(ch, x, y - fontSize * dpr);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.5;
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <ShowcaseCard
      showcaseId="ascii-rain"
      title="ASCII Rain"
      description="Falling characters sampled from your source text."
    >
      <div
        ref={wrapRef}
        className="relative h-[280px] rounded-lg overflow-hidden bg-[#1a1410] border border-border"
      >
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>
    </ShowcaseCard>
  );
}
