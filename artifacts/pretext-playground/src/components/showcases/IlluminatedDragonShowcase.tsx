import { useEffect, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

const W = 720;
const H = 280;

export function IlluminatedDragonShowcase() {
  const { text } = usePlayground();
  const [t, setT] = useState(0);
  const [blink, setBlink] = useState(1);
  const rafRef = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const loop = (now: number) => {
      setT((now - start) / 1000);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    const blinkInt = setInterval(() => {
      setBlink(0);
      setTimeout(() => setBlink(1), 140);
    }, 2800);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(blinkInt);
    };
  }, []);

  const wag = Math.sin(t * 1.6) * 18;
  const wag2 = Math.sin(t * 1.6 + 1) * 14;
  const path = `M 40 ${140 + wag} C 180 ${60 + wag2}, 320 ${220 - wag}, 460 ${120 + wag2} S 660 ${180 - wag}, 700 ${130 + wag}`;

  const sentence = (text.split(/(?<=[.!?])\s/)[0] || text).slice(0, 180);

  const cometT = (t * 0.18) % 1;

  return (
    <ShowcaseCard
      title="Illuminated Dragon"
      description="A glowing dragon wags happily; your text rides along its spine."
    >
      <div
        className="relative w-full rounded-lg overflow-hidden"
        style={{
          height: H,
          background: "radial-gradient(ellipse at center, #1a0e2e 0%, #08040f 100%)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="dragonBody" x1="0" x2="1">
              <stop offset="0%" stopColor="#ff6b35" />
              <stop offset="50%" stopColor="#f7c948" />
              <stop offset="100%" stopColor="#ff3d7f" />
            </linearGradient>
            <radialGradient id="glow">
              <stop offset="0%" stopColor="rgba(255,200,100,0.9)" />
              <stop offset="100%" stopColor="rgba(255,200,100,0)" />
            </radialGradient>
            <filter id="blur"><feGaussianBlur stdDeviation="6" /></filter>
            <path id="dragonPath" d={path} />
          </defs>

          <use href="#dragonPath" stroke="url(#dragonBody)" strokeWidth={36} fill="none" strokeLinecap="round" opacity={0.25} filter="url(#blur)" />
          <use href="#dragonPath" stroke="url(#dragonBody)" strokeWidth={22} fill="none" strokeLinecap="round" />
          <use href="#dragonPath" stroke="rgba(255,255,255,0.4)" strokeWidth={2} fill="none" strokeDasharray="2 8" strokeLinecap="round" />

          <circle cx={40 + cometT * 660} cy={140 + Math.sin((t + cometT * 6.28)) * 30} r={10} fill="url(#glow)" />

          <g transform={`translate(700 ${130 + wag}) rotate(${-15 + wag * 0.4})`}>
            <path d="M -10 -14 L 18 0 L -10 14 Z" fill="#ff6b35" />
            <path d="M 6 -2 L 18 0 L 6 2 Z" fill="#fff8d6" />
            <circle cx={-2} cy={-3} r={3} fill="#fff" />
            <circle cx={-2} cy={-3} r={1.6 * blink} fill="#0a0a0a" />
            <path d={`M 4 5 Q 8 ${8 + Math.sin(t * 4) * 2} 12 5`} stroke="#fff8d6" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          </g>

          <g transform={`translate(40 ${140 + wag})`}>
            <path d="M 0 0 L -22 -16 L -28 0 L -22 16 Z" fill="url(#dragonBody)" opacity={0.6 + Math.sin(t * 3) * 0.2} />
          </g>

          <text fill="rgba(255,250,235,0.95)" fontFamily="Fraunces, serif" fontSize={11} fontWeight={500} letterSpacing={0.5}>
            <textPath href="#dragonPath" startOffset={`${(t * 6) % 100}%`}>
              {sentence + "  •  " + sentence}
            </textPath>
          </text>
        </svg>
      </div>
    </ShowcaseCard>
  );
}
