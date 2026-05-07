import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

export function EditorialEngine() {
  const { text } = usePlayground();
  
  // Try to find a good quote (something in quotes, or just a sentence)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const quote = sentences.find(s => s.includes('"')) || sentences[Math.floor(sentences.length / 2)] || "Typography matters.";
  const cleanQuote = quote.replace(/"/g, '').trim();

  return (
    <ShowcaseCard
      title="Editorial Engine"
      description="Magazine-style CSS columns with a pull-quote."
      className="md:col-span-2"
    >
      <div className="relative">
        <div className="text-4xl font-serif italic text-primary/20 absolute -top-4 -left-4 leading-none pointer-events-none select-none text-[8rem]">
          "
        </div>
        
        <div className="columns-1 md:columns-2 gap-8 text-foreground/90 font-serif leading-relaxed text-justify [column-fill:balance]">
          <p className="first-letter:text-6xl first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none">
            {text.split('\n\n')[0]}
          </p>
          
          <div className="my-8 py-6 border-y border-primary/20 break-inside-avoid text-center">
            <p className="text-2xl font-serif italic text-primary font-medium leading-snug">
              "{cleanQuote}"
            </p>
          </div>
          
          {text.split('\n\n').slice(1).map((paragraph, i) => (
            <p key={i} className="mt-4 first:mt-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </ShowcaseCard>
  );
}
