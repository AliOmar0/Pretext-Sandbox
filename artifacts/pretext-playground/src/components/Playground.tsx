import { Hero } from "@/components/Hero";
import { TextInputPanel } from "@/components/TextInputPanel";
import { Footer } from "@/components/Footer";
import { SHOWCASES } from "@/lib/showcase-registry";

export function Playground() {
  const community = SHOWCASES.filter((s) => s.group === "community");
  const originals = SHOWCASES.filter((s) => s.group === "originals");

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <Hero />
      <main className="container mx-auto px-4 md:px-8 max-w-6xl flex flex-col gap-24 mt-12 flex-1">
        <TextInputPanel />

        <SectionGroup title="Community Showcase" entries={community} />
        <SectionGroup title="Originals" entries={originals} />
      </main>
      <Footer />
    </div>
  );
}

function SectionGroup({
  title,
  entries,
}: {
  title: string;
  entries: { id: string; component: React.ComponentType }[];
}) {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-center gap-4">
        <div className="h-px bg-border flex-1" />
        <h2 className="text-3xl font-serif font-semibold tracking-tight text-foreground uppercase">
          {title}
        </h2>
        <div className="h-px bg-border flex-1" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {entries.map((s) => {
          const C = s.component;
          return <C key={s.id} />;
        })}
      </div>
    </div>
  );
}
