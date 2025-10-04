import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import MonthlyStatsModal from "@/components/MonthlyStatsModal";
import AIChatBubble from "@/components/AIChatBubble";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Workout {
  id: string;
  name: string;
  emoji: string;
  duration: number;
  type: string;
  frequency: "daily" | "weekly" | "custom";
  days?: string[];
  time?: string;
  date?: string;
}

export default function Sport() {
  const [showStats, setShowStats] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<Workout[]>([]);
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);
  
  const [newWorkoutName, setNewWorkoutName] = useState("");
  const [newWorkoutEmoji, setNewWorkoutEmoji] = useState("🏃");
  const [newWorkoutDuration, setNewWorkoutDuration] = useState("");
  const [newWorkoutType, setNewWorkoutType] = useState("cardio");
  const [newWorkoutFrequency, setNewWorkoutFrequency] = useState<"daily" | "weekly" | "custom">("weekly");
  const [newWorkoutDays, setNewWorkoutDays] = useState<string[]>(["monday"]);
  const [newWorkoutTime, setNewWorkoutTime] = useState("");

  useEffect(() => {
    const savedWorkouts = localStorage.getItem("workouts");
    const savedCompleted = localStorage.getItem("completedWorkouts");
    
    if (savedWorkouts) setWorkouts(JSON.parse(savedWorkouts));
    if (savedCompleted) setCompletedWorkouts(JSON.parse(savedCompleted));
  }, []);

  useEffect(() => {
    localStorage.setItem("workouts", JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem("completedWorkouts", JSON.stringify(completedWorkouts));
  }, [completedWorkouts]);

  const handleAddWorkout = (workout?: Omit<Workout, "id">) => {
    const workoutData = workout || {
      name: newWorkoutName,
      emoji: newWorkoutEmoji,
      duration: parseInt(newWorkoutDuration),
      type: newWorkoutType,
      frequency: newWorkoutFrequency,
      days: newWorkoutDays,
      time: newWorkoutTime,
    };

    if (workoutData.name && workoutData.duration) {
      const newWorkout: Workout = {
        id: Date.now().toString(),
        ...workoutData,
      };
      setWorkouts([...workouts, newWorkout]);
      
      if (!workout) {
        setNewWorkoutName("");
        setNewWorkoutEmoji("🏃");
        setNewWorkoutDuration("");
        setNewWorkoutType("cardio");
        setNewWorkoutFrequency("weekly");
        setNewWorkoutDays(["monday"]);
        setNewWorkoutTime("");
        setIsAddWorkoutOpen(false);
      }
      
      addWorkoutToTodo(newWorkout);
    }
  };

  const addWorkoutToTodo = (workout: Workout) => {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    const newTodo = {
      id: `workout-${workout.id}-${Date.now()}`,
      title: `${workout.emoji} ${workout.name} (${workout.duration}min)`,
      completed: false,
      dueDate: new Date().toISOString().split('T')[0],
      source: 'workout',
      workoutId: workout.id,
    };
    todos.push(newTodo);
    localStorage.setItem("todos", JSON.stringify(todos));
  };

  const deleteWorkout = (id: string) => {
    setWorkouts(workouts.filter(w => w.id !== id));
  };

  const completeWorkout = (id: string) => {
    const workout = workouts.find(w => w.id === id);
    if (workout) {
      const completed: Workout = {
        ...workout,
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
      };
      setCompletedWorkouts([completed, ...completedWorkouts]);
    }
  };

  const emojiOptions = ["🏃", "🚴", "🏋️", "🤸", "🧘", "🏊", "⛹️", "🤺", "🥊", "⚽", "🏀", "🎾"];

  const toggleDay = (day: string) => {
    if (newWorkoutDays.includes(day)) {
      setNewWorkoutDays(newWorkoutDays.filter(d => d !== day));
    } else {
      setNewWorkoutDays([...newWorkoutDays, day]);
    }
  };

  const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Sport & Fitness" onStatsClick={() => setShowStats(true)} />

      <main className="p-4 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Workout Schedule</CardTitle>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => setIsAddWorkoutOpen(true)}
              data-testid="button-add-workout"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {workouts.length > 0 ? (
              <div className="space-y-2">
                {workouts.map((workout) => (
                  <div 
                    key={workout.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="text-3xl">{workout.emoji}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{workout.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{workout.duration} min</span>
                        <span>•</span>
                        <span className="capitalize">{workout.type}</span>
                        <span>•</span>
                        <span className="capitalize">{workout.frequency}</span>
                      </div>
                      {workout.days && workout.days.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {workout.days.map(d => d.slice(0, 3)).join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => completeWorkout(workout.id)}
                        data-testid={`button-complete-workout-${workout.id}`}
                      >
                        Done
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteWorkout(workout.id)}
                        data-testid={`button-delete-workout-${workout.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No workouts scheduled yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Workouts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedWorkouts.length > 0 ? (
              completedWorkouts.slice(0, 5).map((workout) => (
                <div 
                  key={workout.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-success/10"
                >
                  <div className="text-2xl">{workout.emoji}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{workout.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {workout.duration} min • {workout.date && new Date(workout.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No completed workouts yet
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isAddWorkoutOpen} onOpenChange={setIsAddWorkoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Workout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="workout-emoji">Emoji</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    className={`text-2xl p-2 rounded-lg ${newWorkoutEmoji === emoji ? 'bg-primary/20' : 'hover-elevate'}`}
                    onClick={() => setNewWorkoutEmoji(emoji)}
                    data-testid={`button-emoji-${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="workout-name">Workout Name</Label>
              <Input
                id="workout-name"
                placeholder="Morning Run"
                value={newWorkoutName}
                onChange={(e) => setNewWorkoutName(e.target.value)}
                data-testid="input-workout-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="workout-duration">Duration (minutes)</Label>
                <Input
                  id="workout-duration"
                  type="number"
                  placeholder="30"
                  value={newWorkoutDuration}
                  onChange={(e) => setNewWorkoutDuration(e.target.value)}
                  data-testid="input-workout-duration"
                />
              </div>
              <div>
                <Label htmlFor="workout-type">Type</Label>
                <Select value={newWorkoutType} onValueChange={setNewWorkoutType}>
                  <SelectTrigger id="workout-type" data-testid="select-workout-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="flexibility">Flexibility</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="workout-frequency">Frequency</Label>
              <Select value={newWorkoutFrequency} onValueChange={(v) => setNewWorkoutFrequency(v as "daily" | "weekly" | "custom")}>
                <SelectTrigger id="workout-frequency" data-testid="select-workout-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newWorkoutFrequency === "weekly" || newWorkoutFrequency === "custom" ? (
              <div>
                <Label>Days</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {weekDays.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        newWorkoutDays.includes(day) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted hover-elevate'
                      }`}
                      data-testid={`button-day-${day}`}
                    >
                      {day.slice(0, 3).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div>
              <Label htmlFor="workout-time">Preferred Time (Optional)</Label>
              <Input
                id="workout-time"
                type="time"
                value={newWorkoutTime}
                onChange={(e) => setNewWorkoutTime(e.target.value)}
                data-testid="input-workout-time"
              />
            </div>
            <Button onClick={() => handleAddWorkout()} className="w-full" data-testid="button-submit-workout">
              Schedule Workout
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MonthlyStatsModal open={showStats} onOpenChange={setShowStats} />
      <AIChatBubble onWorkoutScheduled={handleAddWorkout} />
    </div>
  );
}
