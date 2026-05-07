import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

export function MasonryShowcase() {
  const { text } = usePlayground();
  
  // Split text by sentence
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  // Distribute into 3 columns
  const cols: string[][] = [[], [], []];
  sentences.forEach((sentence, i) => {
    cols[i % 3].push(sentence.trim());
  });

  return (
    <ShowcaseCard
      title="Masonry Flow"
      description="Sentences broken into varying-height cards in a waterfall layout."
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
        {cols.map((col, i) => (
          <div key={i} className="flex flex-col gap-4">
            {col.map((sentence, j) => (
              <div 
                key={j} 
                className="p-4 bg-white border border-border shadow-sm rounded-lg hover:-translate-y-1 transition-transform cursor-default"
              >
                <p className="text-sm font-serif leading-relaxed text-foreground/80">
                  {sentence}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </ShowcaseCard>
  );
}
