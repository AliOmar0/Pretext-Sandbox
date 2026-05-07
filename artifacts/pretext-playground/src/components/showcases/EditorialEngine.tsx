import { motion } from "framer-motion";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

export function EditorialEngine() {
  const { text } = usePlayground();

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const quote =
    sentences.find((s) => s.includes('"')) ||
    sentences[Math.floor(sentences.length / 2)] ||
    "Typography matters.";
  const cleanQuote = quote.replace(/"/g, "").trim();

  const paragraphs = text.split("\n\n").filter((p) => p.trim().length > 0);
  const first = paragraphs[0] || text;
  const rest = paragraphs.slice(1);

  const tickerText = `${cleanQuote}    \u2767    ${cleanQuote}    \u2767    ${cleanQuote}    \u2767    `;

  return (
    <ShowcaseCard
      title="Editorial Engine"
      description="Magazine columns, an animated drop cap, and a slow-scrolling pull-quote."
      className="md:col-span-2"
    >
      <div className="relative">
        <div className="overflow-hidden border-y border-primary/20 mb-6 py-3 bg-muted/20">
          <motion.div
            className="whitespace-nowrap font-serif italic text-primary/80 text-lg"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          >
            <span>{tickerText}</span>
            <span>{tickerText}</span>
          </motion.div>
        </div>

        <div className="columns-1 md:columns-2 gap-8 text-foreground/90 font-serif leading-relaxed text-justify [column-fill:balance]">
          <p className="first-letter:text-6xl first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {first}
            </motion.span>
          </p>

          <div className="my-8 py-6 border-y border-primary/20 break-inside-avoid text-center">
            <motion.p
              key={cleanQuote}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl font-serif italic text-primary font-medium leading-snug"
            >
              "{cleanQuote}"
            </motion.p>
          </div>

          {rest.map((paragraph, i) => (
            <p key={i} className="mt-4 first:mt-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </ShowcaseCard>
  );
}
