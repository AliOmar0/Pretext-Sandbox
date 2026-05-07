import { motion } from "framer-motion";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

export function BubblesShowcase() {
  const { text } = usePlayground();
  const sentences = (text.match(/[^.!?]+[.!?]+/g) || [text]).slice(0, 6);

  return (
    <ShowcaseCard
      title="Bubbles"
      description="Sentences pop into self-sizing conversational bubbles."
    >
      <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-xl h-full min-h-[280px]">
        {sentences.map((sentence, i) => {
          const isRight = i % 2 === 1;
          return (
            <motion.div
              key={`${i}-${sentence.slice(0, 12)}`}
              initial={{ opacity: 0, scale: 0.6, y: 10 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -3, 0],
              }}
              transition={{
                opacity: { duration: 0.35, delay: i * 0.08 },
                scale: { type: "spring", stiffness: 360, damping: 18, delay: i * 0.08 },
                y: {
                  duration: 3 + (i % 3),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                },
              }}
              className={`flex ${isRight ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                  max-w-[80%] px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed
                  ${isRight
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card text-foreground border border-border rounded-tl-sm"}
                `}
              >
                {sentence.trim()}
              </div>
            </motion.div>
          );
        })}
      </div>
    </ShowcaseCard>
  );
}
