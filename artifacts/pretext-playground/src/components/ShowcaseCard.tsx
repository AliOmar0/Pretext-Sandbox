import { motion } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

interface ShowcaseCardProps {
  title: string;
  description: string;
  children: ReactNode;
  controls?: ReactNode;
  className?: string;
}

export function ShowcaseCard({ title, description, children, controls, className = "" }: ShowcaseCardProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFs(document.fullscreenElement === stageRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFs = async () => {
    const el = stageRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`flex flex-col bg-card border border-border shadow-sm rounded-xl overflow-hidden ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-border bg-muted/20">
        <div>
          <h3 className="font-serif text-xl text-foreground font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          {controls}
          <button
            type="button"
            onClick={toggleFs}
            aria-label={isFs ? "Exit fullscreen" : "Open fullscreen"}
            title={isFs ? "Exit fullscreen" : "Open fullscreen"}
            className="inline-flex items-center justify-center h-8 w-8 rounded border border-border bg-white hover:bg-muted text-foreground/70 hover:text-foreground transition-colors"
          >
            {isFs ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div
        ref={stageRef}
        className="showcase-stage p-6 flex-1 flex flex-col relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat data-[fs=true]:bg-background data-[fs=true]:p-10 data-[fs=true]:justify-center"
        data-fs={isFs}
      >
        {children}
      </div>
    </motion.div>
  );
}
