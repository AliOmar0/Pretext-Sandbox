import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import React from "react";

export function RichTextShowcase() {
  const { text } = usePlayground();
  
  const renderRichText = (str: string) => {
    // Basic regex parsing for numbers, uppercase words (length >= 3), and "web" or "CSS"
    const tokens = str.split(/(\b[A-Z]{3,}\b|\b\d+\b|\bweb\b|\bCSS\b)/g);
    
    return tokens.map((token, i) => {
      if (/^\b[A-Z]{3,}\b$/.test(token)) {
        return <span key={i} className="px-1.5 py-0.5 mx-0.5 rounded bg-muted font-mono text-xs font-medium text-foreground">{token}</span>;
      }
      if (/^\b\d+\b$/.test(token)) {
        return <span key={i} className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold mx-0.5">{token}</span>;
      }
      if (/^\b(web|CSS)\b$/.test(token)) {
        return <span key={i} className="text-primary font-semibold underline decoration-wavy underline-offset-4 decoration-primary/40">{token}</span>;
      }
      return <React.Fragment key={i}>{token}</React.Fragment>;
    });
  };

  return (
    <ShowcaseCard
      title="Rich Text Automata"
      description="Auto-formatting detected patterns (numbers, acronyms, keywords)."
    >
      <div className="bg-white p-6 rounded-lg border border-border h-full">
        <p className="text-lg font-sans leading-loose text-foreground/90">
          {renderRichText(text)}
        </p>
      </div>
    </ShowcaseCard>
  );
}
