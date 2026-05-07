import { usePlayground } from "@/lib/playground-context";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export function TextInputPanel() {
  const { text, setText, defaultText } = usePlayground();

  return (
    <div className="flex flex-col gap-3 sticky top-4 z-10 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-border shadow-md">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium tracking-tight text-foreground uppercase">Source Text</label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setText(defaultText)}
          disabled={text === defaultText}
          className="text-xs h-8 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-3 h-3 mr-2" />
          Reset
        </Button>
      </div>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[120px] resize-y font-serif text-lg leading-relaxed bg-white/50 focus:bg-white transition-colors"
        placeholder="Type something beautiful..."
      />
    </div>
  );
}
