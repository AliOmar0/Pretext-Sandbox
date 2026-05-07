import { useEffect, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { Slider } from "@/components/ui/slider";

const RAMP = " .,:;i1tfLCG08@";

export function VariableAsciiShowcase() {
  const { text } = usePlayground();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [weight, setWeight] = useState(60);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const r = wrap.getBoundingClientRect();
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    canvas.style.width = `${r.width}px`;
    canvas.style.height = `${r.height}px`;

    const fontSize = 80 * dpr;
    ctx.font = `${weight} ${fontSize}px Fraunces, serif`;
    ctx.textBaseline = "top";
    ctx.fillStyle = "#fff";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sentence = (text.split(/\s+/).slice(0, 3).join(" ") || "Pretext").toUpperCase();
    const tw = ctx.measureText(sentence).width;
    const x = (canvas.width - tw) / 2;
    const y = (canvas.height - fontSize) / 2;
    ctx.fillText(sentence, x, y);

    const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cellW = 8 * dpr;
    const cellH = 14 * dpr;
    ctx.font = `${cellH * 0.95}px ui-monospace, Menlo, monospace`;
    ctx.fillStyle = "hsl(10, 76%, 53%)";

    for (let cy = 0; cy < canvas.height; cy += cellH) {
      for (let cx = 0; cx < canvas.width; cx += cellW) {
        let sum = 0;
        let count = 0;
        for (let yy = 0; yy < cellH; yy += 2) {
          for (let xx = 0; xx < cellW; xx += 2) {
            const px = ((cy + yy) * canvas.width + (cx + xx)) * 4;
            sum += img[px + 3] || 0;
            count++;
          }
        }
        const a = sum / count / 255;
        if (a > 0.05) {
          const ch = RAMP[Math.min(RAMP.length - 1, Math.floor(a * RAMP.length))];
          ctx.fillText(ch, cx, cy);
        }
      }
    }
  }, [text, weight]);

  return (
    <ShowcaseCard
      showcaseId="variable-ascii"
      title="Variable Typographic ASCII"
      description="Your text rendered as a glyph, then sampled into ASCII. Drag the weight."
      controls={
        <div className="w-40">
          <Slider
            min={100}
            max={900}
            step={100}
            value={[weight]}
            onValueChange={(v) => setWeight(v[0])}
          />
        </div>
      }
    >
      <div
        ref={wrapRef}
        className="relative w-full rounded-lg overflow-hidden bg-[#1a1410]"
        style={{ aspectRatio: "16 / 7", maxHeight: 540 }}
      >
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>
    </ShowcaseCard>
  );
}
