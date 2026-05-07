import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

interface ShowcaseCardProps {
  title: string;
  description: string;
  children: ReactNode;
  controls?: ReactNode;
  className?: string;
  showcaseId?: string;
}

export function ShowcaseCard({ title, description, children, controls, className = "", showcaseId }: ShowcaseCardProps) {
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
          {showcaseId && (
            <Link
              href={`/showcase/${showcaseId}`}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded border border-border bg-white hover:bg-primary hover:text-white hover:border-primary text-sm font-medium text-foreground/80 transition-colors"
              aria-label={`Open ${title} full page`}
            >
              Open
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
      <div className="showcase-stage p-6 flex-1 flex flex-col relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat">
        {children}
      </div>
    </motion.div>
  );
}
