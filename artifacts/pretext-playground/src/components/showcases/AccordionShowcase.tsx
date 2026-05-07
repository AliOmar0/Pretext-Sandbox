import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function AccordionShowcase() {
  const { text } = usePlayground();
  
  // Split text into paragraphs for the accordion items
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  
  // Ensure we have at least 3 items by duplicating if necessary
  const items = paragraphs.length >= 3 
    ? paragraphs 
    : [...paragraphs, ...paragraphs, ...paragraphs].slice(0, 3);

  return (
    <ShowcaseCard
      title="Accordion"
      description="Text flows within smoothly animating height containers."
    >
      <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
        {items.slice(0, 4).map((paragraph, i) => (
          <AccordionItem value={`item-${i}`} key={i} className="border-border">
            <AccordionTrigger className="font-serif text-lg font-medium hover:text-primary transition-colors">
              {paragraph.split(' ').slice(0, 4).join(' ')}...
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 pb-4 text-muted-foreground leading-relaxed">
                {paragraph}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ShowcaseCard>
  );
}
