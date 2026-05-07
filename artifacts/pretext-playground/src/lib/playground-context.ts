import { createContext, useContext, useState, useEffect, ReactNode, createElement } from "react";

interface PlaygroundContextType {
  text: string;
  setText: (text: string) => void;
  defaultText: string;
}

const STORAGE_KEY = "pretext-playground:text";

export const DEFAULT_TEXT = `Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing, and adjusting the space between pairs of letters. 

The term typography is also applied to the style, arrangement, and appearance of the letters, numbers, and symbols created by the process. Type design is a closely related craft, sometimes considered part of typography; most typographers do not design typefaces, and some type designers do not consider themselves typographers.

"The web is interesting again," she said, leaning forward. When text flows like water around obstacles, when the spacing breathes with the window, it feels alive. CSS has finally given us the tools that print designers have had for decades, and we are just beginning to explore what it means to build truly fluid interfaces.`;

export const PlaygroundContext = createContext<PlaygroundContextType>({
  text: DEFAULT_TEXT,
  setText: () => {},
  defaultText: DEFAULT_TEXT,
});

export const usePlayground = () => useContext(PlaygroundContext);

export function PlaygroundProvider({ children }: { children: ReactNode }) {
  const [text, setText] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_TEXT;
    try {
      return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_TEXT;
    } catch {
      return DEFAULT_TEXT;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, text);
    } catch {
      /* ignore */
    }
  }, [text]);

  return createElement(
    PlaygroundContext.Provider,
    { value: { text, setText, defaultText: DEFAULT_TEXT } },
    children,
  );
}
