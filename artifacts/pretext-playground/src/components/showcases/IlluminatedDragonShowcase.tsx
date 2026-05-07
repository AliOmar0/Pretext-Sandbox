import { useEffect, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

const W = 760;
const H = 320;
const SEGMENTS = 9;

interface Flame { id: number; t: number; angle: number; scale: number; }

export function IlluminatedDragonShowcase() {
  const { text } = usePlayground();
  const [t, setT] = useState(0);
  const [blink, setBlink] = useState(1);
  const flamesRef = useRef<Flame[]>([]);
  const flameId = useRef(0);
  const lastFlame = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const loop = (now: number) => {
      const tt = (now - start) / 1000;
      setT(tt);
      if (now - lastFlame.current > 90) {
        lastFlame.current = now;
        flamesRef.current.push({
          id: flameId.current++,
          t: tt,
          angle: (Math.random() - 0.5) * 0.5,
          scale: 0.7 + Math.random() * 0.6,
        });
        flamesRef.current = flamesRef.current.filter((f) => tt - f.t < 1);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    const blinkInt = setInterval(() => {
      setBlink(0);
      setTimeout(() => setBlink(1), 130);
    }, 2600);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(blinkInt);
    };
  }, []);

  const sentence = (text.split(/(?<=[.!?])\s/)[0] || text).slice(0, 240);

  // body segments along sine curve
  const baseY = H / 2 + 10;
  const segments = Array.from({ length: SEGMENTS }, (_, i) => {
    const u = i / (SEGMENTS - 1);
    const x = 90 + u * (W - 220);
    const y = baseY + Math.sin(u * 2.5 + t * 1.4) * 38;
    const r = 30 - u * 12;
    return { x, y, r, u };
  });

  const head = segments[segments.length - 1];
  const next = segments[segments.length - 2];
  const headAngle = Math.atan2(head.y - next.y, head.x - next.x);

  const tail = segments[0];
  const afterTail = segments[1];
  const tailAngle = Math.atan2(tail.y - afterTail.y, tail.x - afterTail.x);

  return (
    <ShowcaseCard
      title="Illuminated Dragon"
      description="A segmented dragon glides along, eyes blinking, fire on the wind."
    >
      <div
        className="relative w-full rounded-lg overflow-hidden"
        style={{
          height: H,
          background:
            "radial-gradient(ellipse at 30% 30%, #2a1340 0%, #120721 60%, #06030c 100%)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="dragScale" cx="0.35" cy="0.3">
              <stop offset="0%" stopColor="#ffe9a8" />
              <stop offset="35%" stopColor="#ff7a3d" />
              <stop offset="100%" stopColor="#7a1a4a" />
            </radialGradient>
            <radialGradient id="dragGlow">
              <stop offset="0%" stopColor="rgba(255,180,80,0.55)" />
              <stop offset="100%" stopColor="rgba(255,180,80,0)" />
            </radialGradient>
            <radialGradient id="flameGrad">
              <stop offset="0%" stopColor="#fff7c2" />
              <stop offset="35%" stopColor="#ffb43d" />
              <stop offset="80%" stopColor="#ff3a1f" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#ff3a1f" stopOpacity={0} />
            </radialGradient>
            <filter id="softBlur"><feGaussianBlur stdDeviation="3" /></filter>
            <path id="bodyCurve" d={pathThrough(segments)} />
          </defs>

          {/* ambient body glow */}
          {segments.map((s, i) => (
            <circle key={`g${i}`} cx={s.x} cy={s.y} r={s.r * 1.7} fill="url(#dragGlow)" />
          ))}

          {/* tail fin */}
          <g transform={`translate(${tail.x} ${tail.y}) rotate(${(tailAngle * 180) / Math.PI})`}>
            <path
              d="M 0 0 L -28 -16 L -38 0 L -28 16 Z"
              fill="url(#dragScale)"
              opacity={0.9}
            />
          </g>

          {/* spiked spine — small triangles between segments */}
          {segments.slice(1, -1).map((s, i) => {
            const prev = segments[i];
            const ang = Math.atan2(s.y - prev.y, s.x - prev.x) - Math.PI / 2;
            const sx = (s.x + prev.x) / 2;
            const sy = (s.y + prev.y) / 2;
            const sp = 10 + Math.sin(t * 3 + i) * 1.5;
            return (
              <path
                key={`sp${i}`}
                d={`M ${sx - 6 * Math.cos(ang + Math.PI / 2)} ${sy - 6 * Math.sin(ang + Math.PI / 2)} L ${sx + sp * Math.cos(ang)} ${sy + sp * Math.sin(ang)} L ${sx + 6 * Math.cos(ang + Math.PI / 2)} ${sy + 6 * Math.sin(ang + Math.PI / 2)} Z`}
                fill="#ffae3a"
                opacity={0.9}
              />
            );
          })}

          {/* body segments (overlapping circles) */}
          {segments.map((s, i) => (
            <g key={`b${i}`}>
              <circle cx={s.x} cy={s.y} r={s.r} fill="url(#dragScale)" stroke="#3a0a20" strokeWidth={1.2} />
              <ellipse cx={s.x - s.r * 0.3} cy={s.y - s.r * 0.4} rx={s.r * 0.45} ry={s.r * 0.25} fill="rgba(255,240,200,0.35)" />
            </g>
          ))}

          {/* tiny wing */}
          <g transform={`translate(${segments[Math.floor(SEGMENTS / 2)].x} ${segments[Math.floor(SEGMENTS / 2)].y - 18}) rotate(${Math.sin(t * 8) * 14})`}>
            <path d="M 0 0 Q 20 -34 44 -10 Q 30 -6 22 4 Q 12 0 0 0 Z" fill="#ff7a3d" stroke="#3a0a20" strokeWidth={1} opacity={0.95} />
          </g>

          {/* head */}
          <g transform={`translate(${head.x} ${head.y}) rotate(${(headAngle * 180) / Math.PI})`}>
            {/* horns */}
            <path d="M -6 -16 L -2 -28 L 4 -16 Z" fill="#fff0c2" stroke="#3a0a20" strokeWidth={1} />
            <path d="M -16 -12 L -16 -24 L -8 -14 Z" fill="#fff0c2" stroke="#3a0a20" strokeWidth={1} />
            {/* head shape */}
            <path d="M -18 -16 Q 22 -22 30 -2 Q 22 18 -18 16 Q -28 0 -18 -16 Z" fill="url(#dragScale)" stroke="#3a0a20" strokeWidth={1.4} />
            {/* nostril */}
            <circle cx={26} cy={-2} r={1.6} fill="#3a0a20" />
            {/* mouth */}
            <path d="M 12 6 Q 22 12 30 4" stroke="#3a0a20" strokeWidth={1.4} fill="none" strokeLinecap="round" />
            {/* fang */}
            <path d="M 22 7 L 24 13 L 26 7 Z" fill="#fff" />
            {/* eye */}
            <circle cx={4} cy={-4} r={5} fill="#fff8d6" />
            <ellipse cx={6} cy={-4} rx={2.2} ry={4 * blink} fill="#0a0a14" />
            <circle cx={5.2} cy={-5} r={0.9 * blink} fill="#fff" />
            {/* cheek scale */}
            <ellipse cx={-6} cy={2} rx={6} ry={4} fill="rgba(255,240,200,0.3)" />
          </g>

          {/* flames */}
          {flamesRef.current.map((f) => {
            const age = (t - f.t);
            if (age < 0 || age > 1) return null;
            const ox = head.x + Math.cos(headAngle) * 32;
            const oy = head.y + Math.sin(headAngle) * 32;
            const dist = age * 110;
            const fx = ox + Math.cos(headAngle + f.angle) * dist;
            const fy = oy + Math.sin(headAngle + f.angle) * dist - age * 10;
            const r = (1 - age) * 18 * f.scale + 4;
            return (
              <circle
                key={f.id}
                cx={fx}
                cy={fy}
                r={r}
                fill="url(#flameGrad)"
                opacity={1 - age}
                filter={age > 0.5 ? "url(#softBlur)" : undefined}
              />
            );
          })}

          {/* text along the body curve */}
          <text fill="rgba(255,250,235,0.95)" fontFamily="Fraunces, serif" fontSize={11} fontWeight={600} letterSpacing={0.6}>
            <textPath href="#bodyCurve" startOffset={`${(t * 5) % 100}%`}>
              {sentence + "  •  " + sentence}
            </textPath>
          </text>
        </svg>
      </div>
    </ShowcaseCard>
  );
}

function pathThrough(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i];
    const prev = pts[i - 1];
    const mx = (prev.x + p.x) / 2;
    const my = (prev.y + p.y) / 2;
    d += ` Q ${prev.x} ${prev.y} ${mx} ${my}`;
  }
  d += ` T ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
  return d;
}
