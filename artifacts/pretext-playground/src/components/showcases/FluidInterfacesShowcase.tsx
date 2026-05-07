import { useState, useMemo } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { motion, AnimatePresence } from "framer-motion";

interface Glyph {
  match: RegExp;
  label: string;
  svg: React.ReactNode;
}

const GLYPHS: Glyph[] = [
  {
    match: /\b(mountain|mountains|peak|peaks)\b/i,
    label: "mountain",
    svg: (
      <svg viewBox="0 0 60 40" className="w-full h-full">
        <path d="M 2 36 L 22 10 L 32 22 L 44 6 L 58 36 Z" fill="#5a7a8c" />
        <path d="M 18 14 L 22 10 L 26 14 L 24 16 L 22 14 L 20 16 Z" fill="#fff" />
        <path d="M 41 9 L 44 6 L 47 9 L 45 11 L 44 10 L 43 11 Z" fill="#fff" />
      </svg>
    ),
  },
  {
    match: /\b(water|wave|waves|ocean|sea|river|fluid)\b/i,
    label: "water",
    svg: (
      <svg viewBox="0 0 60 40" className="w-full h-full">
        <path d="M 0 22 Q 10 14 20 22 T 40 22 T 60 22 V 40 H 0 Z" fill="#4aa3d4" />
        <path d="M 0 30 Q 10 22 20 30 T 40 30 T 60 30 V 40 H 0 Z" fill="#357fb0" opacity={0.7} />
      </svg>
    ),
  },
  {
    match: /\b(type|typography|typographer|typefaces?|letters?|word|words|text)\b/i,
    label: "type",
    svg: (
      <svg viewBox="0 0 60 40" className="w-full h-full">
        <text x={30} y={30} textAnchor="middle" fontFamily="Fraunces, serif" fontSize={32} fontWeight={700} fill="hsl(10, 76%, 53%)">Aa</text>
      </svg>
    ),
  },
  {
    match: /\b(web|interface|interfaces|browser|page)\b/i,
    label: "web",
    svg: (
      <svg viewBox="0 0 60 40" className="w-full h-full">
        <rect x={4} y={6} width={52} height={30} rx={2} fill="#fff" stroke="#2a1a0e" strokeWidth={1.5} />
        <rect x={4} y={6} width={52} height={6} fill="#e8d6b8" />
        <circle cx={8} cy={9} r={1} fill="hsl(10, 76%, 53%)" />
        <rect x={8} y={16} width={36} height={2} fill="#bcae90" />
        <rect x={8} y={20} width={28} height={2} fill="#bcae90" />
        <rect x={8} y={24} width={32} height={2} fill="#bcae90" />
      </svg>
    ),
  },
  {
    match: /\b(spring|bounce|bouncing|elastic|physics)\b/i,
    label: "spring",
    svg: (
      <svg viewBox="0 0 60 40" className="w-full h-full">
        <path d="M 30 4 L 30 10 M 20 12 L 40 14 L 20 18 L 40 20 L 20 24 L 40 26" stroke="hsl(10, 76%, 53%)" strokeWidth={2} fill="none" strokeLinejoin="round" />
        <circle cx={30} cy={32} r={5} fill="hsl(10, 76%, 53%)" />
      </svg>
    ),
  },
  {
    match: /\b(flow|flowing|flows|fluid|fluidly)\b/i,
    label: "flow",
    svg: (
      <svg viewBox="0 0 60 40" className="w-full h-full">
        <path d="M 4 20 C 14 4, 24 36, 34 20 S 54 4, 58 20" stroke="#4aa3d4" strokeWidth={3} fill="none" strokeLinecap="round" />
        <circle cx={58} cy={20} r={3} fill="#4aa3d4" />
      </svg>
    ),
  },
  {
    match: /\b(design|designer|designers|art|craft)\b/i,
    label: "design",
    svg: (
      <svg viewBox="0 0 60 40" className="w-full h-full">
        <circle cx={20} cy={20} r={12} fill="#f7c948" opacity={0.85} />
        <circle cx={36} cy={20} r={12} fill="hsl(10, 76%, 53%)" opacity={0.75} />
      </svg>
    ),
  },
];

interface Token {
  text: string;
  glyph: Glyph | null;
  open: boolean;
  key: string;
}

export function FluidInterfacesShowcase() {
  const { text } = usePlayground();
  const initial = useMemo<Token[]>(() => {
    const raw = text.split(/(\s+)/);
    let k = 0;
    return raw.map((seg) => {
      if (/^\s+$/.test(seg)) return { text: seg, glyph: null, open: false, key: `s${k++}` };
      const g = GLYPHS.find((g) => g.match.test(seg));
      return { text: seg, glyph: g || null, open: false, key: `w${k++}` };
    });
  }, [text]);

  const [tokens, setTokens] = useState(initial);

  if (tokens !== initial && tokens.length !== initial.length) {
    setTokens(initial);
  }

  const toggle = (key: string) => {
    setTokens((prev) =>
      prev.map((t) => (t.key === key ? { ...t, open: !t.open } : t)),
    );
  };

  const display = tokens === initial || tokens.length !== initial.length ? initial : tokens;

  return (
    <ShowcaseCard
      title="Fluid Interfaces"
      description="Underlined words reveal a tiny illustration inline. Text reflows live."
    >
      <div className="w-full bg-white rounded-lg p-5 border border-border" style={{ minHeight: 320, maxHeight: 320, overflow: "auto" }}>
        <p className="font-serif text-base leading-relaxed text-foreground/85">
          {display.map((tok) =>
            tok.glyph ? (
              <span key={tok.key} className="inline-block align-middle">
                <button
                  onClick={() => toggle(tok.key)}
                  className="font-serif text-base underline decoration-dotted decoration-2 underline-offset-4 text-primary hover:bg-primary/10 rounded px-0.5 cursor-pointer"
                  style={{ color: "hsl(10, 76%, 53%)" }}
                >
                  {tok.text}
                </button>
                <AnimatePresence>
                  {tok.open && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 60, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                      className="inline-block align-middle overflow-hidden mx-1"
                      style={{ height: 40, verticalAlign: "middle" }}
                    >
                      <span className="block w-[60px] h-[40px]">{tok.glyph.svg}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            ) : (
              <span key={tok.key}>{tok.text}</span>
            ),
          )}
        </p>
      </div>
    </ShowcaseCard>
  );
}
