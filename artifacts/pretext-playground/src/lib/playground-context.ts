import { createContext, useContext } from 'react';

interface PlaygroundContextType {
  text: string;
  setText: (text: string) => void;
  defaultText: string;
}

export const PlaygroundContext = createContext<PlaygroundContextType>({
  text: '',
  setText: () => {},
  defaultText: '',
});

export const usePlayground = () => useContext(PlaygroundContext);
