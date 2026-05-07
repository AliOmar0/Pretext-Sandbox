import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { Button } from "@/components/ui/button";
import { RotateCcw, Wind } from "lucide-react";

const GRID_W = 240;
const GRID_H = 110;
const SCALE = 3;
const CANVAS_W = GRID_W * SCALE;
const CANVAS_H = GRID_H * SCALE;

// 0 = empty, 1..N = palette index
const PALETTE = [
  "#000000", // unused (empty)
  "#f97316",
  "#ec4899",
  "#facc15",
  "#22d3ee",
  "#a78bfa",
  "#fb7185",
  "#34d399",
];

function colorOf(idx: number): [number, number, number] {
  const hex = PALETTE[idx];
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export function SandLettersShowcase() {
  const { text } = usePlayground();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<Uint8Array>(new Uint8Array(GRID_W * GRID_H));
  const flipRef = useRef(false);
  const mouse = useRef<{ x: number; y: number; down: boolean; lastX: number; lastY: number }>({
    x: -1,
    y: -1,
    down: false,
    lastX: -1,
    lastY: -1,
  });
  const [paused, setPaused] = useState(false);

  const phrase = useMemo(() => {
    const words = text.replace(/\s+/g, " ").trim().split(" ").slice(0, 4).join(" ");
    return (words || "Pretext Playground").toUpperCase();
  }, [text]);

  // Seed letters into the sand grid using an offscreen canvas
  const seed = () => {
    const off = document.createElement("canvas");
    off.width = GRID_W;
    off.height = GRID_H;
    const octx = off.getContext("2d");
    if (!octx) return;
    octx.fillStyle = "#000";
    octx.fillRect(0, 0, GRID_W, GRID_H);
    octx.fillStyle = "#fff";
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    // Pick a font size that fits the phrase
    let size = 60;
    octx.font = `800 ${size}px Fraunces, serif`;
    while (octx.measureText(phrase).width > GRID_W - 12 && size > 12) {
      size -= 2;
      octx.font = `800 ${size}px Fraunces, serif`;
    }
    octx.fillText(phrase, GRID_W / 2, GRID_H / 2);
    const data = octx.getImageData(0, 0, GRID_W, GRID_H).data;
    const grid = new Uint8Array(GRID_W * GRID_H);
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const i = (y * GRID_W + x) * 4;
        if (data[i] > 128) {
          // colour by horizontal position for a gradient feel
          const palIdx = 1 + Math.floor((x / GRID_W) * (PALETTE.length - 1));
          grid[y * GRID_W + x] = palIdx;
        }
      }
    }
    gridRef.current = grid;
  };

  useEffect(() => {
    seed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phrase]);

  // Simulation + render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = GRID_W;
    canvas.height = GRID_H;
    const img = ctx.createImageData(GRID_W, GRID_H);
    let raf = 0;

    const step = () => {
      const grid = gridRef.current;
      if (!paused) {
        const flip = (flipRef.current = !flipRef.current);
        // Iterate from bottom-1 row up so we don't move the same particle twice
        for (let y = GRID_H - 2; y >= 0; y--) {
          // Alternate left-to-right vs right-to-left to avoid bias
          const rev = flip;
          for (let xx = 0; xx < GRID_W; xx++) {
            const x = rev ? GRID_W - 1 - xx : xx;
            const i = y * GRID_W + x;
            const v = grid[i];
            if (!v) continue;
            const below = i + GRID_W;
            if (!grid[below]) {
              grid[below] = v;
              grid[i] = 0;
              continue;
            }
            // Try diagonal slide; alternate preferred side per frame
            const dirs: number[] = flip ? [-1, 1] : [1, -1];
            for (const dx of dirs) {
              const nx = x + dx;
              if (nx < 0 || nx >= GRID_W) continue;
              const di = below + dx;
              if (!grid[di]) {
                grid[di] = v;
                grid[i] = 0;
                break;
              }
            }
          }
        }

        // Pointer interaction: erase under cursor while held, or just hover dust
        if (mouse.current.x >= 0) {
          const r = mouse.current.down ? 6 : 3;
          const mx = mouse.current.x;
          const my = mouse.current.y;
          for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
              if (dx * dx + dy * dy > r * r) continue;
              const x = mx + dx;
              const y = my + dy;
              if (x < 0 || y < 0 || x >= GRID_W || y >= GRID_H) continue;
              if (mouse.current.down) {
                grid[y * GRID_W + x] = 0;
              }
            }
          }
        }
      }

      // Render grid → ImageData
      const grid2 = gridRef.current;
      const buf = img.data;
      for (let i = 0; i < grid2.length; i++) {
        const v = grid2[i];
        const o = i * 4;
        if (v) {
          const [r, g, b] = colorOf(v);
          buf[o] = r;
          buf[o + 1] = g;
          buf[o + 2] = b;
          buf[o + 3] = 255;
        } else {
          buf[o] = 8;
          buf[o + 1] = 6;
          buf[o + 2] = 14;
          buf[o + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const cellFromEvent = (e: React.PointerEvent) => {
    const r = wrapRef.current!.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * GRID_W);
    const y = Math.floor(((e.clientY - r.top) / r.height) * GRID_H);
    return { x, y };
  };

  const onMove = (e: React.PointerEvent) => {
    const { x, y } = cellFromEvent(e);
    // draw a line segment from last position to current to avoid gaps when moving fast
    if (mouse.current.lastX >= 0) {
      const grid = gridRef.current;
      const dx = x - mouse.current.lastX;
      const dy = y - mouse.current.lastY;
      const steps = Math.max(Math.abs(dx), Math.abs(dy));
      if (mouse.current.down && steps > 0) {
        for (let s = 0; s <= steps; s++) {
          const px = Math.round(mouse.current.lastX + (dx * s) / steps);
          const py = Math.round(mouse.current.lastY + (dy * s) / steps);
          const r = 6;
          for (let yy = -r; yy <= r; yy++) {
            for (let xx = -r; xx <= r; xx++) {
              if (xx * xx + yy * yy > r * r) continue;
              const gx = px + xx;
              const gy = py + yy;
              if (gx < 0 || gy < 0 || gx >= GRID_W || gy >= GRID_H) continue;
              grid[gy * GRID_W + gx] = 0;
            }
          }
        }
      }
    }
    mouse.current.x = x;
    mouse.current.y = y;
    mouse.current.lastX = x;
    mouse.current.lastY = y;
  };
  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    mouse.current.down = true;
    onMove(e);
  };
  const onUp = () => {
    mouse.current.down = false;
    mouse.current.lastX = -1;
    mouse.current.lastY = -1;
  };
  const onLeave = () => {
    mouse.current.x = -1;
    mouse.current.y = -1;
    mouse.current.down = false;
    mouse.current.lastX = -1;
    mouse.current.lastY = -1;
  };

  return (
    <ShowcaseCard
      showcaseId="sand-letters"
      title="Sand Letters"
      description="Your text is built from coloured sand. Drag through the letters to make them collapse — change the source to reform new words."
      controls={
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setPaused((p) => !p)}>
            <Wind className="w-3 h-3 mr-1.5" />
            {paused ? "Resume" : "Pause"}
          </Button>
          <Button size="sm" variant="outline" onClick={seed}>
            <RotateCcw className="w-3 h-3 mr-1.5" />
            Reform
          </Button>
        </div>
      }
    >
      <div
        ref={wrapRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onLeave}
        className="relative w-full mx-auto rounded-lg overflow-hidden cursor-crosshair select-none"
        style={{
          maxWidth: CANVAS_W,
          aspectRatio: `${GRID_W} / ${GRID_H}`,
          background: "#08060e",
          touchAction: "none",
        }}
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
          style={{ imageRendering: "pixelated" }}
        />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/60 bg-black/40 px-2.5 py-1 rounded pointer-events-none">
          Drag to disturb
        </div>
      </div>
    </ShowcaseCard>
  );
}
