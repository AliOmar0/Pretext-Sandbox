import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { useRef, useState } from "react";

export function FluidInterfacesShowcase() {
  const { text } = usePlayground();
  const containerRef = useRef<HTMLDivElement>(null);
  const [weight, setWeight] = useState(400);
  const [tracking, setTracking] = useState(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xRatio = Math.max(0, Math.min(1, x / rect.width));
    const yRatio = Math.max(0, Math.min(1, y / rect.height));

    setWeight(100 + xRatio * 800); // 100 to 900
    setTracking(-0.05 + yRatio * 0.2); // -0.05em to 0.15em
  };

  return (
    <ShowcaseCard
      title="Fluid Typography"
      description="Mouse X controls weight, Mouse Y controls tracking."
    >
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setWeight(400); setTracking(0); }}
        className="h-full min-h-[300px] flex items-center justify-center p-8 bg-gradient-to-br from-white to-muted/50 rounded-xl cursor-crosshair border border-border"
      >
        <p 
          className="text-2xl font-serif text-center transition-all duration-75 ease-out"
          style={{ 
            fontWeight: weight, 
            letterSpacing: `${tracking}em`
          }}
        >
          {text.split('.')[0]}.
        </p>
      </div>
    </ShowcaseCard>
  );
}
