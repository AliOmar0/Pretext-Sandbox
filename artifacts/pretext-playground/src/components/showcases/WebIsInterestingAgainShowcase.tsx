import { useEffect, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

const W = 720;
const H = 320;

export function WebIsInterestingAgainShowcase() {
  const { text } = usePlayground();
  const [t, setT] = useState(0);
  const headline =
    text.split(/[.!?\n]/).find((s) => s.trim().length > 6)?.trim().slice(0, 60) ||
    "the web is interesting again";

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const cycle = 6;
  const u = (t % cycle) / cycle;
  const charX = 60 + u * (W - 120);
  const bob = Math.sin(t * 6) * 4;
  const facing = Math.sin(t * 1.0) > 0 ? 1 : -1;
  const legPhase = Math.sin(t * 10);

  const chars = headline.split("");
  return (
    <ShowcaseCard
      title="The Web Is Interesting Again"
      description="A little wanderer walks across the page. The text leans away as it passes."
    >
      <div
        className="relative w-full rounded-lg overflow-hidden"
        style={{
          height: H,
          background:
            "linear-gradient(180deg, #fff8ee 0%, #f5e9d2 70%, #d8b88a 100%)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
          <line x1={0} y1={H - 40} x2={W} y2={H - 40} stroke="#a07a4a" strokeWidth={1.5} strokeDasharray="3 4" />

          <g>
            {chars.map((ch, i) => {
              const cx = (i + 0.5) * (W / chars.length);
              const dist = cx - charX;
              const close = Math.exp(-(dist * dist) / 6000);
              const lean = -Math.sign(dist) * close * 22;
              const lift = -close * 18;
              const rot = -Math.sign(dist) * close * 18;
              return (
                <text
                  key={i}
                  x={cx}
                  y={H / 2}
                  textAnchor="middle"
                  fontFamily="Fraunces, serif"
                  fontSize={36}
                  fontWeight={700}
                  fill="#2a1a0e"
                  transform={`translate(${lean.toFixed(1)} ${lift.toFixed(1)}) rotate(${rot.toFixed(1)} ${cx} ${H / 2})`}
                  style={{ transition: "fill 0.3s" }}
                >
                  {ch}
                </text>
              );
            })}
          </g>

          <g transform={`translate(${charX} ${H - 60 + bob}) scale(${facing} 1)`}>
            <ellipse cx={0} cy={6} rx={18} ry={3} fill="rgba(0,0,0,0.18)" />
            <circle cx={0} cy={-8} r={16} fill="hsl(10, 76%, 53%)" />
            <circle cx={5} cy={-12} r={3.5} fill="#fff" />
            <circle cx={6} cy={-11} r={1.8} fill="#0a0a0a" />
            <path d={`M -4 -3 Q 0 ${-1 + Math.sin(t * 5)} 6 -3`} stroke="#0a0a0a" strokeWidth={1.4} fill="none" strokeLinecap="round" />
            <line x1={-6} y1={4} x2={-6 + legPhase * 5} y2={14} stroke="hsl(10, 76%, 53%)" strokeWidth={3} strokeLinecap="round" />
            <line x1={6} y1={4} x2={6 - legPhase * 5} y2={14} stroke="hsl(10, 76%, 53%)" strokeWidth={3} strokeLinecap="round" />
            <line x1={-12} y1={-6} x2={-16 + legPhase * 4} y2={2} stroke="hsl(10, 76%, 53%)" strokeWidth={2.5} strokeLinecap="round" />
            <line x1={12} y1={-6} x2={16 - legPhase * 4} y2={2} stroke="hsl(10, 76%, 53%)" strokeWidth={2.5} strokeLinecap="round" />
          </g>

          {Array.from({ length: 6 }).map((_, i) => {
            const offset = (t * 30 - i * 90) % 720;
            const x = (charX - offset + W) % W;
            return (
              <circle key={i} cx={x} cy={H - 40} r={1.5} fill="#a07a4a" opacity={0.6 - i * 0.08} />
            );
          })}
        </svg>
      </div>
    </ShowcaseCard>
  );
}
