import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Send, Loader2, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIChatBubbleProps {
  onMealLogged?: (meal: any) => void;
  onWorkoutScheduled?: (workout: any) => void;
  onTaskAdded?: (task: any) => void;
}

export default function AIChatBubble({ onMealLogged, onWorkoutScheduled, onTaskAdded }: AIChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Listen for openAiChat event
  useEffect(() => {
    const handleOpenAiChat = () => {
      setIsOpen(true);
    };
    window.addEventListener('openAiChat', handleOpenAiChat);
    return () => window.removeEventListener('openAiChat', handleOpenAiChat);
  }, []);

  // Detect when dialogs are open
  useEffect(() => {
    const checkForDialogs = () => {
      const dialogs = document.querySelectorAll('[data-radix-dialog-content]');
      const hasOpenDialog = Array.from(dialogs).some(dialog => {
        const style = window.getComputedStyle(dialog);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
      setIsDialogOpen(hasOpenDialog);
    };

    // Check initially
    checkForDialogs();

    // Set up mutation observer to watch for dialog changes
    const observer = new MutationObserver(checkForDialogs);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state', 'style', 'class']
    });

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setResponse("");

    try {
      const response = await apiRequest("POST", "/api/ai/parse", { input: input.trim() });
      const result = await response.json();

      if (result.type === "unknown") {
        setResponse(result.message || "I couldn't understand that request.");
        return;
      }

      setResponse(result.message || "Processing your request...");

      if (result.type === "meal" && result.data && onMealLogged) {
        const meal = {
          name: result.data.name || "Meal",
          emoji: result.data.emoji || "🍽️",
          protein: result.data.protein || 0,
          carbs: result.data.carbs || 0,
          fat: result.data.fat || 0,
          kcal: (result.data.protein || 0) * 4 + (result.data.carbs || 0) * 4 + (result.data.fat || 0) * 9,
          time: result.data.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        };
        onMealLogged(meal);
        toast({
          title: "Meal logged!",
          description: `Added ${meal.name} to your food log`,
        });
        setTimeout(() => {
          setIsOpen(false);
          setInput("");
          setResponse("");
        }, 1500);
      } else if (result.type === "workout" && result.data && onWorkoutScheduled) {
        const workout = {
          name: result.data.name || "Workout",
          emoji: result.data.emoji || "🏃",
          duration: result.data.duration || 30,
          type: result.data.workoutType || "cardio",
          frequency: result.data.frequency || "daily",
          days: result.data.days || [],
          time: result.data.time,
          date: result.data.date,
        };
        onWorkoutScheduled(workout);
        toast({
          title: "Workout scheduled!",
          description: `Added ${workout.name} to your schedule`,
        });
        setTimeout(() => {
          setIsOpen(false);
          setInput("");
          setResponse("");
        }, 1500);
      } else if (result.type === "task" && result.data && onTaskAdded) {
        const task = {
          title: result.data.name || "Task",
          emoji: result.data.emoji || "✅",
          completed: false,
          dueDate: result.data.date ? new Date(result.data.date) : undefined,
          source: "manual" as const,
        };
        onTaskAdded(task);
        toast({
          title: "Task added!",
          description: `Added "${task.title}" to your to-do list`,
        });
        setTimeout(() => {
          setIsOpen(false);
          setInput("");
          setResponse("");
        }, 1500);
      } else if (result.type === "medication") {
        toast({
          title: "Medication reminder",
          description: "Please add medication reminders from the Health tab",
        });
        setResponse("Please add medication reminders from the Health tab.");
      } else if (result.type === "calendar") {
        toast({
          title: "Calendar event",
          description: "Please add calendar events from the Calendar tab",
        });
        setResponse("Please add calendar events from the Calendar tab.");
      }
    } catch (error) {
      console.error("AI parse error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (errorMessage.includes("429") || errorMessage.includes("quota")) {
        setResponse("AI service is temporarily unavailable due to rate limits. Please try manual entry or try again later.");
        toast({
          title: "Rate Limit Reached",
          description: "Please use manual entry for now",
          variant: "destructive",
        });
      } else {
        setResponse("Sorry, something went wrong. Please try manual entry instead.");
        toast({
          title: "Error",
          description: "Failed to process your request. Please use manual entry.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {typeof document !== 'undefined' && !isDialogOpen && createPortal(
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-[99999] rounded-full shadow-lg bg-primary text-primary-foreground border border-primary-border flex items-center justify-center hover:scale-110 transition-transform"
          data-testid="button-ai-chat"
          aria-label="Open AI Assistant"
          style={{ 
            pointerEvents: 'auto',
            borderRadius: '50%',
            width: '52px',
            height: '52px',
            minWidth: '52px',
            minHeight: '52px'
          }}
        >
          <Sparkles className="w-5 h-5" />
        </button>,
        document.body
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Assistant
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Try saying things like:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>"Log chicken salad for lunch"</li>
                <li>"Schedule a 30 min run tomorrow at 6am"</li>
                <li>"Add task to review project docs"</li>
              </ul>
            </div>

            {response && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm">{response}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What would you like to do?"
                disabled={isLoading}
                data-testid="input-ai-chat"
              />
              <Button type="submit" disabled={isLoading || !input.trim()} data-testid="button-ai-submit">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
