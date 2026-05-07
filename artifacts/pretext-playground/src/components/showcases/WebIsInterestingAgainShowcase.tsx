import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

const BOX_H = 460;
const PAD_X = 28;
const PAD_Y = 28;
const FONT_HEAD = "800 52px Fraunces, serif";
const FONT_BODY = "600 20px Fraunces, serif";
const LINE_HEAD = 56;
const LINE_BODY = 30;
const HEAD_BODY_GAP = 18;

interface LaidWord {
  text: string;
  cx: number; // center x
  cy: number; // center y (baseline-ish)
  w: number;
  h: number;
  font: string;
  size: number;
  weight: number;
}

let measureCanvas: HTMLCanvasElement | null = null;
function measure(font: string, text: string) {
  if (!measureCanvas) measureCanvas = document.createElement("canvas");
  const ctx = measureCanvas.getContext("2d")!;
  ctx.font = font;
  return ctx.measureText(text).width;
}

function wrapLine(
  words: string[],
  font: string,
  maxW: number,
  spaceW = 6,
): { text: string; x: number; w: number }[][] {
  const lines: { text: string; x: number; w: number }[][] = [[]];
  let x = 0;
  for (const word of words) {
    const w = measure(font, word);
    const cur = lines[lines.length - 1];
    if (x + w > maxW && cur.length) {
      lines.push([]);
      x = 0;
    }
    lines[lines.length - 1].push({ text: word, x, w });
    x += w + spaceW;
  }
  return lines;
}

