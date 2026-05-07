import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { useRef, useState } from "react";

export function DynamicLayoutShowcase() {
  const { text } = usePlayground();
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <ShowcaseCard
      title="Dynamic Layout"
      description="Text flows around a floating obstacle using shape-outside."
    >
      <div 
        ref={containerRef}
        className="relative bg-white p-6 rounded-lg border border-border"
      >
        <div 
          className="float-left w-24 h-24 bg-primary rounded-full mr-6 mb-4 mt-2 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{ shapeOutside: "circle(50%)" }}
        >
          <span className="text-primary-foreground font-mono text-xs opacity-80 select-none">FLOAT</span>
        </div>
        <p className="text-base font-serif leading-relaxed text-justify">
          {text}
        </p>
      </div>
    </ShowcaseCard>
  );
}
