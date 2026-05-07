import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PretextBreakerShowcase() {
  const { text } = usePlayground();
  const [words, setWords] = useState<{ id: number, text: string, broken: boolean }[]>([]);

  useEffect(() => {
    // Reset words when text changes
    const sentence = text.split('.')[0] + '.';
    const tokens = sentence.split(/\s+/).filter(w => w.trim().length > 0);
    setWords(tokens.map((w, i) => ({ id: i, text: w, broken: false })));
  }, [text]);

  const breakWord = (id: number) => {
    setWords(prev => prev.map(w => w.id === id ? { ...w, broken: true } : w));
  };

  const resetGame = () => {
    setWords(prev => prev.map(w => ({ ...w, broken: false })));
  };

  const allBroken = words.length > 0 && words.every(w => w.broken);

  return (
    <ShowcaseCard
      title="Pretext Breaker"
      description="Click the words to break them apart."
    >
      <div className="flex flex-col items-center justify-center h-full min-h-[250px] p-6 bg-card rounded-xl relative">
        <AnimatePresence>
          {allBroken && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm z-10 rounded-xl"
            >
              <p className="text-2xl font-serif text-primary font-bold mb-4">Text Broken!</p>
              <button 
                onClick={resetGame}
                className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded shadow-sm hover:bg-primary/90 transition-colors"
              >
                Reset
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap justify-center gap-3">
          {words.map((word) => (
            <motion.button
              key={word.id}
              onClick={() => breakWord(word.id)}
              animate={word.broken ? { 
                opacity: 0, 
                scale: 0.5, 
                y: 50, 
                rotate: (Math.random() - 0.5) * 45 
              } : { opacity: 1, scale: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.3 }}
              className={`
                px-3 py-1.5 rounded border border-border shadow-sm font-serif text-lg
                hover:border-primary hover:text-primary transition-colors cursor-pointer
                ${word.broken ? 'pointer-events-none' : 'bg-white'}
              `}
            >
              {word.text}
            </motion.button>
          ))}
        </div>
      </div>
    </ShowcaseCard>
  );
}
