import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Food from "@/pages/Food";
import Calendar from "@/pages/Calendar";
import Todo from "@/pages/Todo";
import BottomNav from "@/components/BottomNav";

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={Food} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/todo" component={Todo} />
      </Switch>
      <BottomNav />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
