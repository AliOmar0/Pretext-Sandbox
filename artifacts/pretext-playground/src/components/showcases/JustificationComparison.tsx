import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

export function JustificationComparison() {
  const { text } = usePlayground();
  const paragraph = text.split('\n\n')[0] || text;

  return (
    <ShowcaseCard
      title="Justification & Balance"
      description="Comparing text alignments side-by-side."
      className="md:col-span-2"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-border">
        <div className="flex flex-col gap-3 pt-4 md:pt-0 md:px-4 first:pl-0 last:pr-0">
          <div className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-widest text-center">Left Aligned</div>
          <p className="text-sm font-serif leading-relaxed text-left text-foreground/80">
            {paragraph}
          </p>
        </div>
        
        <div className="flex flex-col gap-3 pt-4 md:pt-0 md:px-4 first:pl-0 last:pr-0">
          <div className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-widest text-center">Justified</div>
          <p className="text-sm font-serif leading-relaxed text-justify text-foreground/80">
            {paragraph}
          </p>
        </div>
        
        <div className="flex flex-col gap-3 pt-4 md:pt-0 md:px-4 first:pl-0 last:pr-0">
          <div className="text-xs font-mono font-medium text-primary uppercase tracking-widest text-center">Text-Wrap: Balance</div>
          <p className="text-sm font-serif leading-relaxed text-center text-foreground/80" style={{ textWrap: 'balance' } as React.CSSProperties}>
            {paragraph}
          </p>
        </div>
      </div>
    </ShowcaseCard>
  );
}
