import { motion, AnimatePresence } from "framer-motion";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

export function MasonryShowcase() {
  const { text } = usePlayground();
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  const cols: { sentence: string; idx: number }[][] = [[], [], []];
  sentences.forEach((sentence, i) => {
    cols[i % 3].push({ sentence: sentence.trim(), idx: i });
  });

  return (
    <ShowcaseCard
      title="Masonry Flow"
      description="Sentences animate into a waterfall as the source text changes."
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
        {cols.map((col, i) => (
          <motion.div key={i} layout className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {col.map(({ sentence, idx }) => (
                <motion.div
                  layout
                  key={idx + sentence.slice(0, 16)}
                  initial={{ opacity: 0, scale: 0.85, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 280, damping: 26 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="p-4 bg-white border border-border shadow-sm rounded-lg cursor-default"
                >
                  <p className="text-sm font-serif leading-relaxed text-foreground/80">
                    {sentence}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </ShowcaseCard>
  );
}
