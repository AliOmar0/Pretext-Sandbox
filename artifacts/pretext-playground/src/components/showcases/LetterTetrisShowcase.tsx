import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { Button } from "@/components/ui/button";
import { RotateCcw, Layers } from "lucide-react";

const COLS = 14;
const ROWS = 18;
const CELL = 26;
const W = COLS * CELL;
const H = ROWS * CELL;

interface Cell {
  letter: string;
  hue: number;
  clearing?: number; // 0..1 fade
}

type Grid = (Cell | null)[][];

function emptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export function LetterTetrisShowcase() {
  const { text } = usePlayground();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  const letters = useMemo(() => {
    const seq = text.replace(/[^a-zA-Z]/g, "").toUpperCase();
    return seq || "PRETEXTPLAYGROUND";
  }, [text]);
  const lettersIdx = useRef(0);

  const [grid, setGrid] = useState<Grid>(emptyGrid);
  const gridRef = useRef<Grid>(grid);
  gridRef.current = grid;

  const [piece, setPiece] = useState<{ x: number; y: number; letter: string; hue: number } | null>(null);
  const pieceRef = useRef(piece);
  pieceRef.current = piece;

  const [nextLetter, setNextLetter] = useState<string>(letters[0] ?? "A");
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const dropMs = useRef(550);
  const lastDrop = useRef(performance.now());
  const lastFrame = useRef(performance.now());
  const softDrop = useRef(false);

  // Spawn first piece
  useEffect(() => {
    if (!piece && !gameOver) {
      const ch = letters[lettersIdx.current % letters.length];
      lettersIdx.current++;
      setNextLetter(letters[lettersIdx.current % letters.length]);
      const x = Math.floor(COLS / 2);
      const y = 0;
      if (gridRef.current[y][x]) {
        setGameOver(true);
        return;
      }
      setPiece({ x, y, letter: ch, hue: (lettersIdx.current * 23) % 360 });
    }
  }, [piece, gameOver, letters]);

  // Reset/init letter sequence when text changes
  useEffect(() => {
    lettersIdx.current = 0;
    setNextLetter(letters[0] ?? "A");
  }, [letters]);

  const collide = (g: Grid, x: number, y: number) =>
    x < 0 || x >= COLS || y >= ROWS || (y >= 0 && !!g[y][x]);

  const placeAndAdvance = () => {
    const p = pieceRef.current;
    if (!p) return;
    const g: Grid = gridRef.current.map((row) => row.slice());
    if (p.y < 0) {
      setGameOver(true);
      setPiece(null);
      return;
    }
    g[p.y][p.x] = { letter: p.letter, hue: p.hue };
    // Detect cleared rows
    const clearedRows: number[] = [];
    for (let y = 0; y < ROWS; y++) {
      if (g[y].every((c) => c !== null)) clearedRows.push(y);
    }
    if (clearedRows.length > 0) {
      // mark for clearing animation, then drop
      for (const y of clearedRows) {
        for (let x = 0; x < COLS; x++) {
          g[y][x] = { ...(g[y][x] as Cell), clearing: 0.001 };
        }
      }
      setGrid(g);
      setLines((l) => l + clearedRows.length);
      setScore((s) => s + clearedRows.length * clearedRows.length * 100);
      // Speed up
      dropMs.current = Math.max(120, dropMs.current - clearedRows.length * 20);
      // After 280ms, remove cleared rows
      setTimeout(() => {
        setGrid((cur) => {
          const newG: Grid = [];
          for (let y = 0; y < ROWS; y++) {
            if (clearedRows.includes(y)) continue;
            newG.push(cur[y].slice());
          }
          while (newG.length < ROWS) newG.unshift(Array(COLS).fill(null));
          return newG;
        });
      }, 280);
    } else {
      setGrid(g);
    }
    setPiece(null);
  };

  // Game loop (gravity + clearing fade)
  useEffect(() => {
    if (gameOver) return;
    let raf = 0;
    const loop = (now: number) => {
      const dt = now - lastFrame.current;
      lastFrame.current = now;
      void dt;
      const interval = softDrop.current ? Math.min(60, dropMs.current) : dropMs.current;
      if (now - lastDrop.current > interval) {
        lastDrop.current = now;
        const p = pieceRef.current;
        if (p) {
          if (collide(gridRef.current, p.x, p.y + 1)) {
            placeAndAdvance();
          } else {
            setPiece({ ...p, y: p.y + 1 });
          }
        }
      }
      // Animate clearing
      let needsUpdate = false;
      const g = gridRef.current;
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const c = g[y][x];
          if (c?.clearing !== undefined) {
            needsUpdate = true;
            const v = Math.min(1, c.clearing + 0.06);
            g[y][x] = { ...c, clearing: v };
          }
        }
      }
      if (needsUpdate) {
        setGrid(g.map((r) => r.slice()));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [gameOver]);

  // keyboard
  useEffect(() => {
    if (!active || gameOver) return;
    const onKey = (e: KeyboardEvent) => {
      const p = pieceRef.current;
      if (!p) return;
      if (e.key === "ArrowLeft" || e.key === "a") {
        e.preventDefault();
        if (!collide(gridRef.current, p.x - 1, p.y)) setPiece({ ...p, x: p.x - 1 });
      } else if (e.key === "ArrowRight" || e.key === "d") {
        e.preventDefault();
        if (!collide(gridRef.current, p.x + 1, p.y)) setPiece({ ...p, x: p.x + 1 });
      } else if (e.key === "ArrowDown" || e.key === "s") {
        e.preventDefault();
        softDrop.current = true;
      } else if (e.key === " ") {
        e.preventDefault();
        // hard drop
        let yy = p.y;
        while (!collide(gridRef.current, p.x, yy + 1)) yy++;
        setPiece({ ...p, y: yy });
        // place on next tick
        lastDrop.current = 0;
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "s") softDrop.current = false;
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
    };
  }, [active, gameOver]);

  const restart = () => {
    setGrid(emptyGrid());
    setPiece(null);
    setScore(0);
    setLines(0);
    setGameOver(false);
    dropMs.current = 550;
    lettersIdx.current = 0;
    lastDrop.current = performance.now();
  };

  return (
    <ShowcaseCard
      showcaseId="letter-tetris"
      title="Letter Tetris"
      description="Letters from your text fall one by one. Arrows or A/D to move, ↓ to soft drop, space to slam. Fill a row to clear it."
      controls={
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="tabular-nums text-muted-foreground">
            <Layers className="inline w-3 h-3 mr-0.5 text-cyan-500" />
            {score}
          </span>
          <span className="tabular-nums text-muted-foreground/70">lines {lines}</span>
          <span className="tabular-nums text-muted-foreground/70">next {nextLetter}</span>
          <Button size="sm" variant="outline" onClick={restart}>
            <RotateCcw className="w-3 h-3 mr-1.5" />
            Reset
          </Button>
        </div>
      }
    >
      <div
        ref={wrapRef}
        tabIndex={0}
        onPointerEnter={() => setActive(true)}
        onPointerLeave={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        onClick={() => wrapRef.current?.focus()}
        className="relative w-full mx-auto rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
        style={{
          maxWidth: W,
          aspectRatio: `${W} / ${H}`,
          background: "linear-gradient(180deg, #0e1430 0%, #060815 100%)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* grid lines */}
          {Array.from({ length: COLS + 1 }).map((_, x) => (
            <line key={`vx${x}`} x1={x * CELL} y1={0} x2={x * CELL} y2={H} stroke="rgba(255,255,255,0.04)" />
          ))}
          {Array.from({ length: ROWS + 1 }).map((_, y) => (
            <line key={`hy${y}`} x1={0} y1={y * CELL} x2={W} y2={y * CELL} stroke="rgba(255,255,255,0.04)" />
          ))}

          {/* placed cells */}
          {grid.map((row, y) =>
            row.map((c, x) => {
              if (!c) return null;
              const fade = c.clearing ?? 0;
              return (
                <g key={`${x},${y}`} opacity={1 - fade * 0.95} transform={`translate(${x * CELL} ${y * CELL}) ${fade > 0 ? `scale(${1 + fade * 0.4}) translate(${-fade * CELL * 0.2} ${-fade * CELL * 0.2})` : ""}`}>
                  <rect
                    x={1}
                    y={1}
                    width={CELL - 2}
                    height={CELL - 2}
                    rx={4}
                    fill={`hsl(${c.hue}, 70%, 60%)`}
                    stroke={`hsl(${c.hue}, 80%, 80%)`}
                    strokeWidth={1}
                  />
                  <text
                    x={CELL / 2}
                    y={CELL / 2 + 5}
                    textAnchor="middle"
                    fontFamily="Fraunces, serif"
                    fontSize={15}
                    fontWeight={800}
                    fill="rgba(0,0,0,0.7)"
                  >
                    {c.letter}
                  </text>
                </g>
              );
            }),
          )}

          {/* falling piece */}
          {piece && piece.y >= 0 && (
            <g transform={`translate(${piece.x * CELL} ${piece.y * CELL})`}>
              <rect
                x={1}
                y={1}
                width={CELL - 2}
                height={CELL - 2}
                rx={4}
                fill={`hsl(${piece.hue}, 80%, 65%)`}
                stroke="#fff"
                strokeWidth={1.5}
                style={{ filter: `drop-shadow(0 0 10px hsla(${piece.hue}, 80%, 60%, 0.8))` }}
              />
              <text
                x={CELL / 2}
                y={CELL / 2 + 5}
                textAnchor="middle"
                fontFamily="Fraunces, serif"
                fontSize={15}
                fontWeight={800}
                fill="rgba(0,0,0,0.85)"
              >
                {piece.letter}
              </text>
            </g>
          )}
        </svg>

        {!active && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-cyan-300/85 text-xs font-mono uppercase tracking-[0.2em] bg-black/55 px-3 py-1.5 rounded">
              Hover · arrows + space
            </p>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#fefaf0] rounded-lg p-6 text-center shadow-2xl">
              <p className="font-serif text-2xl text-foreground">Stack overflow.</p>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                {score} pts · {lines} lines
              </p>
              <Button size="sm" className="mt-4" onClick={restart}>
                <RotateCcw className="w-3 h-3 mr-1.5" />
                Play again
              </Button>
            </div>
          </div>
        )}
      </div>
    </ShowcaseCard>
  );
}
