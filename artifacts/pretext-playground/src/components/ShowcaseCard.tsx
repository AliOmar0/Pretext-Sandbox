import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ShowcaseCardProps {
  title: string;
  description: string;
  children: ReactNode;
  controls?: ReactNode;
  className?: string;
}

export function ShowcaseCard({ title, description, children, controls, className = "" }: ShowcaseCardProps) {
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
        {controls && (
          <div className="flex-shrink-0">
            {controls}
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat">
        {children}
      </div>
    </motion.div>
  );
}
