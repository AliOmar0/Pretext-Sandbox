import { useEffect, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

const W = 760;
const H = 340;
const SEGMENTS = 22;

interface Flame {
  id: number;
  born: number;
  angle: number;
  speed: number;
  scale: number;
  hue: number;
}

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
      if (now - lastFlame.current > 55) {
        lastFlame.current = now;
        flamesRef.current.push({
          id: flameId.current++,
          born: tt,
          angle: (Math.random() - 0.5) * 0.45,
          speed: 90 + Math.random() * 70,
          scale: 0.7 + Math.random() * 0.7,
          hue: Math.random(),
        });
        flamesRef.current = flamesRef.current.filter((f) => tt - f.born < 1.4);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    const blinkInt = setInterval(() => {
      setBlink(0);
      setTimeout(() => setBlink(1), 140);
    }, 3200);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(blinkInt);
    };
  }, []);

  // Serpentine body — undulating S-curve, slow drift
  const baseY = H * 0.55;
  const segments = Array.from({ length: SEGMENTS }, (_, i) => {
    const u = i / (SEGMENTS - 1);
    // Body length spans most of the canvas, leaving room for head + tail
    const x = 70 + u * (W - 200);
    // S-curve: two sine humps + slow swim animation
    const y =
      baseY +
      Math.sin(u * Math.PI * 1.6 + t * 0.9) * 52 +
      Math.sin(u * Math.PI * 3.2 + t * 0.6) * 10;
    // Body tapers from middle: thicker near the front quarter, thinning to tail
    const taper =
      u < 0.18
        ? 14 + (u / 0.18) * 14
        : u < 0.55
          ? 28 - (u - 0.18) * 10
          : Math.max(4, 24 - (u - 0.55) * 44);
    return { x, y, r: taper, u };
  });

  const head = segments[segments.length - 1];
  const beforeHead = segments[segments.length - 3];
  const headAngle = Math.atan2(head.y - beforeHead.y, head.x - beforeHead.x);

  const tail = segments[0];
  const afterTail = segments[2];
  const tailAngle = Math.atan2(tail.y - afterTail.y, tail.x - afterTail.x);

  // Wing anchor: ~25% along body from head end (front shoulder)
  const wingIdx = Math.floor(SEGMENTS * 0.78);
  const wing = segments[wingIdx];

  const bodyPath = pathThrough(segments);
  const sentence = (text.split(/(?<=[.!?])\s/)[0] || text).slice(0, 220);

  // Build outline polygon (top + bottom edges of the snake) for fill
  const outline = bodyOutline(segments);

  return (
    <ShowcaseCard
      showcaseId="illuminated-dragon"
      title="Illuminated Dragon"
      description="A bestiary serpent coiled in the margin, breathing painted fire."
    >
      <div
        className="relative w-full rounded-lg overflow-hidden"
        style={{
          aspectRatio: `${W} / ${H}`,
          maxHeight: 580,
          background:
            "radial-gradient(ellipse at 50% 40%, #f6ecd3 0%, #ecdcb3 60%, #d8c089 100%)",
        }}
      >
        {/* parchment grain */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0 0.08  0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="vermillion" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d6451f" />
              <stop offset="55%" stopColor="#a82218" />
              <stop offset="100%" stopColor="#6e0f0d" />
            </linearGradient>
            <linearGradient id="bellyGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f1d27a" />
              <stop offset="100%" stopColor="#b88726" />
            </linearGradient>
            <linearGradient id="wingFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c2342a" />
              <stop offset="100%" stopColor="#5b110d" />
            </linearGradient>
            <linearGradient id="wingBack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7d1812" />
              <stop offset="100%" stopColor="#36080a" />
            </linearGradient>
            <radialGradient id="flameGrad" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#fff4c2" />
              <stop offset="35%" stopColor="#ffb43d" />
              <stop offset="75%" stopColor="#d6451f" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#6e0f0d" stopOpacity={0} />
            </radialGradient>
            <radialGradient id="emberGrad" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#fff8d6" />
              <stop offset="60%" stopColor="#f1c14a" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#f1c14a" stopOpacity={0} />
            </radialGradient>
            <filter id="paint" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" />
              <feDisplacementMap in="SourceGraphic" scale="1.4" />
            </filter>
            <filter id="softBlur"><feGaussianBlur stdDeviation="2.5" /></filter>
            <path id="bodyCurve" d={bodyPath} />
          </defs>

          {/* BACK WING — behind body */}
          <g
            transform={`translate(${wing.x - 4} ${wing.y - 6}) rotate(${
              -22 + Math.sin(t * 3.4) * 10
            })`}
          >
            <path
              d="M 0 0
                 Q -10 -42 -34 -64
                 Q -56 -78 -78 -70
                 Q -60 -54 -54 -38
                 Q -38 -28 -30 -14
                 Q -16 -6 0 0 Z"
              fill="url(#wingBack)"
              stroke="#2a0608"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
            {/* wing ribs */}
            <path d="M 0 0 Q -22 -34 -78 -70" stroke="#2a0608" strokeWidth={1} fill="none" />
            <path d="M 0 0 Q -10 -28 -54 -38" stroke="#2a0608" strokeWidth={1} fill="none" />
            <path d="M 0 0 Q -4 -16 -30 -14" stroke="#2a0608" strokeWidth={1} fill="none" />
          </g>

          {/* BODY FILL */}
          <path d={outline} fill="url(#vermillion)" stroke="#2a0608" strokeWidth={1.6} strokeLinejoin="round" />

          {/* BELLY band — thinner offset path under body for golden underside */}
          <path d={bellyPath(segments)} fill="url(#bellyGold)" opacity={0.95} stroke="#7a4a14" strokeWidth={0.8} />

          {/* SCALE pattern — small arcs along the top edge */}
          {scaleArcs(segments).map((a, i) => (
            <path
              key={`sc${i}`}
              d={a.d}
              fill="none"
              stroke="#f1d27a"
              strokeWidth={1}
              opacity={0.85}
            />
          ))}

          {/* SPINES — gold triangular ridges along the dorsal line */}
          {spineTriangles(segments, t).map((s, i) => (
            <path key={`sp${i}`} d={s} fill="#e8b94a" stroke="#7a4a14" strokeWidth={0.8} />
          ))}

          {/* TAIL barb (forked) */}
          <g transform={`translate(${tail.x} ${tail.y}) rotate(${(tailAngle * 180) / Math.PI})`}>
            <path
              d="M 0 0 L -14 -10 L -28 -4 L -22 0 L -28 4 L -14 10 Z"
              fill="url(#vermillion)"
              stroke="#2a0608"
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
          </g>

          {/* FRONT WING — in front of body */}
          <g
            transform={`translate(${wing.x + 4} ${wing.y - 8}) rotate(${
              -8 + Math.sin(t * 3.4 + 0.3) * 14
            })`}
          >
            <path
              d="M 0 0
                 Q 6 -50 -10 -78
                 Q -34 -96 -64 -86
                 Q -50 -64 -42 -46
                 Q -28 -34 -18 -22
                 Q -10 -8 0 0 Z"
              fill="url(#wingFront)"
              stroke="#2a0608"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
            <path d="M 0 0 Q -12 -52 -64 -86" stroke="#2a0608" strokeWidth={1} fill="none" />
            <path d="M 0 0 Q -8 -34 -42 -46" stroke="#2a0608" strokeWidth={1} fill="none" />
            <path d="M 0 0 Q -4 -18 -18 -22" stroke="#2a0608" strokeWidth={1} fill="none" />
            {/* claw at wing tip */}
            <circle cx={-64} cy={-86} r={2} fill="#2a0608" />
          </g>

          {/* HEAD */}
          <g transform={`translate(${head.x} ${head.y}) rotate(${(headAngle * 180) / Math.PI})`}>
            {/* horn back */}
            <path d="M -10 -18 L -22 -34 L -2 -22 Z" fill="#e8b94a" stroke="#2a0608" strokeWidth={1} />
            {/* horn front */}
            <path d="M 4 -20 L 8 -38 L 14 -20 Z" fill="#f1d27a" stroke="#2a0608" strokeWidth={1} />
            {/* ear/fin */}
            <path d="M -16 -12 Q -28 -10 -22 4 Q -14 0 -10 -4 Z" fill="url(#vermillion)" stroke="#2a0608" strokeWidth={1} />

            {/* head silhouette */}
            <path
              d="M -22 -16
                 Q 8 -22 30 -10
                 Q 40 -2 38 6
                 Q 32 18 16 18
                 Q 4 22 -10 18
                 Q -26 12 -26 0
                 Q -28 -8 -22 -16 Z"
              fill="url(#vermillion)"
              stroke="#2a0608"
              strokeWidth={1.6}
              strokeLinejoin="round"
            />
            {/* jaw shadow */}
            <path
              d="M -10 18 Q 4 24 16 18 Q 4 16 -10 18 Z"
              fill="#3a0a08"
              opacity={0.5}
            />
            {/* mouth open */}
            <path
              d="M 12 8 Q 26 14 40 4 L 38 6 Q 30 12 18 12 L 14 12 Z"
              fill="#3a0a08"
              stroke="#2a0608"
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
            {/* fangs */}
            <path d="M 18 11 L 19 16 L 21 11 Z" fill="#fff8d6" />
            <path d="M 30 9 L 31 14 L 33 9 Z" fill="#fff8d6" />

            {/* forked tongue flicks */}
            <g transform={`translate(38 6)`} opacity={0.5 + 0.5 * Math.sin(t * 7)}>
              <path
                d="M 0 0 Q 8 -2 16 -1 L 22 -4 L 18 0 L 22 4 L 16 1 Q 8 2 0 0 Z"
                fill="#c2342a"
                stroke="#6e0f0d"
                strokeWidth={0.8}
              />
            </g>

            {/* nostril */}
            <ellipse cx={32} cy={-2} rx={2} ry={1.4} fill="#2a0608" />
            <circle cx={31} cy={-3} r={0.5} fill="#fff8d6" opacity={0.6} />

            {/* eye socket */}
            <ellipse cx={6} cy={-4} rx={7} ry={5.5} fill="#fff8d6" stroke="#2a0608" strokeWidth={1} />
            {/* iris */}
            <ellipse cx={7} cy={-4} rx={3} ry={5 * blink} fill="#e8b94a" />
            {/* slit pupil */}
            <ellipse cx={7} cy={-4} rx={1} ry={4.5 * blink} fill="#2a0608" />
            {/* eye shine */}
            <circle cx={6} cy={-6} r={0.9 * blink} fill="#fff" />

            {/* cheek scales — small arcs */}
            <path d="M -16 4 Q -10 6 -4 4" stroke="#7a4a14" strokeWidth={0.8} fill="none" />
            <path d="M -16 -2 Q -10 0 -4 -2" stroke="#7a4a14" strokeWidth={0.8} fill="none" />
            <path d="M -8 10 Q -2 12 6 10" stroke="#3a0a08" strokeWidth={0.8} fill="none" opacity={0.6} />
          </g>

          {/* FIRE — painted swirling puffs from the mouth */}
          {flamesRef.current.map((f) => {
            const age = t - f.born;
            if (age < 0 || age > 1.4) return null;
            const ox = head.x + Math.cos(headAngle) * 38;
            const oy = head.y + Math.sin(headAngle) * 38 + 4;
            const dist = age * f.speed;
            const fx = ox + Math.cos(headAngle + f.angle) * dist;
            const fy =
              oy + Math.sin(headAngle + f.angle) * dist - age * age * 18;
            const r = (1 - age / 1.4) * 22 * f.scale + 3;
            const isEmber = f.hue > 0.7;
            return (
              <circle
                key={f.id}
                cx={fx}
                cy={fy}
                r={r}
                fill={isEmber ? "url(#emberGrad)" : "url(#flameGrad)"}
                opacity={Math.max(0, 1 - age / 1.4)}
                filter={age > 0.5 ? "url(#softBlur)" : undefined}
              />
            );
          })}

          {/* TEXT along body curve */}
          <text
            fill="#3a1a08"
            fontFamily="Fraunces, serif"
            fontSize={11}
            fontWeight={600}
            letterSpacing={0.5}
            opacity={0.8}
          >
            <textPath href="#bodyCurve" startOffset={`${(t * 4) % 100}%`}>
              {sentence + "  ❦  " + sentence}
            </textPath>
          </text>
        </svg>
      </div>
    </ShowcaseCard>
  );
}

