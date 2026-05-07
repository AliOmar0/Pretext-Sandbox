import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

export function BubblesShowcase() {
  const { text } = usePlayground();
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  return (
    <ShowcaseCard
      title="Bubbles"
      description="Sentences encapsulated in self-sizing conversational bubbles."
    >
      <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-xl h-full">
        {sentences.slice(0, 6).map((sentence, i) => {
          const isRight = i % 2 === 1;
          return (
            <div 
              key={i} 
              className={`flex ${isRight ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  max-w-[80%] px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed
                  ${isRight 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-card text-foreground border border-border rounded-tl-sm'}
                `}
              >
                {sentence.trim()}
              </div>
            </div>
          );
        })}
      </div>
    </ShowcaseCard>
  );
}
