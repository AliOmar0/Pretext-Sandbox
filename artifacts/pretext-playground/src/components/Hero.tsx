export function Hero() {
  return (
    <header className="w-full pt-20 pb-12 px-4 md:px-8 flex flex-col items-center justify-center text-center border-b border-border bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23000000\" fill-opacity=\"1\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"3\"/%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"3\"/%3E%3C/g%3E%3C/svg%3E')" }} />
      
      <h1 className="text-5xl md:text-7xl font-serif font-semibold text-foreground tracking-tight max-w-4xl">
        Pretext <span className="italic text-primary">Playground</span>
      </h1>
      
      <p className="mt-6 text-xl text-muted-foreground max-w-2xl font-serif">
        A typographer's sandbox for text-in-motion. See how paragraphs flow, bend, and react.
      </p>
      
      <a 
        href="https://pretextjs.net" 
        target="_blank" 
        rel="noreferrer"
        className="mt-8 text-sm font-medium tracking-wide text-muted-foreground hover:text-primary transition-colors uppercase border-b border-transparent hover:border-primary pb-0.5"
      >
        Inspired by PretextJS
      </a>
    </header>
  );
}