export function WebIsInterestingAgainShowcase() {
  const { text } = usePlayground();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0, in: false });
  const [size, setSize] = useState({ w: 700, h: BOX_H });
  const [, setTick] = useState(0);

  // Split source text: short headline (first clause, up to ~6 words) + body
  const { headline, body } = useMemo(() => {
    const trimmed = text.replace(/\s+/g, " ").trim();
    // Take up to first comma/dash/period, capped at 6 words
    const clauseMatch = trimmed.match(/^([^,.!?\n;:—-]{1,80})/);
    let head = clauseMatch ? clauseMatch[1].trim() : trimmed;
    const headWords = head.split(/\s+/).slice(0, 6);
    head = headWords.join(" ");
    const rest = trimmed.slice(head.length).replace(/^[\s,.;:—-]+/, "");
    return { headline: head.toUpperCase(), body: rest };
  }, [text]);

  // Resize observer — sync container size and canvas backing buffer
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const apply = () => {
      const r = wrap.getBoundingClientRect();
      setSize({ w: r.width, h: BOX_H });
      const c = canvasRef.current;
      if (c) {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        c.width = Math.max(1, Math.round(r.width * dpr));
        c.height = Math.max(1, Math.round(BOX_H * dpr));
      }
    };
    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    apply();
    return () => ro.disconnect();
  }, []);

  // Animated "video" — colorful fluid blobs on canvas
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const blobs = [
      { phase: 0.0, color: "#ff6b35" },
      { phase: 1.3, color: "#f7931e" },
      { phase: 2.6, color: "#ec4899" },
      { phase: 3.9, color: "#7c3aed" },
      { phase: 5.2, color: "#06b6d4" },
      { phase: 0.7, color: "#facc15" },
    ];
    let raf = 0;
    const draw = (now: number) => {
      const t = now / 1000;
      const W = c.width;
      const H = c.height;
      ctx.fillStyle = "#160a04";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (const b of blobs) {
        const bx = W * 0.5 + Math.cos(t * 0.55 + b.phase) * W * 0.42;
        const by = H * 0.5 + Math.sin(t * 0.75 + b.phase * 1.3) * H * 0.4;
        const r = Math.max(W, H) * 0.45;
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, r);
        g.addColorStop(0, b.color + "dd");
        g.addColorStop(0.55, b.color + "55");
        g.addColorStop(1, b.color + "00");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      // Cursor halo — interactive blob that follows pointer
      if (mouse.current.in) {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const mx = mouse.current.x * dpr;
        const my = mouse.current.y * dpr;
        const r = Math.max(W, H) * 0.32;
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, r);
        g.addColorStop(0, "#fff5dccc");
        g.addColorStop(0.5, "#ffb84d77");
        g.addColorStop(1, "#ff6b3500");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.globalCompositeOperation = "source-over";
      // Drive React re-render of overlaid words for cursor reactivity
      setTick((x) => (x + 1) % 1_000_000);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Layout words (headline + body) with cursor reactivity
  const layout: LaidWord[] = useMemo(() => {
    const out: LaidWord[] = [];
    const innerW = size.w - PAD_X * 2;
    const headWords = headline.split(" ").filter(Boolean);
    const headLines = wrapLine(headWords, FONT_HEAD, innerW, 10);
    let y = PAD_Y;
    for (const line of headLines) {
      for (const w of line) {
        out.push({
          text: w.text,
          cx: PAD_X + w.x + w.w / 2,
          cy: y + LINE_HEAD * 0.78,
          w: w.w,
          h: LINE_HEAD,
          font: FONT_HEAD,
          size: 52,
          weight: 800,
        });
      }
      y += LINE_HEAD;
    }
    y += HEAD_BODY_GAP;
    const bodyWords = body.split(" ").filter(Boolean);
    const bodyLines = wrapLine(bodyWords, FONT_BODY, innerW, 6);
    for (const line of bodyLines) {
      if (y + LINE_BODY > size.h - PAD_Y) break;
      for (const w of line) {
        out.push({
          text: w.text,
          cx: PAD_X + w.x + w.w / 2,
          cy: y + LINE_BODY * 0.75,
          w: w.w,
          h: LINE_BODY,
          font: FONT_BODY,
          size: 20,
          weight: 600,
        });
      }
      y += LINE_BODY;
    }
    return out;
  }, [headline, body, size.w, size.h]);

  // Per-word cursor offset — words push away from the cursor like a soft field
  function offset(cx: number, cy: number, radius: number) {
    if (!mouse.current.in) return { dx: 0, dy: 0, scale: 1 };
    const dx0 = cx - mouse.current.x;
    const dy0 = cy - mouse.current.y;
    const d = Math.hypot(dx0, dy0);
    if (d > radius) return { dx: 0, dy: 0, scale: 1 };
    const force = 1 - d / radius;
    const f = force * force;
    const ux = d > 0.001 ? dx0 / d : 0;
    const uy = d > 0.001 ? dy0 / d : -1;
    return {
      dx: ux * f * 22,
      dy: uy * f * 22,
      scale: 1 + f * 0.08,
    };
  }

  const onMove = (e: React.PointerEvent) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    mouse.current.x = e.clientX - r.left;
    mouse.current.y = e.clientY - r.top;
    mouse.current.in = true;
  };
  const onLeave = () => {
    mouse.current.in = false;
  };

  return (
    <ShowcaseCard
      showcaseId="web-is-interesting"
      title="The Web Is Interesting Again"
      description="The text is a window into a moving image. Drift the cursor — the words lean away and the colors follow your pointer."
    >
      <div
        ref={wrapRef}
        onPointerMove={onMove}
        onPointerEnter={onMove}
        onPointerLeave={onLeave}
        className="relative w-full rounded-lg overflow-hidden select-none"
        style={{ height: BOX_H, background: "#0a0604", touchAction: "none" }}
      >
        {/* Animated "video" backdrop */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Paper overlay with text-shaped holes — words become windows into the video */}
        <svg
          viewBox={`0 0 ${size.w} ${size.h}`}
          width={size.w}
          height={size.h}
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          <defs>
            <mask id="paper-hole-wia" maskUnits="userSpaceOnUse">
              <rect width={size.w} height={size.h} fill="white" />
              {layout.map((wd, i) => {
                const o = offset(wd.cx, wd.cy, 150);
                return (
                  <text
                    key={`m-${i}`}
                    x={wd.cx + o.dx}
                    y={wd.cy + o.dy}
                    textAnchor="middle"
                    fontFamily="Fraunces, serif"
                    fontSize={wd.size * o.scale}
                    fontWeight={wd.weight}
                    fill="black"
                  >
                    {wd.text}
                  </text>
                );
              })}
            </mask>
          </defs>
          {/* Warm paper covers everything except the text shapes */}
          <rect
            width={size.w}
            height={size.h}
            fill="#f6ecd3"
            mask="url(#paper-hole-wia)"
          />

          {/* Subtle outline strokes on the same word positions for crispness */}
          {layout.map((wd, i) => {
            const o = offset(wd.cx, wd.cy, 150);
            return (
              <text
                key={`o-${i}`}
                x={wd.cx + o.dx}
                y={wd.cy + o.dy}
                textAnchor="middle"
                fontFamily="Fraunces, serif"
                fontSize={wd.size * o.scale}
                fontWeight={wd.weight}
                fill="none"
                stroke="rgba(58, 26, 8, 0.35)"
                strokeWidth={0.6}
              >
                {wd.text}
              </text>
            );
          })}
        </svg>

        {/* Hint */}
        {!mouse.current.in && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-medium tracking-wide uppercase text-[#3a1a08]/70 bg-[#f6ecd3]/85 backdrop-blur px-3 py-1.5 rounded-full pointer-events-none">
            Move your cursor across the headline
          </div>
        )}
      </div>
    </ShowcaseCard>
  );
}
