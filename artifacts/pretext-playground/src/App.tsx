import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Playground } from "@/components/Playground";
import { ShowcasePage } from "@/pages/ShowcasePage";
import { PlaygroundProvider } from "@/lib/playground-context";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Playground} />
      <Route path="/showcase/:id" component={ShowcasePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PlaygroundProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </PlaygroundProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
