import { useEffect, useRef, useState } from "react";
import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

export function TypewriterShowcase() {
  const { text } = usePlayground();
  const [out, setOut] = useState("");
  const phaseRef = useRef<"typing" | "pausing" | "erasing">("typing");
  const idxRef = useRef(0);
  const lastRef = useRef(0);

  useEffect(() => {
    setOut("");
    idxRef.current = 0;
    phaseRef.current = "typing";
    lastRef.current = 0;
    let raf = 0;
    const tick = (now: number) => {
      const target = text.split("\n\n")[0];
      if (!lastRef.current) lastRef.current = now;
      const phase = phaseRef.current;
      let interval = 0;
      if (phase === "typing") {
        const ch = target[idxRef.current];
        interval = ch === "." || ch === "," ? 240 : 28 + Math.random() * 60;
      } else if (phase === "erasing") {
        interval = 14 + Math.random() * 18;
      } else {
        interval = 1400;
      }

      if (now - lastRef.current >= interval) {
        lastRef.current = now;
        if (phase === "typing") {
          if (idxRef.current >= target.length) {
            phaseRef.current = "pausing";
          } else {
            idxRef.current += 1;
            setOut(target.slice(0, idxRef.current));
          }
        } else if (phase === "pausing") {
          phaseRef.current = "erasing";
        } else {
          if (idxRef.current <= 0) {
            phaseRef.current = "typing";
          } else {
            idxRef.current -= 1;
            setOut(target.slice(0, idxRef.current));
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);

  return (
    <ShowcaseCard
      title="Typewriter Reveal"
      description="The first paragraph types itself out, pauses, then unwinds. Forever."
    >
      <div className="bg-[#1a1410] text-[hsl(38,100%,88%)] rounded-lg p-6 min-h-[260px] font-mono text-sm leading-relaxed">
        <span>{out}</span>
        <span
          className="inline-block w-[8px] h-[1em] bg-[hsl(10,76%,60%)] align-[-2px] ml-0.5"
          style={{ animation: "blink 1s steps(1) infinite" }}
        />
        <style>{`
          @keyframes blink { 50% { opacity: 0; } }
        `}</style>
      </div>
    </ShowcaseCard>
  );
}
