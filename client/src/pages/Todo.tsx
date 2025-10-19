import { useState, useEffect } from "react";
import TaskList from "@/components/todo/TaskList";
import LiquidTimeline from "@/components/todo/LiquidTimeline";
import AllDayTasks from "@/components/todo/AllDayTasks";
import AddTask from "@/components/todo/AddTask";
import { Task } from "@/components/types";
import PageHeader from "@/components/PageHeader";
import MonthlyStatsModal from "@/components/MonthlyStatsModal";
import WaterAmountDialog from "@/components/WaterAmountDialog";
import RemindersDialog from "@/components/RemindersDialog";
import OfficeProductivity from "@/components/todo/OfficeProductivity";
import JournalReflection from "@/components/todo/JournalReflection";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { EmojiPicker } from "@/components/EmojiPicker";
import { DateCarousel } from "@/components/DateCarousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Plus, Briefcase, BookOpen, CheckSquare } from "lucide-react";
import { format, addDays, startOfWeek, isToday, isSameDay, subDays } from "date-fns";

export default function Todo() {
  const [showStats, setShowStats] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [waterDialogOpen, setWaterDialogOpen] = useState(false);
  const [pendingWaterTask, setPendingWaterTask] = useState<Task | null>(null);
  const [showWeekView, setShowWeekView] = useState(false);
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [addTaskPrefillTime, setAddTaskPrefillTime] = useState<string>("");
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [editingAllDayTask, setEditingAllDayTask] = useState<Task | null>(null);
  const [isOfficeDialogOpen, setIsOfficeDialogOpen] = useState(false);
  const [isJournalDialogOpen, setIsJournalDialogOpen] = useState(false);
  
  // Listen for openAddTask event from bottom nav
  useEffect(() => {
    const handleOpenAddTask = () => {
      setAddTaskDialogOpen(true);
    };
    window.addEventListener('openAddTask', handleOpenAddTask);
    return () => window.removeEventListener('openAddTask', handleOpenAddTask);
  }, []);

  // Listen for openJournal event from winddown tasks
  useEffect(() => {
    const handleOpenJournal = (e: any) => {
      setIsJournalDialogOpen(true);
      // You could pass the prompt detail to the journal if needed
    };
    window.addEventListener('openJournal', handleOpenJournal);
    return () => window.removeEventListener('openJournal', handleOpenJournal);
  }, []);
  
  // Debug: log triggerConfetti changes
  useEffect(() => {
    console.log('triggerConfetti state changed to:', triggerConfetti);
  }, [triggerConfetti]);
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("todos");
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log('🚀 Initial load from localStorage:', parsed.length, 'tasks');
      return parsed.map((t: any) => ({
        ...t,
        dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
      }));
    }
    console.log('🚀 No saved todos, returning empty array');
    return [];
  });

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(tasks));
  }, [tasks]);

  // Listen for external updates to todos (from Food, Sport, etc.)
  useEffect(() => {
    const handleTodosUpdated = (e: Event) => {
      console.log('🔔 todosUpdated event received in Todo page');
      // Reload tasks from localStorage when external sources update
      const saved = localStorage.getItem("todos");
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('📥 Loaded todos from localStorage:', parsed.length);
        console.log('📥 Food tasks in todos:', parsed.filter((t: any) => t.source === 'food').map((t: any) => ({
          id: t.id,
          title: t.title,
          time: t.time,
          dueDate: t.dueDate,
          isAllDay: t.isAllDay
        })));
        const tasksWithDates = parsed.map((t: any) => ({
          ...t,
          dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
          completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
        }));
        setTasks(tasksWithDates);
      }
    };

    window.addEventListener('todosUpdated', handleTodosUpdated);
    return () => window.removeEventListener('todosUpdated', handleTodosUpdated);
  }, []);

  // Listen for menstrual data updates
  useEffect(() => {
    const handleMenstrualUpdate = () => {
      console.log('🔔 menstrualDataUpdated event received in Todo page');
      // Reload tasks to get updated menstrual predictions
      const saved = localStorage.getItem("todos");
      if (saved) {
        const parsed = JSON.parse(saved);
        const tasksWithDates = parsed.map((t: any) => ({
          ...t,
          dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
          completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
        }));
        setTasks(tasksWithDates);
      }
    };

    window.addEventListener('menstrualDataUpdated', handleMenstrualUpdate);
    return () => window.removeEventListener('menstrualDataUpdated', handleMenstrualUpdate);
  }, []);

  // Listen for startup settings changes
  useEffect(() => {
    const checkStartupSettings = () => {
      const startupSettings = localStorage.getItem('startupSettings');
      if (startupSettings) {
        console.log('Startup settings found:', JSON.parse(startupSettings));
      }
    };
    
    checkStartupSettings();
    
    // Check on storage events
    window.addEventListener('storage', checkStartupSettings);
    return () => window.removeEventListener('storage', checkStartupSettings);
  }, []);

  const handleToggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    const isCompleting = !task?.completed;
    
    // Handle water reminders specially - show amount dialog
    if (task && task.source === "water" && isCompleting) {
      setPendingWaterTask(task);
      setWaterDialogOpen(true);
      return;
    }
    
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map((t) => 
        t.id === id 
          ? { 
              ...t, 
              completed: !t.completed,
              completedAt: isCompleting ? new Date().toISOString() : undefined
            } 
          : t
      );
      
      // Check if all tasks for selected date are now completed (and confetti is enabled)
      const confettiEnabled = localStorage.getItem("confettiEnabled") !== "false";
      console.log('Confetti check: isCompleting =', isCompleting, 'confettiEnabled =', confettiEnabled);
      
      if (isCompleting && confettiEnabled) {
        // Only count actual task containers, not system tasks or child tasks
        const tasksForDate = updatedTasks.filter(t => {
          if (!t.dueDate) return false;
          const taskDate = t.dueDate instanceof Date ? t.dueDate : new Date(t.dueDate);
          if (!isSameDay(taskDate, selectedDate)) return false;
          
          // Exclude system tasks and child tasks from confetti calculation
          if (t.source === 'water') return false;
          if (t.source === 'medication') return false;
          if (t.source === 'sleep') return false;
          if (t.source === 'steps') return false;
          if (t.parentId) return false; // Exclude child tasks
          
          return true;
        });
        
        console.log('Tasks for date:', tasksForDate.length, 'tasks');
        console.log('Completed:', tasksForDate.filter(t => t.completed).length);
        
        // Trigger confetti when all tasks shown in counter are complete (e.g., 5/5 tasks)
        const allTasksComplete = tasksForDate.length > 0 && tasksForDate.every(t => t.completed);
        
        console.log('All complete?', allTasksComplete);
        
        if (allTasksComplete) {
          console.log('🎉 All tasks complete! Triggering confetti for', tasksForDate.length, 'tasks');
          // Use setTimeout to ensure state updates properly
          setTimeout(() => {
            console.log('Setting triggerConfetti to TRUE');
            setTriggerConfetti(true);
          }, 100);
        }
      }
      
      return updatedTasks;
    });

    // Handle medication completion
    if (task && task.source === "medication" && isCompleting) {
      const medications = JSON.parse(localStorage.getItem("medications") || "[]");
      const medicationIndex = medications.findIndex((m: any) => m.id === task.medicationId);
      if (medicationIndex !== -1) {
        medications[medicationIndex].lastTaken = new Date().toISOString();
        localStorage.setItem("medications", JSON.stringify(medications));

        window.dispatchEvent(
          new CustomEvent("medication-completed", {
            detail: { medicationId: task.medicationId },
          })
        );
      }
    }
    
    // Handle workout completion - add to recent workouts
    if (task && task.source === "workout" && isCompleting) {
      const completedWorkouts = JSON.parse(localStorage.getItem("completedWorkouts") || "[]");
      const workoutData = {
        id: `completed-${task.id}`,
        name: task.title.replace(/\s*\(\d+min\)$/, ''), // Remove duration from title
        emoji: task.emoji || "🏃",
        duration: parseInt(task.title.match(/\((\d+)min\)/)?.[1] || "30"),
        type: "completed",
        date: new Date().toISOString(),
      };
      completedWorkouts.unshift(workoutData);
      // Keep only last 10 completed workouts
      if (completedWorkouts.length > 10) completedWorkouts.length = 10;
      localStorage.setItem("completedWorkouts", JSON.stringify(completedWorkouts));
    }
    
    // Handle food task completion - move scheduled meal to consumed
    if (task && task.source === "food" && isCompleting && (task as any).mealId) {
      const meals = JSON.parse(localStorage.getItem("meals") || "[]");
      const scheduledMeal = meals.find((m: any) => m.id === (task as any).mealId);
      
      if (scheduledMeal && scheduledMeal.schedule) {
        // Create consumed meal from scheduled meal
        const consumedMeal = {
          ...scheduledMeal,
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          schedule: undefined,
        };
        meals.push(consumedMeal);
        localStorage.setItem("meals", JSON.stringify(meals));
        window.dispatchEvent(new Event("mealsUpdated"));
      }
    }
  };

  const handleDeleteTask = (id: string, deleteFuture?: boolean) => {
    if (!deleteFuture) {
      // Delete only this specific task
      setTasks(tasks.filter((t) => t.id !== id));
    } else {
      // Delete this task and all future instances
      const taskToDelete = tasks.find(t => t.id === id);
      if (!taskToDelete) return;
      
      const taskDate = taskToDelete.dueDate 
        ? (taskToDelete.dueDate instanceof Date ? taskToDelete.dueDate : new Date(taskToDelete.dueDate))
        : new Date();
      const taskDateStr = taskDate.toISOString().split('T')[0];
      
      setTasks(tasks.filter(t => {
        // Keep if it's the same task ID (we'll delete it)
        if (t.id === id) return false;
        
        // For recurring tasks with repeat field, delete all instances with same title, time, and repeat pattern
        if (taskToDelete.repeat && t.repeat === taskToDelete.repeat && t.title === taskToDelete.title && t.time === taskToDelete.time) {
          // Keep if it's before the task being deleted
          if (t.dueDate && new Date(t.dueDate).toISOString().split('T')[0] < taskDateStr) return true;
          // Delete this task and future ones
          return false;
        }
        
        // For non-recurring tasks, check title and time match
        if (!taskToDelete.repeat && t.title === taskToDelete.title && t.time === taskToDelete.time) {
          // Keep if it's before the task being deleted
          if (t.dueDate && new Date(t.dueDate).toISOString().split('T')[0] < taskDateStr) return true;
          // Delete this task and future ones
          return false;
        }
        
        // Keep all other tasks
        return true;
      }));
    }
  };

  const handleAddTask = (task: Omit<Task, "id">) => {
    const newTask = { ...task, id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id 
          ? { ...task, ...updates }
          : task
      )
    );
  };

  const handleWaterAmountConfirm = (amount: number) => {
    // Add water entry to water tracker
    const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
    const unit = waterSettings.unit || 'ml';
    
    const now = new Date();
    const waterEntries = JSON.parse(localStorage.getItem('water_entries') || '[]');
    
    // Use the reminder time if available, otherwise use current time
    const reminderTime = pendingWaterTask?.time || now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const newEntry = {
      id: Date.now().toString(),
      amount,
      unit,
      time: reminderTime, // Use reminder time
      date: selectedDate.toISOString().split('T')[0], // Use selected date, not today
    };
    
    waterEntries.unshift(newEntry);
    localStorage.setItem('water_entries', JSON.stringify(waterEntries));
    
    // Fire event to update timeline
    window.dispatchEvent(new Event('waterEntryAdded'));
    window.dispatchEvent(new Event('todosUpdated'));

    // Note: Water entries don't trigger confetti - only regular tasks in the counter do

    // Close dialog
    setWaterDialogOpen(false);
    setPendingWaterTask(null);
  };

  const handleWaterReminderClick = (time: string) => {
    setPendingWaterTask({ 
      id: `water-reminder-${time}`, 
      title: `Drink water at ${time}`,
      source: "water" as const,
      completed: false,
      time: time, // Store the reminder time
    } as Task);
    setWaterDialogOpen(true);
  };

  const handleAddTaskFromTimeline = (prefillTime: string) => {
    setAddTaskPrefillTime(prefillTime);
    setAddTaskDialogOpen(true);
  };

  const handleEditAllDayTask = (task: Task) => {
    setEditingAllDayTask(task);
  };

  const handleSaveAllDayTaskEdit = () => {
    if (!editingAllDayTask) return;
    
    handleUpdateTask(editingAllDayTask.id, editingAllDayTask);
    setEditingAllDayTask(null);
  };

  const getWaterUnit = () => {
    const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
    return waterSettings.unit || 'ml';
  };

  const getTasksForDate = (date: Date, excludeWater = false) => {
    const filtered = tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      const isSameDate = isSameDay(taskDate, date);
      
      // Filter out water tasks if excludeWater is true
      if (excludeWater && task.source === "water") {
        return false;
      }
      
      return isSameDate;
    });
    
    console.log(`📋 Tasks for ${date.toDateString()}:`, filtered.length, 'tasks');
    console.log('   Food tasks:', filtered.filter(t => t.source === 'food').map(t => ({
      title: t.title,
      time: t.time,
      dueDate: t.dueDate instanceof Date ? t.dueDate.toISOString() : t.dueDate
    })));
    
    return filtered;
  };

  const getWeekDays = () => {
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    return Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));
  };

  const getSourceBadge = (source: Task["source"]) => {
    if (!source || source === "manual") {
      return null; // Don't show badge for manual tasks
    }
    
    const config: Record<string, { label: string; className: string }> = {
      food: { label: "Food", className: "bg-chart-2/20 text-chart-2" },
      calendar: { label: "Calendar", className: "bg-chart-1/20 text-chart-1" },
      medication: { label: "Health", className: "bg-destructive/20 text-destructive" },
      workout: { label: "Sport", className: "bg-success/20 text-success" },
      sleep: { label: "Sleep", className: "bg-primary/20 text-primary" },
      water: { label: "Water", className: "bg-blue-500/20 text-blue-500" },
      breathing: { label: "Breathing", className: "bg-teal-500/20 text-teal-500" },
      reminder: { label: "Reminder", className: "bg-amber-500/20 text-amber-500" },
      steps: { label: "Steps", className: "bg-orange-500/20 text-orange-500" },
      work: { label: "Work", className: "bg-blue-600/20 text-blue-600" },
      menstrual: { label: "Menstrual", className: "bg-pink-500/20 text-pink-500" },
      winddown: { label: "Winddown", className: "bg-indigo-500/20 text-indigo-500" },
      startup: { label: "Startup", className: "bg-yellow-500/20 text-yellow-500" },
    };
    return config[source] || null;
  };

  const todayTasks = getTasksForDate(selectedDate);
  const weekDays = getWeekDays();

  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1));
  };

  // Calculate completion stats for selected date - only count actual tasks, not system tasks or child tasks
  const countableTasks = todayTasks.filter(t => 
    t.source !== 'water' && 
    t.source !== 'medication' && 
    t.source !== 'sleep' && 
    t.source !== 'steps' &&
    !t.parentId // Exclude child tasks
  );
  const completedCount = countableTasks.filter(t => t.completed).length;
  const totalCount = countableTasks.length;
  
  console.log('📊 Task counter:', completedCount, '/', totalCount, 'tasks for', selectedDate.toISOString().split('T')[0]);
  console.log('🗂️ All tasks in state:', tasks.length, 'Total food tasks:', tasks.filter(t => t.source === 'food').length);

  return (
    <div className="min-h-screen bg-background pb-20 pt-16">
      <PageHeader 
        title="To Do" 
        icon={CheckSquare}
        onStatsClick={() => setShowStats(true)}
        additionalButtons={
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsOfficeDialogOpen(true)}
              title="Office Productivity"
              data-testid="button-office"
            >
              <Briefcase className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsJournalDialogOpen(true)}
              title="Journal"
              data-testid="button-journal"
            >
              <BookOpen className="w-4 h-4" />
            </Button>
            <RemindersDialog />
          </>
        }
      />

      <main className="w-full max-w-md lg:max-w-2xl mx-auto px-4 py-6">
        {/* Date Carousel */}
        <DateCarousel 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        
        {/* Task counter */}
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            <span className={completedCount === totalCount && totalCount > 0 ? "text-primary font-semibold" : ""}>
              {completedCount} / {totalCount}
            </span>
            {" "}tasks
          </p>
        </div>

        {/* Main Content - Show All Day Tasks and Liquid Timeline */}
        <div className="mt-6 space-y-6">
          {todayTasks.filter(t => t.allDay || (!t.time && !t.allDay)).length > 0 && (
            <AllDayTasks 
              tasks={todayTasks.filter(t => t.allDay || (!t.time && !t.allDay))}
              onToggleTask={handleToggleTask}
              onEditTask={handleEditAllDayTask}
              onDeleteTask={handleDeleteTask}
              getSourceBadge={getSourceBadge}
            />
          )}
          
          <LiquidTimeline
            tasks={todayTasks}
            date={selectedDate}
            onToggleTask={handleToggleTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onWaterReminderClick={handleWaterReminderClick}
            onAddTaskClick={handleAddTaskFromTimeline}
            getSourceBadge={getSourceBadge}
          />
        </div>
      
      {/* Hidden Add Task Dialog - triggered by BottomNav + button */}
      <div style={{ display: 'none' }}>
        <AddTask 
          onAddTask={handleAddTask} 
          prefillTime={addTaskPrefillTime}
          externalOpen={addTaskDialogOpen}
          onOpenChange={(open) => {
            setAddTaskDialogOpen(open);
            if (!open) setAddTaskPrefillTime(""); // Clear prefill when closing
          }}
        />
      </div>

        {/* Week View - Show when clicking on day */}
        {showWeekView && (
          <div className="mt-8">
            {/* Week Stats */}
            <Card className="mb-6 p-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Week Overview</h3>
                <div className="flex justify-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {weekDays.reduce((total, day) => total + getTasksForDate(day, true).length, 0)}
                    </p>
                    <p className="text-muted-foreground">Total Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">
                      {weekDays.reduce((total, day) => {
                        const dayTasks = getTasksForDate(day, true);
                        return total + dayTasks.filter(task => task.completed).length;
                      }, 0)}
                    </p>
                    <p className="text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warning">
                      {Math.round(
                        (weekDays.reduce((total, day) => {
                          const dayTasks = getTasksForDate(day, true);
                          return total + dayTasks.filter(task => task.completed).length;
                        }, 0) / 
                        Math.max(weekDays.reduce((total, day) => total + getTasksForDate(day, true).length, 0), 1)) * 100
                      )}%
                    </p>
                    <p className="text-muted-foreground">Progress</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              {weekDays.map((day, index) => {
                const dayTasks = getTasksForDate(day, true); // Exclude water tasks from week view
                const completedTasks = dayTasks.filter(task => task.completed).length;
                const isTodayDate = isToday(day);
                
                return (
                  <Card key={index} className={isTodayDate ? "ring-2 ring-primary" : ""}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span>{format(day, 'EEEE, MMM d')}</span>
                          {dayTasks.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {completedTasks}/{dayTasks.length}
                            </Badge>
                          )}
                        </div>
                        {isTodayDate && <Badge variant="secondary">Today</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dayTasks.length > 0 ? (
                        <div className="space-y-2">
                          {dayTasks.map(task => {
                            const badge = getSourceBadge(task.source || "manual");
                            return (
                              <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                                <div className="text-2xl">{task.emoji || "📝"}</div>
                                <div className="flex-1">
                                  <p className={`text-sm font-medium ${task.completed ? "line-through opacity-60" : ""}`}>
                                    {task.title}
                                  </p>
                                  {task.time && (
                                    <p className="text-xs text-muted-foreground">{task.time}</p>
                                  )}
                                </div>
                                {badge && <Badge variant="secondary" className={badge.className}>{badge.label}</Badge>}
                                <button
                                  onClick={() => handleToggleTask(task.id)}
                                  className={`w-6 h-6 rounded-full border-2 ${
                                    task.completed ? "bg-success border-success" : "border-muted-foreground"
                                  }`}
                                >
                                  {task.completed && "✓"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No tasks for this day</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <MonthlyStatsModal open={showStats} onOpenChange={setShowStats} />
      
      <WaterAmountDialog
        isOpen={waterDialogOpen}
        onClose={() => {
          setWaterDialogOpen(false);
          setPendingWaterTask(null);
        }}
        onConfirm={handleWaterAmountConfirm}
        unit={getWaterUnit() as "ml" | "oz"}
      />

      {/* Edit All Day Task Dialog */}
      <Dialog open={!!editingAllDayTask} onOpenChange={(open) => !open && setEditingAllDayTask(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingAllDayTask && (
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="edit-allday-title">Task Title</Label>
                <Input
                  id="edit-allday-title"
                  value={editingAllDayTask.title}
                  onChange={(e) => setEditingAllDayTask({...editingAllDayTask, title: e.target.value})}
                  placeholder="Task title"
                />
              </div>

              <div>
                <Label>Emoji</Label>
                <EmojiPicker 
                  value={editingAllDayTask.emoji || "📝"}
                  onChange={(emoji) => setEditingAllDayTask({...editingAllDayTask, emoji})}
                  category="common"
                />
              </div>

              <div>
                <Label htmlFor="edit-allday-notes">Notes (optional)</Label>
                <Textarea
                  id="edit-allday-notes"
                  value={editingAllDayTask.notes || ""}
                  onChange={(e) => setEditingAllDayTask({...editingAllDayTask, notes: e.target.value})}
                  placeholder="Add notes..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingAllDayTask(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveAllDayTaskEdit} className="flex-1">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfettiEffect 
        trigger={triggerConfetti} 
        onComplete={() => setTriggerConfetti(false)}
      />

      {/* Office Productivity Dialog */}
      <Dialog open={isOfficeDialogOpen} onOpenChange={setIsOfficeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>💼 Office Productivity</DialogTitle>
          </DialogHeader>
          <OfficeProductivity />
        </DialogContent>
      </Dialog>

      {/* Journal Dialog */}
      <Dialog open={isJournalDialogOpen} onOpenChange={setIsJournalDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📝 Journal & Reflection</DialogTitle>
          </DialogHeader>
          <JournalReflection />
        </DialogContent>
      </Dialog>
    </div>
  );
}