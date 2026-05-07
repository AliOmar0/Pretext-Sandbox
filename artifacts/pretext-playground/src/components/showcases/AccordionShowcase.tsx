import { useEffect, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function AccordionShowcase() {
  const { text } = usePlayground();

  const paragraphs = text.split("\n\n").filter((p) => p.trim().length > 0);
  const items =
    paragraphs.length >= 3
      ? paragraphs.slice(0, 4)
      : [...paragraphs, ...paragraphs, ...paragraphs].slice(0, 4);

  const [open, setOpen] = useState<string>("item-0");
  const pausedRef = useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setOpen((prev) => {
        const n = items.length || 1;
        const current = parseInt(prev.replace("item-", ""), 10) || 0;
        return `item-${(current + 1) % n}`;
      });
    }, 3200);
    return () => window.clearInterval(id);
  }, [items.length]);

  return (
    <ShowcaseCard
      title="Accordion"
      description="Heights animate in real time. Auto-cycles when idle."
    >
      <div
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
      >
        <Accordion
          type="single"
          collapsible
          className="w-full"
          value={open}
          onValueChange={(v) => setOpen(v || "item-0")}
        >
          {items.map((paragraph, i) => (
            <AccordionItem value={`item-${i}`} key={i} className="border-border">
              <AccordionTrigger className="font-serif text-lg font-medium hover:text-primary transition-colors">
                {paragraph.split(" ").slice(0, 4).join(" ")}...
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 pb-4 text-muted-foreground leading-relaxed">
                  {paragraph}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ShowcaseCard>
  );
}
