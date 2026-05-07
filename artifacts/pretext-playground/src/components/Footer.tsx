export function Footer() {
  return (
    <footer className="w-full py-12 mt-20 border-t border-border bg-card">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-serif italic font-medium text-foreground">Pretext Playground</span>
          <span>&mdash;</span>
          <span>A typographic tribute.</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://pretextjs.net" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors hover:underline">
            PretextJS Official
          </a>
          <a href="https://github.com/chenglou" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors hover:underline">
            Cheng Lou
          </a>
        </div>
      </div>
    </footer>
  );
}
