import { useState } from "react";
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
  const { toast } = useToast();

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
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-50 rounded-full w-14 h-14 shadow-lg"
        size="icon"
        data-testid="button-ai-chat"
      >
        <Sparkles className="w-6 h-6" />
      </Button>

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
