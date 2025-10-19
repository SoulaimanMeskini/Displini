import { useState, useEffect } from "react";
import { Dumbbell } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import MonthlyStatsModal from "@/components/MonthlyStatsModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import ManageColumns from "@/components/ManageColumns";
import MinimizableCard from "@/components/MinimizableCard";
import StepCounter from "@/components/sport/StepCounter";
import { EmojiPicker } from "@/components/EmojiPicker";
import { DateCarousel } from "@/components/DateCarousel";

interface Workout {
  id: string;
  name: string;
  emoji: string;
  duration: number;
  type: string;
  frequency: "daily" | "weekly" | "biweekly" | "monthly" | "custom";
  days?: string[];
  time?: string;
  date?: string;
  monthlyDay?: number; // Day of the month for monthly workouts (1-31)
}

export default function Sport() {
  const [showStats, setShowStats] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<Workout[]>([]);
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);
  
  // Column management state
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('sportColumnOrder');
    return saved ? JSON.parse(saved) : ['schedule', 'steps', 'recent'];
  });
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('sportColumnVisibility');
    return saved ? JSON.parse(saved) : { schedule: true, steps: true, recent: true };
  });

  const [columnMinimized, setColumnMinimized] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('sportColumnMinimized');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [newWorkoutName, setNewWorkoutName] = useState("");
  const [newWorkoutEmoji, setNewWorkoutEmoji] = useState("🏃");
  const [newWorkoutDuration, setNewWorkoutDuration] = useState("");
  const [newWorkoutType, setNewWorkoutType] = useState("cardio");
  const [newWorkoutFrequency, setNewWorkoutFrequency] = useState<"daily" | "weekly" | "biweekly" | "monthly" | "custom">("weekly");
  const [newWorkoutDays, setNewWorkoutDays] = useState<string[]>(["monday"]);
  const [newWorkoutTime, setNewWorkoutTime] = useState("");
  const [newWorkoutMonthlyDay, setNewWorkoutMonthlyDay] = useState(1);
  const [saveToQuickAdd, setSaveToQuickAdd] = useState(false);
  const [workoutErrors, setWorkoutErrors] = useState<string[]>([]);

  const columns = [
    { id: 'schedule', name: '🏋️ Workout Schedule' },
    { id: 'steps', name: '👟 Step Counter' },
    { id: 'recent', name: '📊 Recent Workouts' },
  ];

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

  useEffect(() => {
    localStorage.setItem('sportColumnOrder', JSON.stringify(columnOrder));
  }, [columnOrder]);

  useEffect(() => {
    localStorage.setItem('sportColumnVisibility', JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  useEffect(() => {
    localStorage.setItem('sportColumnMinimized', JSON.stringify(columnMinimized));
  }, [columnMinimized]);

  const handleAddWorkout = (workout?: Omit<Workout, "id">) => {
    // Clear previous errors
    setWorkoutErrors([]);
    
    const workoutData = workout || {
      name: newWorkoutName,
      emoji: newWorkoutEmoji,
      duration: parseInt(newWorkoutDuration),
      type: newWorkoutType,
      frequency: newWorkoutFrequency,
      days: newWorkoutDays,
      time: newWorkoutTime,
      monthlyDay: newWorkoutMonthlyDay,
    };

    // Validate workout data (only for manually entered, not quick add)
    if (!workout) {
      const errors: string[] = [];
      
      if (!workoutData.name || !workoutData.name.trim()) {
        errors.push("Workout name is required");
      }
      
      if (!newWorkoutDuration || isNaN(workoutData.duration) || workoutData.duration <= 0) {
        errors.push("Duration must be a positive number");
      }
      
      if ((workoutData.frequency === 'weekly' || workoutData.frequency === 'biweekly') && (!workoutData.days || workoutData.days.length === 0)) {
        errors.push("Please select at least one day");
      }
      
      if (errors.length > 0) {
        setWorkoutErrors(errors);
        return;
      }
    }

    if (workoutData.name && workoutData.duration) {
      const newWorkout: Workout = {
        id: Date.now().toString(),
        ...workoutData,
      };
      setWorkouts([...workouts, newWorkout]);
      
      // Save to Quick Add if checkbox is checked
      if (saveToQuickAdd && !workout) {
        const quickAddWorkouts = JSON.parse(localStorage.getItem('quickAddWorkouts') || '[]');
        const quickWorkout = {
          id: Date.now().toString(),
          name: workoutData.name,
          emoji: workoutData.emoji,
          duration: workoutData.duration,
          type: workoutData.type,
        };
        quickAddWorkouts.push(quickWorkout);
        localStorage.setItem('quickAddWorkouts', JSON.stringify(quickAddWorkouts));
      }
      
      if (!workout) {
        setNewWorkoutName("");
        setNewWorkoutEmoji("🏃");
        setNewWorkoutDuration("");
        setNewWorkoutType("cardio");
        setNewWorkoutFrequency("weekly");
        setNewWorkoutDays(["monday"]);
        setNewWorkoutTime("");
        setNewWorkoutMonthlyDay(1);
        setSaveToQuickAdd(false);
        setWorkoutErrors([]);
        setIsAddWorkoutOpen(false);
      }
      
      addWorkoutToTodo(newWorkout);
    }
  };

  const addWorkoutToTodo = (workout: Workout) => {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    
    // Determine which days to add the workout based on frequency
    const getDaysToAdd = () => {
      if (workout.frequency === 'daily') {
        // Add for next 30 days
        const days = [];
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          days.push(date);
        }
        return days;
      } else if ((workout.frequency === 'weekly' || workout.frequency === 'biweekly') && workout.days) {
        // Add for the next occurrence of each selected day
        const dayMap: Record<string, number> = {
          sunday: 0, monday: 1, tuesday: 2, wednesday: 3, 
          thursday: 4, friday: 5, saturday: 6
        };
        const days: Date[] = [];
        const today = new Date();
        const todayDay = today.getDay();
        
        workout.days.forEach(day => {
          const targetDay = dayMap[day.toLowerCase()];
          let daysAhead = targetDay - todayDay;
          if (daysAhead <= 0) daysAhead += 7;
          
          const date = new Date(today);
          date.setDate(date.getDate() + daysAhead);
          days.push(date);
          
          // For biweekly, also add the occurrence 2 weeks from the first
          if (workout.frequency === 'biweekly') {
            const biweeklyDate = new Date(date);
            biweeklyDate.setDate(biweeklyDate.getDate() + 14);
            days.push(biweeklyDate);
          }
        });
        return days;
      } else if (workout.frequency === 'monthly' && workout.monthlyDay) {
        // Add for the monthly day
        const days: Date[] = [];
        const today = new Date();
        const currentDay = today.getDate();
        const targetDay = workout.monthlyDay;
        
        // If the target day hasn't occurred this month, add it
        if (targetDay >= currentDay) {
          const date = new Date(today.getFullYear(), today.getMonth(), targetDay);
          days.push(date);
        }
        
        // Add next month's occurrence
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, targetDay);
        days.push(nextMonth);
        
        return days;
      } else {
        // Custom or fallback - just add for today
        return [new Date()];
      }
    };

    const daysToAdd = getDaysToAdd();
    
    daysToAdd.forEach(date => {
      // Calculate end time if start time and duration are provided
      let endTime: string | undefined;
      if (workout.time && workout.duration) {
        const [hours, minutes] = workout.time.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + workout.duration;
        const endHours = Math.floor(totalMinutes / 60) % 24;
        const endMinutes = totalMinutes % 60;
        endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
      }

      const newTodo = {
        id: `workout-${workout.id}-${date.getTime()}`,
        title: `${workout.name}`,
        emoji: workout.emoji,
        completed: false,
        dueDate: date.toISOString(),
        time: workout.time || undefined,
        endTime: endTime,
        source: 'workout' as const,
        workoutId: workout.id,
      };
      todos.push(newTodo);
    });
    
    localStorage.setItem("todos", JSON.stringify(todos));
    window.dispatchEvent(new Event("todosUpdated"));
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

  const toggleDay = (day: string) => {
    if (newWorkoutDays.includes(day)) {
      setNewWorkoutDays(newWorkoutDays.filter(d => d !== day));
    } else {
      setNewWorkoutDays([...newWorkoutDays, day]);
    }
  };

  const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <div className="min-h-screen bg-background pb-20 pt-16">
      <PageHeader 
        title="Sport & Fitness" 
        icon={Dumbbell}
        onStatsClick={() => setShowStats(true)}
        additionalButtons={
          <ManageColumns
            title="Manage Columns"
            columns={columns}
            order={columnOrder}
            visibility={columnVisibility}
            minimized={columnMinimized}
            onOrderChange={setColumnOrder}
            onVisibilityChange={setColumnVisibility}
            onMinimizeChange={setColumnMinimized}
            testId="button-column-settings"
          />
        }
      />

      <main className="w-full max-w-md lg:max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Date Carousel */}
        <DateCarousel 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        
        {columnOrder.map((columnId) => {
          if (!columnVisibility[columnId]) return null;
          
          if (columnId === 'schedule') {
            return (
              <MinimizableCard
                key={columnId}
                title="🏋️ Workout Schedule"
                minimized={columnMinimized[columnId]}
                onMinimizeChange={(minimized) => setColumnMinimized(prev => ({ ...prev, [columnId]: minimized }))}
              >
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => setIsAddWorkoutOpen(true)}
              data-testid="button-add-workout"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
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
          </div>
                </MinimizableCard>
            );
          }
          
          if (columnId === 'steps') {
            return (
              <MinimizableCard
                key={columnId}
                title="👟 Step Counter"
                minimized={columnMinimized[columnId]}
                onMinimizeChange={(minimized) => setColumnMinimized(prev => ({ ...prev, [columnId]: minimized }))}
              >
                <StepCounter />
              </MinimizableCard>
            );
          }
          
          if (columnId === 'recent') {
            return (
              <MinimizableCard
                key={columnId}
                title="📊 Recent Workouts"
                minimized={columnMinimized[columnId]}
                onMinimizeChange={(minimized) => setColumnMinimized(prev => ({ ...prev, [columnId]: minimized }))}
              >
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
              </MinimizableCard>
            );
          }
          
          return null;
        })}
      </main>

      <Dialog open={isAddWorkoutOpen} onOpenChange={setIsAddWorkoutOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Workout</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="schedule" className="pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="schedule">Schedule New</TabsTrigger>
              <TabsTrigger value="quick">Quick Add</TabsTrigger>
            </TabsList>
            
            <TabsContent value="schedule" className="space-y-4 pt-4">
            <div>
              <Label htmlFor="workout-emoji">Emoji</Label>
              <EmojiPicker
                value={newWorkoutEmoji}
                onChange={setNewWorkoutEmoji}
                category="sport"
              />
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
              <Select value={newWorkoutFrequency} onValueChange={(v) => setNewWorkoutFrequency(v as "daily" | "weekly" | "biweekly" | "monthly" | "custom")}>
                <SelectTrigger id="workout-frequency" data-testid="select-workout-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Biweekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newWorkoutFrequency === "weekly" || newWorkoutFrequency === "biweekly" || newWorkoutFrequency === "custom" ? (
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
            ) : newWorkoutFrequency === "monthly" ? (
              <div>
                <Label htmlFor="monthly-day">Day of Month (1-31)</Label>
                <Input
                  id="monthly-day"
                  type="number"
                  min="1"
                  max="31"
                  value={newWorkoutMonthlyDay}
                  onChange={(e) => setNewWorkoutMonthlyDay(parseInt(e.target.value))}
                  data-testid="input-monthly-day"
                />
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
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="save-workout-quick-add"
                checked={saveToQuickAdd}
                onCheckedChange={(checked) => setSaveToQuickAdd(!!checked)}
              />
              <Label htmlFor="save-workout-quick-add" className="cursor-pointer text-sm">
                Save to Quick Add
              </Label>
            </div>
            
            {/* Validation Errors */}
            {workoutErrors.length > 0 && (
              <div className="space-y-1 p-3 bg-red-500/10 border border-red-500/20 rounded">
                {workoutErrors.map((error, index) => (
                  <p key={index} className="text-sm text-red-600 dark:text-red-400">
                    ⚠️ {error}
                  </p>
                ))}
              </div>
            )}
            
            <Button onClick={() => handleAddWorkout()} className="w-full" data-testid="button-submit-workout">
              Schedule Workout
            </Button>
            </TabsContent>
            
            <TabsContent value="quick" className="space-y-3">
              {(() => {
                const quickAddWorkouts = JSON.parse(localStorage.getItem('quickAddWorkouts') || '[]');
                
                return quickAddWorkouts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No quick add workouts found</p>
                    <p className="text-xs mt-2">Save workouts to quickly schedule them again</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {quickAddWorkouts.map((workout: any) => (
                      <Card
                        key={workout.id}
                        className="p-3 hover-elevate cursor-pointer relative group"
                        onClick={() => {
                          handleAddWorkout({
                            name: workout.name,
                            emoji: workout.emoji,
                            duration: workout.duration,
                            type: workout.type,
                            frequency: 'weekly',
                            days: ['monday'],
                            time: '',
                          });
                          setIsAddWorkoutOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{workout.emoji}</span>
                          <div className="flex-1">
                            <p className="font-medium">{workout.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {workout.duration} min • {workout.type}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = quickAddWorkouts.filter((w: any) => w.id !== workout.id);
                              localStorage.setItem('quickAddWorkouts', JSON.stringify(updated));
                              setIsAddWorkoutOpen(false);
                              setTimeout(() => setIsAddWorkoutOpen(true), 0);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                );
              })()}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <MonthlyStatsModal open={showStats} onOpenChange={setShowStats} />
    </div>
  );
}
