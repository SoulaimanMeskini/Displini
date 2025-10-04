import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Health from "@/pages/Health";
import Food from "@/pages/Food";
import Sport from "@/pages/Sport";
import Calendar from "@/pages/Calendar";
import Todo from "@/pages/Todo";
import Landing from "@/pages/Landing";
import Profile from "@/pages/Profile";
import BottomNav from "@/components/BottomNav";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Switch>
        {!isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Health} />
            <Route path="/food" component={Food} />
            <Route path="/sport" component={Sport} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/todo" component={Todo} />
            <Route path="/profile" component={Profile} />
          </>
        )}
      </Switch>
      {isAuthenticated && <BottomNav />}
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
