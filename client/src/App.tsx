import { Switch, Route, Redirect, useLocation } from "wouter";
import { useState } from "react";
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
import PageTransition from "@/components/PageTransition";
import OnboardingDialog from "@/components/OnboardingDialog";
import AIChatBubble from "@/components/AIChatBubble";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const handleAddTask = () => {
    // Dispatch custom event to open add task dialog
    window.dispatchEvent(new CustomEvent('openAddTask'));
  };

  const handleAiClick = () => {
    // Dispatch custom event to open AI chat
    window.dispatchEvent(new CustomEvent('openAiChat'));
  };

  return (
    <>
      <PageTransition>
        <Switch>
    {!isAuthenticated ? (
      <Route path="/" component={Landing} />
    ) : (
      <>
        <Route path="/" component={() => <Redirect to="/todo" />} />
        <Route path="/health" component={Health} />
        <Route path="/food" component={Food} />
        <Route path="/sport" component={Sport} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/todo" component={Todo} />
        <Route path="/profile" component={Profile} />
      </>
    )}
  </Switch>
      </PageTransition>
      {isAuthenticated && (
        <>
          <OnboardingDialog />
          <AIChatBubble />
          <BottomNav 
            onAddTask={location === '/todo' ? handleAddTask : undefined} 
            onAiClick={location !== '/todo' ? handleAiClick : undefined}
          />
        </>
      )}
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
