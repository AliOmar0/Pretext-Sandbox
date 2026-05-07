import { ComponentType } from "react";
import { WebIsInterestingAgainShowcase } from "@/components/showcases/WebIsInterestingAgainShowcase";
import { VariableAsciiShowcase } from "@/components/showcases/VariableAsciiShowcase";
import { IlluminatedDragonShowcase } from "@/components/showcases/IlluminatedDragonShowcase";
import { MagicalTimeShowcase } from "@/components/showcases/MagicalTimeShowcase";
import { HookesLawShowcase } from "@/components/showcases/HookesLawShowcase";
import { FluidInterfacesShowcase } from "@/components/showcases/FluidInterfacesShowcase";
import { WaterRippleShowcase } from "@/components/showcases/WaterRippleShowcase";
import { PretextBreakerShowcase } from "@/components/showcases/PretextBreakerShowcase";
import { GravityWordsShowcase } from "@/components/showcases/GravityWordsShowcase";
import { TypewriterShowcase } from "@/components/showcases/TypewriterShowcase";
import { ConstellationShowcase } from "@/components/showcases/ConstellationShowcase";
import { LetterSwarmShowcase } from "@/components/showcases/LetterSwarmShowcase";
import { AsciiRainShowcase } from "@/components/showcases/AsciiRainShowcase";
import { TypeDefenseShowcase } from "@/components/showcases/TypeDefenseShowcase";
import { WordAsteroidsShowcase } from "@/components/showcases/WordAsteroidsShowcase";
import { BlackHoleShowcase } from "@/components/showcases/BlackHoleShowcase";
import { WordSnakeShowcase } from "@/components/showcases/WordSnakeShowcase";
import { SandLettersShowcase } from "@/components/showcases/SandLettersShowcase";
import { LetterTetrisShowcase } from "@/components/showcases/LetterTetrisShowcase";

export interface ShowcaseEntry {
  id: string;
  title: string;
  group: "community" | "originals";
  component: ComponentType;
}

export const SHOWCASES: ShowcaseEntry[] = [
  { id: "web-is-interesting", title: "The Web Is Interesting Again", group: "community", component: WebIsInterestingAgainShowcase },
  { id: "variable-ascii", title: "Variable Typographic ASCII", group: "community", component: VariableAsciiShowcase },
  { id: "illuminated-dragon", title: "Illuminated Dragon", group: "community", component: IlluminatedDragonShowcase },
  { id: "magical-time", title: "The Most Magical Time", group: "community", component: MagicalTimeShowcase },
  { id: "hookes-law", title: "Hooke's Law", group: "community", component: HookesLawShowcase },
  { id: "fluid-interfaces", title: "Fluid Interfaces", group: "community", component: FluidInterfacesShowcase },
  { id: "water-ripple", title: "Water Ripple", group: "community", component: WaterRippleShowcase },
  { id: "pretext-breaker", title: "Pretext Breaker", group: "community", component: PretextBreakerShowcase },
  { id: "gravity-words", title: "Gravity Words", group: "originals", component: GravityWordsShowcase },
  { id: "typewriter", title: "Typewriter", group: "originals", component: TypewriterShowcase },
  { id: "constellation", title: "Constellation", group: "originals", component: ConstellationShowcase },
  { id: "letter-swarm", title: "Letter Swarm", group: "originals", component: LetterSwarmShowcase },
  { id: "ascii-rain", title: "ASCII Rain", group: "originals", component: AsciiRainShowcase },
  { id: "type-defense", title: "Type Defense", group: "originals", component: TypeDefenseShowcase },
  { id: "word-asteroids", title: "Word Asteroids", group: "originals", component: WordAsteroidsShowcase },
  { id: "black-hole", title: "Black Hole", group: "originals", component: BlackHoleShowcase },
  { id: "word-snake", title: "Word Snake", group: "originals", component: WordSnakeShowcase },
  { id: "sand-letters", title: "Sand Letters", group: "originals", component: SandLettersShowcase },
  { id: "letter-tetris", title: "Letter Tetris", group: "originals", component: LetterTetrisShowcase },
];

export function getShowcase(id: string): ShowcaseEntry | undefined {
  return SHOWCASES.find((s) => s.id === id);
}
