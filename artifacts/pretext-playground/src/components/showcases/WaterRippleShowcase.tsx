import { useEffect, useRef } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

interface Ripple {
  x: number;
  y: number;
  t: number;
  strength: number;
}

export function WaterRippleShowcase() {
  const { text } = usePlayground();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const ambientRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const ambientInterval = window.setInterval(() => {
      const r = wrap.getBoundingClientRect();
      ripplesRef.current.push({
        x: Math.random() * r.width * dpr,
        y: Math.random() * r.height * dpr,
        t: 0,
        strength: 0.4,
      });
    }, 1400);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "rgba(225, 220, 210, 0.5)");
      grad.addColorStop(1, "rgba(200, 195, 185, 0.5)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ambientRef.current += 0.012;

      ripplesRef.current = ripplesRef.current.filter((r) => r.t < 220);
      ripplesRef.current.forEach((r) => {
        r.t += 1.2;
        const radius = r.t * 1.6 * dpr;
        const alpha = Math.max(0, (1 - r.t / 220) * r.strength);
        ctx.strokeStyle = `hsla(10, 76%, 53%, ${alpha})`;
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `hsla(10, 76%, 53%, ${alpha * 0.5})`;
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.clearInterval(ambientInterval);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    ripplesRef.current.push({
      x: (e.clientX - rect.left) * dpr,
      y: (e.clientY - rect.top) * dpr,
      t: 0,
      strength: 1,
    });
  };

  return (
    <ShowcaseCard
      title="Water Ripple"
      description="Click anywhere on the surface. Ripples spread, text shimmers."
      className="md:col-span-2"
    >
      <div
        ref={wrapRef}
        onClick={handleClick}
        className="relative h-[320px] rounded-xl overflow-hidden cursor-pointer border border-border bg-muted/30"
      >
        <canvas ref={canvasRef} className="absolute inset-0" />
        <div
          className="absolute inset-0 flex items-center justify-center p-8"
          style={{ animation: "shimmer 4s ease-in-out infinite" }}
        >
          <p className="font-serif text-lg leading-relaxed text-foreground/85 text-center max-w-xl">
            {text.split("\n\n")[0]}
          </p>
        </div>
        <style>{`
          @keyframes shimmer {
            0%, 100% { filter: blur(0px); transform: skewX(0deg); }
            50% { filter: blur(0.5px); transform: skewX(0.4deg); }
          }
        `}</style>
      </div>
    </ShowcaseCard>
  );
}
