import { motion } from "framer-motion";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

export function DynamicLayoutShowcase() {
  const { text } = usePlayground();

  return (
    <ShowcaseCard
      title="Dynamic Layout"
      description="Text flows around a pulsing obstacle using shape-outside."
    >
      <div className="relative bg-white p-6 rounded-lg border border-border overflow-hidden min-h-[280px]">
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            boxShadow: [
              "0 8px 20px hsla(10, 76%, 53%, 0.25)",
              "0 14px 32px hsla(10, 76%, 53%, 0.45)",
              "0 8px 20px hsla(10, 76%, 53%, 0.25)",
            ],
          }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ shapeOutside: "circle(50%)" }}
          className="float-left w-24 h-24 bg-primary rounded-full mr-6 mb-4 mt-2 flex items-center justify-center select-none"
        >
          <span className="text-primary-foreground font-mono text-xs opacity-80">
            FLOAT
          </span>
        </motion.div>
        <p className="text-base font-serif leading-relaxed text-justify">
          {text}
        </p>
      </div>
    </ShowcaseCard>
  );
}
