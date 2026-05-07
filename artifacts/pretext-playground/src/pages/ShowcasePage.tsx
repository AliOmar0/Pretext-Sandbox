import { useEffect } from "react";
import { Link, useRoute } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TextInputPanel } from "@/components/TextInputPanel";
import { Footer } from "@/components/Footer";
import { SHOWCASES, getShowcase } from "@/lib/showcase-registry";

export function ShowcasePage() {
  const [, params] = useRoute<{ id: string }>("/showcase/:id");
  const id = params?.id ?? "";
  const entry = getShowcase(id);
  const idx = SHOWCASES.findIndex((s) => s.id === id);
  const prev = idx > 0 ? SHOWCASES[idx - 1] : null;
  const next = idx >= 0 && idx < SHOWCASES.length - 1 ? SHOWCASES[idx + 1] : null;

  useEffect(() => {
    if (entry) document.title = `${entry.title} — Pretext Playground`;
    return () => { document.title = "Pretext Playground"; };
  }, [entry]);

  if (!entry) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-serif text-xl">Showcase not found.</p>
        <Link href="/" className="text-primary underline">Back to playground</Link>
      </div>
    );
  }

  const Component = entry.component;

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <header className="border-b border-border bg-white/70 backdrop-blur sticky top-0 z-20">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            All showcases
          </Link>
          <h1 className="font-serif text-lg sm:text-2xl font-semibold text-foreground tracking-tight truncate">
            {entry.title}
          </h1>
          <div className="flex items-center gap-1">
            {prev && (
              <Link
                href={`/showcase/${prev.id}`}
                className="inline-flex items-center justify-center h-9 w-9 rounded border border-border bg-white hover:bg-muted text-foreground/70 hover:text-foreground transition-colors"
                aria-label={`Previous: ${prev.title}`}
                title={prev.title}
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
            )}
            {next && (
              <Link
                href={`/showcase/${next.id}`}
                className="inline-flex items-center justify-center h-9 w-9 rounded border border-border bg-white hover:bg-muted text-foreground/70 hover:text-foreground transition-colors"
                aria-label={`Next: ${next.title}`}
                title={next.title}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 md:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">
        <aside className="lg:sticky lg:top-24">
          <TextInputPanel />
          <div className="mt-6 hidden lg:block">
            <h4 className="text-xs font-medium tracking-wide uppercase text-muted-foreground mb-3">More showcases</h4>
            <ul className="flex flex-col gap-1">
              {SHOWCASES.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/showcase/${s.id}`}
                    className={`block text-sm font-serif rounded px-3 py-1.5 transition-colors ${
                      s.id === id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="min-w-0">
          <Component />
        </section>
      </main>

      <Footer />
    </div>
  );
}
