import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy } from "lucide-react";

const COLS = 26;
const ROWS = 14;
const CELL = 22;
const W = COLS * CELL;
const H = ROWS * CELL;

interface Cell {
  x: number;
  y: number;
  letter: string;
}

const DIRS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
} as const;

function initialSnake(): Cell[] {
  const cy = Math.floor(ROWS / 2);
  return [
    { x: 6, y: cy, letter: "" },
    { x: 5, y: cy, letter: "" },
    { x: 4, y: cy, letter: "" },
    { x: 3, y: cy, letter: "" },
  ];
}

function randomEmptyCell(occupied: Set<string>): { x: number; y: number } {
  for (let i = 0; i < 200; i++) {
    const x = Math.floor(Math.random() * COLS);
    const y = Math.floor(Math.random() * ROWS);
    if (!occupied.has(`${x},${y}`)) return { x, y };
  }
  // fallback scan
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!occupied.has(`${x},${y}`)) return { x, y };
    }
  }
  return { x: 0, y: 0 };
}

export function WordSnakeShowcase() {
  const { text } = usePlayground();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  const letters = useMemo(() => {
    const seq = text.replace(/[^a-zA-Z]/g, "");
    return (seq || "typography").toUpperCase();
  }, [text]);

  const [snake, setSnake] = useState<Cell[]>(() => initialSnake());
  const [dir, setDir] = useState<{ x: number; y: number }>({ x: 1, y: 0 });
  const dirRef = useRef(dir);
  dirRef.current = dir;
  const nextDir = useRef<{ x: number; y: number }>({ x: 1, y: 0 });

  const [pelletIdx, setPelletIdx] = useState(0);
  const [pellet, setPellet] = useState<{ x: number; y: number }>({ x: 18, y: 7 });
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [eaten, setEaten] = useState("");
  const [speed, setSpeed] = useState(140);

  // tick loop
  useEffect(() => {
    if (gameOver) return;
    const t = setInterval(() => {
      setSnake((prev) => {
        const d = nextDir.current;
        // Disallow direct reverse
        if (
          prev.length > 1 &&
          d.x === -dirRef.current.x &&
          d.y === -dirRef.current.y
        ) {
          // ignore
        } else {
          dirRef.current = d;
          setDir(d);
        }
        const cur = dirRef.current;
        const head = prev[0];
        const nx = head.x + cur.x;
        const ny = head.y + cur.y;
        // wall
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) {
          setGameOver(true);
          return prev;
        }
        // self collision
        for (let i = 0; i < prev.length - 1; i++) {
          if (prev[i].x === nx && prev[i].y === ny) {
            setGameOver(true);
            return prev;
          }
        }
        const ate = nx === pellet.x && ny === pellet.y;
        if (ate) {
          const ch = letters[pelletIdx % letters.length] ?? "";
          setEaten((e) => e + ch);
          setScore((s) => s + 1);
          setSpeed((sp) => Math.max(60, sp - 4));
          // place next pellet
          const occ = new Set<string>();
          occ.add(`${nx},${ny}`);
          for (const c of prev) occ.add(`${c.x},${c.y}`);
          const next = randomEmptyCell(occ);
          setPellet(next);
          setPelletIdx((i) => i + 1);
          return [{ x: nx, y: ny, letter: ch }, ...prev];
        }
        // shift letters down the body so eaten letters travel toward the tail
        const newCells: Cell[] = [
          { x: nx, y: ny, letter: prev[0].letter },
          ...prev.slice(0, -1).map((c, i) => ({ ...c, letter: prev[i].letter })),
        ];
        // reassign letter chain: head gets prev head's letter; subsequent get prev[i-1]'s letter (already done above for indices 1..n-1 via prev[i])
        // Above mapping incorrectly uses prev[i]; fix:
        for (let i = 1; i < newCells.length; i++) {
          newCells[i].letter = prev[i - 1].letter;
        }
        // Actually we want letters to travel toward tail: cell i (i>0) takes letter from prev[i-1]? No — letters should stay with the cell they entered. As the snake moves, cell at index i now occupies what was prev[i-1]'s position — so it should also inherit prev[i-1]'s letter. That's exactly what above does.
        return newCells;
      });
    }, speed);
    return () => clearInterval(t);
  }, [gameOver, pellet.x, pellet.y, pelletIdx, letters, speed]);

  // game over → update best
  useEffect(() => {
    if (gameOver && score > best) setBest(score);
  }, [gameOver, score, best]);

  // keyboard
  useEffect(() => {
    if (!active || gameOver) return;
    const onKey = (e: KeyboardEvent) => {
      const d = (DIRS as Record<string, { x: number; y: number }>)[e.key];
      if (!d) return;
      e.preventDefault();
      nextDir.current = d;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, gameOver]);

  const restart = () => {
    setSnake(initialSnake());
    setDir({ x: 1, y: 0 });
    dirRef.current = { x: 1, y: 0 };
    nextDir.current = { x: 1, y: 0 };
    setPelletIdx(0);
    setPellet({ x: 18, y: 7 });
    setScore(0);
    setEaten("");
    setSpeed(140);
    setGameOver(false);
  };

  const pelletLetter = letters[pelletIdx % letters.length] ?? "";

  return (
    <ShowcaseCard
      showcaseId="word-snake"
      title="Word Snake"
      description="Arrow keys or WASD. Eat letters to spell out the source text — they travel down your body as you grow."
      controls={
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="tabular-nums text-muted-foreground">
            <Trophy className="inline w-3 h-3 mr-0.5 text-amber-500" />
            {score}
          </span>
          {best > 0 && (
            <span className="tabular-nums text-muted-foreground/70">best {best}</span>
          )}
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
        className="relative w-full mx-auto rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
        style={{
          maxWidth: W,
          aspectRatio: `${W} / ${H}`,
          background:
            "radial-gradient(ellipse at 50% 50%, #0f1f17 0%, #07120c 70%, #030806 100%)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* grid */}
          {Array.from({ length: ROWS }).map((_, y) =>
            Array.from({ length: COLS }).map((_, x) => (
              <rect
                key={`${x},${y}`}
                x={x * CELL}
                y={y * CELL}
                width={CELL}
                height={CELL}
                fill={(x + y) % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"}
              />
            )),
          )}

          {/* pellet */}
          <g transform={`translate(${pellet.x * CELL + CELL / 2} ${pellet.y * CELL + CELL / 2})`}>
            <circle
              r={CELL / 2 - 2}
              fill="#facc15"
              opacity={0.95}
              style={{ filter: "drop-shadow(0 0 8px rgba(250,204,21,0.7))" }}
            >
              <animate attributeName="r" values={`${CELL / 2 - 4};${CELL / 2 - 2};${CELL / 2 - 4}`} dur="1.2s" repeatCount="indefinite" />
            </circle>
            <text
              textAnchor="middle"
              y={5}
              fontFamily="Fraunces, serif"
              fontSize={14}
              fontWeight={700}
              fill="#1a1208"
            >
              {pelletLetter}
            </text>
          </g>

          {/* snake */}
          {snake.map((c, i) => {
            const isHead = i === 0;
            const hue = 150 + (i * 6) % 80;
            return (
              <g key={i}>
                <rect
                  x={c.x * CELL + 1}
                  y={c.y * CELL + 1}
                  width={CELL - 2}
                  height={CELL - 2}
                  rx={4}
                  fill={isHead ? "#34d399" : `hsl(${hue}, 70%, 55%)`}
                  stroke={isHead ? "#a7f3d0" : "rgba(0,0,0,0.2)"}
                  strokeWidth={1}
                />
                {c.letter && (
                  <text
                    x={c.x * CELL + CELL / 2}
                    y={c.y * CELL + CELL / 2 + 4}
                    textAnchor="middle"
                    fontFamily="Fraunces, serif"
                    fontSize={12}
                    fontWeight={700}
                    fill="#0a1f15"
                  >
                    {c.letter}
                  </text>
                )}
                {isHead && (
                  <>
                    <circle
                      cx={c.x * CELL + CELL / 2 + dir.x * 4 + (dir.x === 0 ? -3 : 0)}
                      cy={c.y * CELL + CELL / 2 + dir.y * 4 + (dir.y === 0 ? -3 : 0)}
                      r={1.6}
                      fill="#0a1f15"
                    />
                    <circle
                      cx={c.x * CELL + CELL / 2 + dir.x * 4 + (dir.x === 0 ? 3 : 0)}
                      cy={c.y * CELL + CELL / 2 + dir.y * 4 + (dir.y === 0 ? 3 : 0)}
                      r={1.6}
                      fill="#0a1f15"
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {!active && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-emerald-300/85 text-sm font-mono uppercase tracking-[0.2em] bg-black/50 px-4 py-2 rounded">
              Hover here · arrows or WASD
            </p>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#fefaf0] rounded-lg p-6 text-center shadow-2xl max-w-md">
              <p className="font-serif text-2xl text-foreground">You ate {score} letters.</p>
              {eaten && (
                <p className="font-mono text-sm text-muted-foreground mt-2 break-words">
                  &ldquo;{eaten}&rdquo;
                </p>
              )}
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
