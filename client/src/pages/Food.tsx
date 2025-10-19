import { useState, useEffect } from "react";
import { Utensils } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import MonthlyStatsModal from "@/components/MonthlyStatsModal";
import MacroCalculator from "@/components/food/MacroCalculator";
import WeightGoalTracker from "@/components/food/WeightGoalTracker";
import WaterTracker from "@/components/food/WaterTracker";
import EnhancedMealLog from "@/components/food/EnhancedMealLog";
import { Card } from "@/components/ui/card";
import MacroProgress from "@/components/food/MacroProgress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit2 } from "lucide-react";
import ManageColumns from "@/components/ManageColumns";
import MinimizableCard from "@/components/MinimizableCard";
import BMICalculator from "@/components/food/BMICalculator";
import { DateCarousel } from "@/components/DateCarousel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Meal {
  id: string;
  time: string;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  kcal: number;
  emoji: string;
  date?: string;
  schedule?: {
    type: "now" | "today" | "day" | "weekly" | "biweekly" | "monthly";
    day?: string;
    time?: string;
  };
}

interface DayStats {
  date: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Food() {
  const [showStats, setShowStats] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(70);
  const [targets, setTargets] = useState<{ kcal: number; protein: number; carbs: number; fat: number } | null>(() => {
    const saved = localStorage.getItem('calculator_results');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [editedGoals, setEditedGoals] = useState({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('food_column_order');
    return saved ? JSON.parse(saved) : ['calculator', 'bmi', 'weight', 'water', 'week', 'goals', 'meals'];
  });
  
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('food_column_visibility');
    return saved ? JSON.parse(saved) : {
      calculator: true,
      bmi: true,
      weight: true,
      water: true,
      week: true,
      goals: true,
      meals: true
    };
  });

  const [columnMinimized, setColumnMinimized] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('food_column_minimized');
    return saved ? JSON.parse(saved) : {};
  });
  
  const getWeekStart = () => {
    const today = new Date();
    const day = today.getDay();
    const weekStartDay = parseInt(localStorage.getItem("weekStartDay") || "0");
    const diff = day - weekStartDay;
    const adjustedDiff = diff < 0 ? diff + 7 : diff;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - adjustedDiff);
    return startDate;
  };
  
  const [weekStart, setWeekStart] = useState(getWeekStart);

  const [meals, setMeals] = useState<Meal[]>(() => {
    const saved = localStorage.getItem('meals');
    return saved ? JSON.parse(saved) : [];
  });

  const [previousMeals] = useState<Meal[]>([]);

  useEffect(() => {
    const handleWeekStartChange = () => {
      setWeekStart(getWeekStart());
    };
    window.addEventListener('weekStartDayChanged', handleWeekStartChange);
    return () => window.removeEventListener('weekStartDayChanged', handleWeekStartChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('food_column_order', JSON.stringify(columnOrder));
  }, [columnOrder]);

  useEffect(() => {
    localStorage.setItem('food_column_visibility', JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  useEffect(() => {
    localStorage.setItem('food_column_minimized', JSON.stringify(columnMinimized));
  }, [columnMinimized]);

  // Sync scheduled meals to To Do tasks
  useEffect(() => {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    const today = new Date();
    const dayName = daysOfWeek[today.getDay()].toLowerCase();
    
    // Remove old meal tasks for today
    const filteredTodos = todos.filter((t: any) => 
      t.source !== 'food' || 
      (t.dueDate && new Date(t.dueDate).toDateString() !== today.toDateString())
    );
    
    // Add new meal tasks for today's scheduled meals
    let tasksAdded = false;
    meals.forEach(meal => {
      if (meal.schedule) {
        let shouldAddTask = false;
        
        if (meal.schedule.type === "weekly" || meal.schedule.type === "biweekly") {
          const scheduledDay = meal.schedule.day?.toLowerCase();
          if (scheduledDay && dayName.includes(scheduledDay.substring(0, 3))) {
            shouldAddTask = true;
          }
        } else if (meal.schedule.type === "today") {
          shouldAddTask = true;
        }
        
        if (shouldAddTask) {
          const taskId = `meal-${meal.id}-${today.toISOString().split('T')[0]}`;
          // Check if task already exists
          if (!filteredTodos.some((t: any) => t.id === taskId)) {
            const newTask = {
              id: taskId,
              title: `Eat ${meal.name}`,
              completed: false,
              source: "food" as const,
              dueDate: today.toISOString(),
              time: meal.schedule.time || meal.time,
              emoji: meal.emoji,
              mealId: meal.id
            };
            filteredTodos.push(newTask);
            tasksAdded = true;
          }
        }
      }
    });
    
    if (tasksAdded || filteredTodos.length !== todos.length) {
      localStorage.setItem("todos", JSON.stringify(filteredTodos));
      window.dispatchEvent(new Event("todosUpdated"));
    }
  }, [meals]);

  const handleSaveGoals = () => {
    setTargets(editedGoals);
    localStorage.setItem('calculator_results', JSON.stringify(editedGoals));
    setIsEditingGoals(false);
  };

  const handleEditGoals = () => {
    if (targets) {
      setEditedGoals(targets);
    }
    setIsEditingGoals(true);
  };

  const toggleColumnVisibility = (columnId: string) => {
    if (columnId === 'week' || columnId === 'goals') return; // week and goals are required
    setColumnVisibility(prev => ({ ...prev, [columnId]: !prev[columnId] }));
  };

  const moveColumn = (fromIndex: number, toIndex: number) => {
    const newOrder = [...columnOrder];
    const [movedColumn] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedColumn);
    setColumnOrder(newOrder);
  };

  const columns = [
    { id: 'calculator', name: '🧮 Macro Calculator' },
    { id: 'bmi', name: '📊 BMI Calculator' },
    { id: 'water', name: '💧 Water Intake' },
    { id: 'goals', name: '🎯 Today\'s Goals', required: true },
    { id: 'meals', name: '🍽️ Food Log' },
  ];

  const handleAddMeal = (meal: Omit<Meal, "id">) => {
    const newMeal = { 
      ...meal, 
      id: Date.now().toString(),
      // Set date for meals without schedule (quick add) or with schedule type "now"
      date: (!meal.schedule || meal.schedule?.type === "now") ? selectedDate.toISOString().split('T')[0] : undefined
    };
    const updatedMeals = [...meals, newMeal];
    setMeals(updatedMeals);
    localStorage.setItem('meals', JSON.stringify(updatedMeals));

    // Create task for scheduled meals (today, weekly, etc.)
    if (meal.schedule) {
      console.log('🍽️ Creating tasks for scheduled meal:', meal.name, 'Schedule:', meal.schedule);
      const todos = JSON.parse(localStorage.getItem("todos") || "[]");
      
      // For weekly/biweekly, create tasks for next 4 weeks
      if (meal.schedule.type === "weekly" || meal.schedule.type === "biweekly") {
        let scheduledDay = meal.schedule.day?.toLowerCase().trim();
        console.log('📅 Raw scheduled day:', meal.schedule.day, '→ Processed:', scheduledDay);
        
        if (scheduledDay) {
          const dayMap: Record<string, number> = {
            sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
            thursday: 4, friday: 5, saturday: 6,
            sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
          };
          
          // Try exact match first, then substring
          let targetDayNum: number | undefined = dayMap[scheduledDay];
          if (targetDayNum === undefined) {
            const matchedEntry = Object.entries(dayMap).find(([day]) => 
              day.startsWith(scheduledDay.substring(0, 3)) || scheduledDay.startsWith(day)
            );
            if (matchedEntry) {
              targetDayNum = matchedEntry[1];
            }
          }
          
          console.log('🎯 Target day number:', targetDayNum, 'for day:', scheduledDay);
          
          if (targetDayNum !== undefined) {
            const today = new Date();
            const currentDay = today.getDay();
            
            // Calculate weeks to add
            const weeksToAdd = meal.schedule.type === "weekly" ? 4 : 2;
            
            console.log(`🔄 Creating ${weeksToAdd} tasks starting from today (${today.toDateString()}, day ${currentDay})`);
            
            for (let week = 0; week < weeksToAdd; week++) {
              // Calculate days ahead for this week
              let daysAhead = targetDayNum - currentDay;
              if (daysAhead <= 0) daysAhead += 7; // Next occurrence
              
              // Add weeks offset
              const weekOffset = week * (meal.schedule.type === "biweekly" ? 14 : 7);
              const totalDaysAhead = daysAhead + weekOffset;
              
              const date = new Date(today);
              date.setDate(date.getDate() + totalDaysAhead);
              
              console.log(`  Week ${week}: targetDay=${targetDayNum}, currentDay=${currentDay}, daysAhead=${daysAhead}, weekOffset=${weekOffset}, totalDays=${totalDaysAhead}, date=${date.toDateString()}`);
              
              const taskTime = meal.schedule.time || meal.time;
              const hasTime = taskTime && taskTime.trim() !== '';
              
              const newTask = {
                id: `meal-${newMeal.id}-${date.toISOString().split('T')[0]}`,
                title: `${meal.name}`,
                completed: false,
                source: "food" as const,
                dueDate: date.toISOString(),
                time: hasTime ? taskTime : undefined,
                emoji: meal.emoji,
                mealId: newMeal.id,
                isAllDay: !hasTime
              };
              todos.push(newTask);
              console.log('  ✅ Created food task:', {
                id: newTask.id,
                title: newTask.title,
                date: date.toDateString(),
                time: newTask.time,
                isAllDay: newTask.isAllDay,
                dueDate: newTask.dueDate
              });
            }
          }
        }
      } else if (meal.schedule.type === "today" || meal.schedule.type === "day") {
        let taskDate: Date;
        if (meal.schedule.type === "today") {
          taskDate = new Date();
        } else if (meal.schedule.day) {
          taskDate = new Date(meal.schedule.day);
          // Validate the date
          if (isNaN(taskDate.getTime())) {
            taskDate = new Date(); // Fallback to today if invalid
          }
        } else {
          taskDate = new Date();
        }
        
        const taskTime = meal.schedule.time || meal.time;
        const hasTime = taskTime && taskTime.trim() !== '';
        
        const newTask = {
          id: `meal-${newMeal.id}`,
          title: `${meal.name}`,
          completed: false,
          source: "food" as const,
          dueDate: taskDate.toISOString(),
          time: hasTime ? taskTime : undefined,
          emoji: meal.emoji,
          mealId: newMeal.id,
          isAllDay: !hasTime
        };
        todos.push(newTask);
        console.log('📅 Created food task (today/day) for', taskDate.toDateString(), ':', newTask);
      }
      
      console.log('💾 Saving todos to localStorage, total count:', todos.length);
      console.log('💾 All todos:', todos.map((t: any) => ({ id: t.id, title: t.title, source: t.source, dueDate: t.dueDate })));
      localStorage.setItem("todos", JSON.stringify(todos));
      window.dispatchEvent(new Event("todosUpdated"));
    }
  };

  const handleConsumeScheduledMeal = (scheduledMealId: string) => {
    const scheduledMeal = meals.find(m => m.id === scheduledMealId);
    if (scheduledMeal && scheduledMeal.schedule) {
      const consumedMeal: Meal = {
        ...scheduledMeal,
        id: Date.now().toString(),
        date: selectedDate.toISOString().split('T')[0],
        schedule: undefined,
      };
      const updatedMeals = [...meals, consumedMeal];
      setMeals(updatedMeals);
      localStorage.setItem('meals', JSON.stringify(updatedMeals));
    }
  };

  const handleDeleteMeal = (id: string) => {
    const updatedMeals = meals.filter((m) => m.id !== id);
    setMeals(updatedMeals);
    localStorage.setItem('meals', JSON.stringify(updatedMeals));
  };

  const handleUpdateMealEmoji = (id: string, emoji: string) => {
    const updatedMeals = meals.map(m => m.id === id ? { ...m, emoji } : m);
    setMeals(updatedMeals);
    localStorage.setItem('meals', JSON.stringify(updatedMeals));
  };

  const handleConsumeMeal = (id: string) => {
    const scheduledMeal = meals.find(m => m.id === id);
    if (scheduledMeal && scheduledMeal.schedule) {
      // Create a new consumed meal from the scheduled meal
      const consumedMeal: Meal = {
        ...scheduledMeal,
        id: Date.now().toString(),
        date: selectedDate.toISOString().split('T')[0],
        schedule: undefined,
      };
      const updatedMeals = [...meals, consumedMeal];
      setMeals(updatedMeals);
      localStorage.setItem('meals', JSON.stringify(updatedMeals));

      // Complete corresponding task
      const todos = JSON.parse(localStorage.getItem("todos") || "[]");
      const updatedTodos = todos.map((t: any) => 
        t.mealId === id ? { ...t, completed: true } : t
      );
      localStorage.setItem("todos", JSON.stringify(updatedTodos));
      window.dispatchEvent(new Event("todosUpdated"));
    }
  };

  const handleScanBarcode = () => {
    alert("Barcode scanning feature would open camera here. This requires camera permissions and a barcode scanning API.");
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getMealsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayName = daysOfWeek[date.getDay()].toLowerCase();
    const isToday = date.toDateString() === new Date().toDateString();
    
    const directMeals = meals.filter(m => m.date === dateStr && !m.schedule);
    const scheduledMeals = meals.filter(m => {
      if (!m.schedule) return false;
      
      // Handle today scheduled meals
      if (m.schedule.type === "today" && isToday) return true;
      
      // Handle weekly/biweekly scheduled meals
      if ((m.schedule.type === "weekly" || m.schedule.type === "biweekly") && 
          m.schedule.day?.toLowerCase().includes(dayName.toLowerCase())) return true;
      
      return false;
    });
    
    return { consumed: directMeals, scheduled: scheduledMeals };
  };

  const getDayStats = (date: Date) => {
    const { consumed, scheduled } = getMealsForDate(date);
    const allMeals = [...consumed, ...scheduled];
    return {
      kcal: allMeals.reduce((sum, m) => sum + m.kcal, 0),
      protein: allMeals.reduce((sum, m) => sum + m.protein, 0),
      carbs: allMeals.reduce((sum, m) => sum + m.carbs, 0),
      fat: allMeals.reduce((sum, m) => sum + m.fat, 0),
    };
  };

  const getGoalStatus = (date: Date) => {
    if (!targets) return "none";
    const stats = getDayStats(date);
    
    const proteinPercentage = (stats.protein / targets.protein) * 100;
    const kcalPercentage = (stats.kcal / targets.kcal) * 100;
    
    const avgPercentage = (proteinPercentage + kcalPercentage) / 2;
    
    if (avgPercentage >= 95 && avgPercentage <= 105) return "green";
    if (avgPercentage >= 85 && avgPercentage < 95) return "yellow";
    if (avgPercentage > 105) return "red";
    return "none";
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeekStart = new Date(weekStart);
    newWeekStart.setDate(weekStart.getDate() + (direction === "next" ? 7 : -7));
    setWeekStart(newWeekStart);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const weekDays = getWeekDays();
  const { consumed: selectedDayConsumed, scheduled: selectedDayScheduled } = getMealsForDate(selectedDate);
  const selectedDayStats = getDayStats(selectedDate);

  const monthlyStats: DayStats[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const stats = getDayStats(date);
    monthlyStats.push({
      date: date.toISOString().split('T')[0],
      ...stats,
    });
  }

  const renderColumn = (columnId: string) => {
    if (!columnVisibility[columnId]) return null;

    switch (columnId) {
      case 'calculator':
        return (
          <MinimizableCard
            key="calculator"
            title="🧮 Macro Calculator"
            minimized={columnMinimized[columnId]}
            onMinimizeChange={(minimized) => setColumnMinimized(prev => ({ ...prev, [columnId]: minimized }))}
          >
            <MacroCalculator onCalculate={setTargets} />
          </MinimizableCard>
        );
      case 'bmi':
        return (
          <MinimizableCard
            key="bmi"
            title="📊 BMI Calculator"
            minimized={columnMinimized[columnId]}
            onMinimizeChange={(minimized) => setColumnMinimized(prev => ({ ...prev, [columnId]: minimized }))}
          >
            <BMICalculator />
          </MinimizableCard>
        );
      case 'water':
        return (
          <MinimizableCard
            key="water"
            title="💧 Water Intake"
            minimized={columnMinimized[columnId]}
            onMinimizeChange={(minimized) => setColumnMinimized(prev => ({ ...prev, [columnId]: minimized }))}
          >
            <WaterTracker />
          </MinimizableCard>
        );
      case 'goals':
        return targets ? (
          <MinimizableCard
            key="goals"
            title="🎯 Today's Goals"
            minimized={columnMinimized[columnId]}
            onMinimizeChange={(minimized) => setColumnMinimized(prev => ({ ...prev, [columnId]: minimized }))}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Today's Goals</h3>
              <Button variant="ghost" size="icon" onClick={handleEditGoals} data-testid="button-edit-goals">
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
            <MacroProgress current={selectedDayStats.kcal} target={targets.kcal} label="Calories" unit=" kcal" />
            <MacroProgress current={selectedDayStats.protein} target={targets.protein} label="Protein" unit="g" />
            <MacroProgress current={selectedDayStats.carbs} target={targets.carbs} label="Carbs" unit="g" />
            <MacroProgress current={selectedDayStats.fat} target={targets.fat} label="Fat" unit="g" />
          </MinimizableCard>
        ) : null;
      case 'meals':
        return (
          <MinimizableCard
            key="meals"
            title={isToday(selectedDate) ? "🍽️ Today's Meals" : `🍽️ Meals for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            minimized={columnMinimized[columnId]}
            onMinimizeChange={(minimized) => setColumnMinimized(prev => ({ ...prev, [columnId]: minimized }))}
          >
            <EnhancedMealLog
              meals={selectedDayConsumed}
              scheduledMeals={selectedDayScheduled}
              previousMeals={previousMeals}
              onAddMeal={handleAddMeal}
              onDeleteMeal={handleDeleteMeal}
              onUpdateMealEmoji={handleUpdateMealEmoji}
              onScanBarcode={handleScanBarcode}
              onConsumeMeal={handleConsumeMeal}
              targets={undefined}
            />
          </MinimizableCard>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-16">
      <PageHeader 
        title="Food Tracking" 
        icon={Utensils}
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

      <main className="w-full max-w-md lg:max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Date Carousel */}
        <DateCarousel 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        
        {columnOrder.map((columnId) => renderColumn(columnId))}
      </main>

      <Dialog open={isEditingGoals} onOpenChange={setIsEditingGoals}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Daily Goals</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="edit-kcal">Calories (kcal)</Label>
              <Input
                id="edit-kcal"
                type="number"
                value={editedGoals.kcal}
                onChange={(e) => setEditedGoals({ ...editedGoals, kcal: parseInt(e.target.value) || 0 })}
                data-testid="input-edit-kcal"
              />
            </div>
            <div>
              <Label htmlFor="edit-protein">Protein (g)</Label>
              <Input
                id="edit-protein"
                type="number"
                value={editedGoals.protein}
                onChange={(e) => setEditedGoals({ ...editedGoals, protein: parseInt(e.target.value) || 0 })}
                data-testid="input-edit-protein"
              />
            </div>
            <div>
              <Label htmlFor="edit-carbs">Carbs (g)</Label>
              <Input
                id="edit-carbs"
                type="number"
                value={editedGoals.carbs}
                onChange={(e) => setEditedGoals({ ...editedGoals, carbs: parseInt(e.target.value) || 0 })}
                data-testid="input-edit-carbs"
              />
            </div>
            <div>
              <Label htmlFor="edit-fat">Fat (g)</Label>
              <Input
                id="edit-fat"
                type="number"
                value={editedGoals.fat}
                onChange={(e) => setEditedGoals({ ...editedGoals, fat: parseInt(e.target.value) || 0 })}
                data-testid="input-edit-fat"
              />
            </div>
            <Button onClick={handleSaveGoals} className="w-full" data-testid="button-save-goals">
              Save Goals
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MonthlyStatsModal open={showStats} onOpenChange={setShowStats} />
    </div>
  );
}