// Smooth Catmull-Rom-ish path through control points
function pathThrough(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

// Create a closed outline by walking the segment centerline with perpendicular offsets
function bodyOutline(segments: { x: number; y: number; r: number }[]) {
  const top: { x: number; y: number }[] = [];
  const bot: { x: number; y: number }[] = [];
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const prev = segments[Math.max(0, i - 1)];
    const next = segments[Math.min(segments.length - 1, i + 1)];
    const ang = Math.atan2(next.y - prev.y, next.x - prev.x);
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);
    top.push({ x: s.x + nx * s.r, y: s.y + ny * s.r });
    bot.push({ x: s.x - nx * s.r, y: s.y - ny * s.r });
  }
  return pathThrough(top) + " " + pathThrough(bot.reverse()).replace(/^M/, "L") + " Z";
}

// Belly: lower half of the body, slightly inset, tracking the underside
function bellyPath(segments: { x: number; y: number; r: number }[]) {
  const top: { x: number; y: number }[] = [];
  const bot: { x: number; y: number }[] = [];
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const prev = segments[Math.max(0, i - 1)];
    const next = segments[Math.min(segments.length - 1, i + 1)];
    const ang = Math.atan2(next.y - prev.y, next.x - prev.x);
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);
    const inset = s.r * 0.2;
    top.push({ x: s.x - nx * (s.r * 0.05), y: s.y - ny * (s.r * 0.05) });
    bot.push({ x: s.x - nx * (s.r - inset), y: s.y - ny * (s.r - inset) });
  }
  return pathThrough(top) + " " + pathThrough(bot.reverse()).replace(/^M/, "L") + " Z";
}

