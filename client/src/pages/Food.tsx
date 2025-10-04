import { useState, useEffect } from "react";
import MacroCalculator from "@/components/MacroCalculator";
import WeightGoalTracker from "@/components/WeightGoalTracker";
import EnhancedMealLog from "@/components/EnhancedMealLog";
import ThemeToggle from "@/components/ThemeToggle";
import Settings from "@/components/Settings";
import AIChatBubble from "@/components/AIChatBubble";
import { Card } from "@/components/ui/card";
import MacroProgress from "@/components/MacroProgress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
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
    type: "now" | "day" | "weekly" | "biweekly";
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
  const [currentWeight, setCurrentWeight] = useState(70);
  const [targets, setTargets] = useState<{ kcal: number; protein: number; carbs: number; fat: number } | null>(() => {
    const saved = localStorage.getItem('calculator_results');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  
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
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      { id: "1", time: "08:00", name: "Oatmeal with protein powder", protein: 25, carbs: 45, fat: 10, kcal: 350, emoji: "🥣", date: new Date().toISOString().split('T')[0] },
      { id: "2", time: "12:30", name: "Grilled chicken salad", protein: 35, carbs: 20, fat: 15, kcal: 355, emoji: "🥗", date: new Date().toISOString().split('T')[0] },
      { 
        id: "3", 
        time: "18:00", 
        name: "Protein pasta", 
        protein: 30, 
        carbs: 50, 
        fat: 12, 
        kcal: 428, 
        emoji: "🍝",
        schedule: { type: "weekly", day: "tuesday", time: "18:00" }
      },
    ];
  });

  const [previousMeals] = useState<Meal[]>([
    { id: "p1", time: "08:00", name: "Protein shake", protein: 30, carbs: 10, fat: 5, kcal: 205, emoji: "🥤" },
    { id: "p2", time: "13:00", name: "Chicken and rice", protein: 40, carbs: 60, fat: 12, kcal: 508, emoji: "🍗" },
    { id: "p3", time: "19:00", name: "Salmon with vegetables", protein: 35, carbs: 25, fat: 20, kcal: 420, emoji: "🐟" },
  ]);

  useEffect(() => {
    const handleWeekStartChange = () => {
      setWeekStart(getWeekStart());
    };
    window.addEventListener('weekStartDayChanged', handleWeekStartChange);
    return () => window.removeEventListener('weekStartDayChanged', handleWeekStartChange);
  }, []);

  const handleAddMeal = (meal: Omit<Meal, "id">) => {
    const newMeal = { 
      ...meal, 
      id: Date.now().toString(),
      date: selectedDate.toISOString().split('T')[0]
    };
    const updatedMeals = [...meals, newMeal];
    setMeals(updatedMeals);
    localStorage.setItem('meals', JSON.stringify(updatedMeals));
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
    
    const directMeals = meals.filter(m => m.date === dateStr && !m.schedule);
    const scheduledMeals = meals.filter(m => 
      m.schedule && 
      m.schedule.day?.toLowerCase().includes(dayName.toLowerCase()) &&
      (m.schedule.type === "weekly" || m.schedule.type === "biweekly")
    );
    
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Food Tracking</h1>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-monthly-stats">
                <BarChart3 className="w-4 h-4 mr-2" />
                Monthly Stats
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Last 30 Days Stats</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-4">
                {targets && (
                  <div className="grid grid-cols-4 gap-2 p-3 bg-muted rounded-md mb-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Daily Target</p>
                      <p className="font-bold text-sm">{targets.kcal} kcal</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Protein</p>
                      <p className="font-bold text-sm">{targets.protein}g</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Carbs</p>
                      <p className="font-bold text-sm">{targets.carbs}g</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Fat</p>
                      <p className="font-bold text-sm">{targets.fat}g</p>
                    </div>
                  </div>
                )}
                {monthlyStats.map((stat, index) => {
                  const date = new Date(stat.date);
                  const proteinStatus = targets 
                    ? stat.protein >= targets.protein * 0.95 && stat.protein <= targets.protein * 1.05 
                      ? "✓" : stat.protein < targets.protein * 0.95 ? "✗" : "⚠"
                    : "-";
                  const fatStatus = targets 
                    ? stat.fat >= targets.fat * 0.95 && stat.fat <= targets.fat * 1.05 
                      ? "✓" : stat.fat < targets.fat * 0.95 ? "✗" : "⚠"
                    : "-";
                  
                  return (
                    <div 
                      key={stat.date} 
                      className="flex items-center justify-between p-3 bg-muted rounded-md"
                      data-testid={`monthly-stat-${index}`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                          <span>P: {stat.protein}g {proteinStatus}</span>
                          <span>C: {stat.carbs}g</span>
                          <span>F: {stat.fat}g {fatStatus}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{stat.kcal} kcal</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
          <Settings />
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <MacroCalculator onCalculate={setTargets} />
        <WeightGoalTracker currentWeight={currentWeight} onWeightUpdate={setCurrentWeight} />
        
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigateWeek("prev")} data-testid="button-prev-week">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h3 className="text-base font-semibold">Week View</h3>
            <Button variant="ghost" size="icon" onClick={() => navigateWeek("next")} data-testid="button-next-week">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex justify-between gap-1">
            {weekDays.map((date, index) => {
              const status = getGoalStatus(date);
              const isTodayDate = isToday(date);
              const isSelected = isSelectedDate(date);
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all flex-1 ${
                    isSelected 
                      ? "bg-primary text-primary-foreground" 
                      : isTodayDate
                      ? "bg-accent"
                      : "hover-elevate"
                  }`}
                  data-testid={`button-day-${index}`}
                >
                  <span className="text-xs font-medium mb-2">{daysOfWeek[date.getDay()]}</span>
                  <span className="text-lg font-bold mb-2">{date.getDate()}</span>
                  <div 
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      status === "green" 
                        ? "bg-success border-success" 
                        : status === "yellow"
                        ? "bg-warning border-warning"
                        : status === "red"
                        ? "bg-destructive border-destructive"
                        : "border-muted-foreground/30"
                    }`}
                    data-testid={`indicator-${index}`}
                  >
                    {status !== "none" && <span className="text-xs">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div>
          <h3 className="text-lg font-semibold mb-4">
            {isToday(selectedDate) ? "Today's Meals" : `Meals for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          </h3>
          
          {targets && (
            <Card className="p-4 mb-4 space-y-4">
              <MacroProgress current={selectedDayStats.kcal} target={targets.kcal} label="Calories" unit=" kcal" />
              <MacroProgress current={selectedDayStats.protein} target={targets.protein} label="Protein" unit="g" />
              <MacroProgress current={selectedDayStats.carbs} target={targets.carbs} label="Carbs" unit="g" />
              <MacroProgress current={selectedDayStats.fat} target={targets.fat} label="Fat" unit="g" />
            </Card>
          )}

          <EnhancedMealLog
            meals={selectedDayConsumed}
            scheduledMeals={selectedDayScheduled}
            previousMeals={previousMeals}
            onAddMeal={handleAddMeal}
            onDeleteMeal={handleDeleteMeal}
            onUpdateMealEmoji={handleUpdateMealEmoji}
            onScanBarcode={handleScanBarcode}
            onConsumeMeal={handleConsumeScheduledMeal}
            targets={undefined}
          />
        </div>
      </main>
      
      <AIChatBubble onMealLogged={handleAddMeal} />
    </div>
  );
}
