import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { useRef, useState, useEffect } from "react";

export function WebIsInterestingAgainShowcase() {
  const { text } = usePlayground();
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const containerRef = useRef<HTMLDivElement>(null);

  const sentence = "The web is interesting again.";

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <ShowcaseCard
      title="Magnetic Letters"
      description="Letters lean away from your cursor's magnetic field."
      className="md:col-span-2"
    >
      <div 
        ref={containerRef}
        className="h-full min-h-[300px] flex items-center justify-center p-8 bg-card rounded-xl overflow-hidden relative"
      >
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-4 max-w-3xl">
          {sentence.split(' ').map((word, wIdx) => (
            <div key={wIdx} className="flex">
              {word.split('').map((char, cIdx) => {
                return <Letter key={cIdx} char={char} mousePos={mousePos} containerRef={containerRef} />;
              })}
            </div>
          ))}
        </div>
      </div>
    </ShowcaseCard>
  );
}

function Letter({ char, mousePos, containerRef }: { char: string, mousePos: { x: number, y: number }, containerRef: React.RefObject<HTMLDivElement | null> }) {
  const charRef = useRef<HTMLSpanElement>(null);
  
  let rotate = 0;
  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  if (charRef.current && containerRef.current) {
    const rect = charRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const charX = rect.left - containerRect.left + rect.width / 2;
    const charY = rect.top - containerRect.top + rect.height / 2;
    
    const dx = mousePos.x - charX;
    const dy = mousePos.y - charY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    const maxDist = 150;
    if (dist < maxDist) {
      const force = (maxDist - dist) / maxDist;
      rotate = (dx > 0 ? -1 : 1) * force * 45;
      scale = 1 + force * 0.5;
      translateX = -(dx / dist) * force * 20;
      translateY = -(dy / dist) * force * 20;
    }
  }

  return (
    <span 
      ref={charRef}
      className="text-4xl md:text-6xl font-serif font-bold text-foreground inline-block transition-transform duration-75 ease-out"
      style={{
        transform: `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg) scale(${scale})`,
        transformOrigin: "center center"
      }}
    >
      {char}
    </span>
  );
}
