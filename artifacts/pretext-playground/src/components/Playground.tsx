import { useState } from "react";
import { PlaygroundContext } from "@/lib/playground-context";
import { Hero } from "@/components/Hero";
import { TextInputPanel } from "@/components/TextInputPanel";
import { AccordionShowcase } from "@/components/showcases/AccordionShowcase";
import { EditorialEngine } from "@/components/showcases/EditorialEngine";
import { MasonryShowcase } from "@/components/showcases/MasonryShowcase";
import { JustificationComparison } from "@/components/showcases/JustificationComparison";
import { DynamicLayoutShowcase } from "@/components/showcases/DynamicLayoutShowcase";
import { RichTextShowcase } from "@/components/showcases/RichTextShowcase";
import { BubblesShowcase } from "@/components/showcases/BubblesShowcase";
import { FluidInterfacesShowcase } from "@/components/showcases/FluidInterfacesShowcase";
import { WebIsInterestingAgainShowcase } from "@/components/showcases/WebIsInterestingAgainShowcase";
import { PretextBreakerShowcase } from "@/components/showcases/PretextBreakerShowcase";
import { Footer } from "@/components/Footer";

const DEFAULT_TEXT = `Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing, and adjusting the space between pairs of letters. 

The term typography is also applied to the style, arrangement, and appearance of the letters, numbers, and symbols created by the process. Type design is a closely related craft, sometimes considered part of typography; most typographers do not design typefaces, and some type designers do not consider themselves typographers.

"The web is interesting again," she said, leaning forward. When text flows like water around obstacles, when the spacing breathes with the window, it feels alive. CSS has finally given us the tools that print designers have had for decades, and we are just beginning to explore what it means to build truly fluid interfaces.`;

export function Playground() {
  const [text, setText] = useState(DEFAULT_TEXT);

  return (
    <PlaygroundContext.Provider value={{ text, setText, defaultText: DEFAULT_TEXT }}>
      <div className="min-h-screen w-full flex flex-col bg-background">
        <Hero />
        
        <main className="container mx-auto px-4 md:px-8 max-w-6xl flex flex-col gap-24 mt-12 flex-1">
          <TextInputPanel />
          
          <div className="flex flex-col gap-12">
            <div className="flex items-center gap-4">
              <div className="h-px bg-border flex-1" />
              <h2 className="text-3xl font-serif font-semibold tracking-tight text-foreground uppercase">Official Demos</h2>
              <div className="h-px bg-border flex-1" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AccordionShowcase />
              <EditorialEngine />
              <DynamicLayoutShowcase />
              <RichTextShowcase />
              <MasonryShowcase />
              <BubblesShowcase />
              <JustificationComparison />
            </div>
          </div>

          <div className="flex flex-col gap-12">
            <div className="flex items-center gap-4">
              <div className="h-px bg-border flex-1" />
              <h2 className="text-3xl font-serif font-semibold tracking-tight text-foreground uppercase">Community Showcase</h2>
              <div className="h-px bg-border flex-1" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FluidInterfacesShowcase />
              <PretextBreakerShowcase />
              <WebIsInterestingAgainShowcase />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PlaygroundContext.Provider>
  );
}
