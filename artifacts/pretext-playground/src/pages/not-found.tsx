import { Link } from "wouter";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background text-foreground text-center p-4">
      <div className="max-w-md w-full flex flex-col items-center border border-border bg-card p-12 rounded-xl shadow-lg">
        <div className="text-6xl font-serif font-bold text-primary mb-4 italic">
          404
        </div>
        <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground mb-4">
          Page Not Found
        </h1>
        <p className="text-muted-foreground font-serif leading-relaxed mb-8">
          The typographic path you're trying to traverse doesn't exist in this playground. 
          Let's return to the source text.
        </p>
        <Link href="/" className="inline-flex items-center justify-center h-10 px-6 font-medium text-primary-foreground bg-primary rounded-md shadow transition-colors hover:bg-primary/90">
          <MoveLeft className="mr-2 h-4 w-4" />
          Back to Playground
        </Link>
      </div>
    </div>
  );
}