// Repeated small scallop arcs along the top of the body
function scaleArcs(segments: { x: number; y: number; r: number }[]) {
  const arcs: { d: string }[] = [];
  for (let i = 1; i < segments.length - 1; i++) {
    const s = segments[i];
    const prev = segments[i - 1];
    const next = segments[i + 1];
    const ang = Math.atan2(next.y - prev.y, next.x - prev.x);
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);
    // place 2 scales along the segment width
    for (let k = -1; k <= 1; k += 1) {
      const offset = k * s.r * 0.45;
      const cx = s.x + Math.cos(ang) * offset;
      const cy = s.y + Math.sin(ang) * offset;
      const baseX = cx + nx * s.r * 0.55;
      const baseY = cy + ny * s.r * 0.55;
      const wid = Math.max(2.5, s.r * 0.35);
      const ax = baseX + Math.cos(ang) * wid;
      const ay = baseY + Math.sin(ang) * wid;
      const bx = baseX - Math.cos(ang) * wid;
      const by = baseY - Math.sin(ang) * wid;
      const peakX = baseX + nx * wid * 0.6;
      const peakY = baseY + ny * wid * 0.6;
      arcs.push({ d: `M ${bx} ${by} Q ${peakX} ${peakY} ${ax} ${ay}` });
    }
  }
  return arcs;
}

// Triangular dorsal spines pointing outward (top) along the body
function spineTriangles(segments: { x: number; y: number; r: number }[], t: number) {
  const tris: string[] = [];
  for (let i = 2; i < segments.length - 2; i += 1) {
    const s = segments[i];
    const prev = segments[i - 1];
    const next = segments[i + 1];
    const ang = Math.atan2(next.y - prev.y, next.x - prev.x);
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);
    const baseX = s.x + nx * s.r * 0.95;
    const baseY = s.y + ny * s.r * 0.95;
    const w = Math.max(2, s.r * 0.28);
    const h = Math.max(4, s.r * 0.55) + Math.sin(t * 2 + i * 0.4) * 0.6;
    const ax = baseX + Math.cos(ang) * w;
    const ay = baseY + Math.sin(ang) * w;
    const bx = baseX - Math.cos(ang) * w;
    const by = baseY - Math.sin(ang) * w;
    const px = baseX + nx * h;
    const py = baseY + ny * h;
    tris.push(`M ${bx} ${by} L ${px} ${py} L ${ax} ${ay} Z`);
  }
  return tris;
}
