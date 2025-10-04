import { useState } from "react";
import MacroCalculator from "@/components/MacroCalculator";
import WeightGoalTracker from "@/components/WeightGoalTracker";
import EnhancedMealLog from "@/components/EnhancedMealLog";
import ThemeToggle from "@/components/ThemeToggle";
import Settings from "@/components/Settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import MacroProgress from "@/components/MacroProgress";

interface Meal {
  id: string;
  time: string;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  kcal: number;
  emoji: string;
  schedule?: {
    type: "now" | "day" | "weekly" | "biweekly";
    day?: string;
    time?: string;
  };
}

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function Food() {
  const [currentWeight, setCurrentWeight] = useState(70);
  const [targets, setTargets] = useState<{ kcal: number; protein: number; carbs: number; fat: number } | null>(null);
  const [viewMode, setViewMode] = useState<"overview" | "daily">("overview");
  const [meals, setMeals] = useState<Meal[]>([
    { id: "1", time: "08:00", name: "Oatmeal with protein powder", protein: 25, carbs: 45, fat: 10, kcal: 350, emoji: "🥣" },
    { id: "2", time: "12:30", name: "Grilled chicken salad", protein: 35, carbs: 20, fat: 15, kcal: 355, emoji: "🥗" },
    { 
      id: "3", 
      time: "18:00", 
      name: "Protein pasta", 
      protein: 30, 
      carbs: 50, 
      fat: 12, 
      kcal: 428, 
      emoji: "🍝",
      schedule: { type: "day", day: "tuesday", time: "18:00" }
    },
    { 
      id: "4", 
      time: "13:00", 
      name: "Tuna salad", 
      protein: 35, 
      carbs: 15, 
      fat: 10, 
      kcal: 290, 
      emoji: "🥗",
      schedule: { type: "weekly", day: "wednesday", time: "13:00" }
    },
  ]);

  const [previousMeals] = useState<Meal[]>([
    { id: "p1", time: "08:00", name: "Protein shake", protein: 30, carbs: 10, fat: 5, kcal: 205, emoji: "🥤" },
    { id: "p2", time: "13:00", name: "Chicken and rice", protein: 40, carbs: 60, fat: 12, kcal: 508, emoji: "🍗" },
    { id: "p3", time: "19:00", name: "Salmon with vegetables", protein: 35, carbs: 25, fat: 20, kcal: 420, emoji: "🐟" },
  ]);

  const handleAddMeal = (meal: Omit<Meal, "id">) => {
    setMeals([...meals, { ...meal, id: Date.now().toString() }]);
  };

  const handleDeleteMeal = (id: string) => {
    setMeals(meals.filter((m) => m.id !== id));
  };

  const handleScanBarcode = () => {
    alert("Barcode scanning feature would open camera here. This requires camera permissions and a barcode scanning API.");
  };

  const todayMeals = meals.filter(m => !m.schedule || m.schedule.type === "now");
  const scheduledMeals = meals.filter(m => m.schedule && m.schedule.type !== "now");

  const getMealsForDay = (day: string) => {
    return meals.filter(m => 
      m.schedule && 
      m.schedule.day?.toLowerCase() === day.toLowerCase() &&
      (m.schedule.type === "day" || m.schedule.type === "weekly" || m.schedule.type === "biweekly")
    );
  };

  const calculateDayTotals = (dayMeals: Meal[]) => {
    return {
      kcal: dayMeals.reduce((sum, m) => sum + m.kcal, 0),
      protein: dayMeals.reduce((sum, m) => sum + m.protein, 0),
      carbs: dayMeals.reduce((sum, m) => sum + m.carbs, 0),
      fat: dayMeals.reduce((sum, m) => sum + m.fat, 0),
    };
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Food Tracking</h1>
        <div className="flex gap-2">
          <Settings />
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <MacroCalculator onCalculate={setTargets} />
        <WeightGoalTracker currentWeight={currentWeight} onWeightUpdate={setCurrentWeight} />
        
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="daily" data-testid="tab-daily">Daily View</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-4">Today's Meals</h3>
              {targets && (
                <Card className="p-4 mb-4 space-y-4">
                  <MacroProgress current={calculateDayTotals(todayMeals).kcal} target={targets.kcal} label="Calories" unit=" kcal" />
                  <MacroProgress current={calculateDayTotals(todayMeals).protein} target={targets.protein} label="Protein" unit="g" />
                  <MacroProgress current={calculateDayTotals(todayMeals).carbs} target={targets.carbs} label="Carbs" unit="g" />
                  <MacroProgress current={calculateDayTotals(todayMeals).fat} target={targets.fat} label="Fat" unit="g" />
                </Card>
              )}
              <EnhancedMealLog
                meals={todayMeals}
                previousMeals={previousMeals}
                onAddMeal={handleAddMeal}
                onDeleteMeal={handleDeleteMeal}
                onScanBarcode={handleScanBarcode}
                targets={undefined}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Scheduled Meals</h3>
              <EnhancedMealLog
                meals={scheduledMeals}
                previousMeals={[]}
                onAddMeal={handleAddMeal}
                onDeleteMeal={handleDeleteMeal}
                onScanBarcode={handleScanBarcode}
                targets={undefined}
                hideAddButton
              />
            </div>
          </TabsContent>

          <TabsContent value="daily" className="space-y-4 mt-4">
            {daysOfWeek.map((day) => {
              const dayMeals = getMealsForDay(day);
              const totals = calculateDayTotals(dayMeals);
              
              return (
                <Card key={day} className="p-4">
                  <h3 className="text-base font-semibold mb-3 capitalize">{day}</h3>
                  
                  {dayMeals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No meals scheduled</p>
                  ) : (
                    <div className="space-y-3">
                      {targets && (
                        <div className="space-y-2 mb-4 pb-4 border-b border-border">
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Kcal</p>
                              <p className="font-bold font-mono">{totals.kcal}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Protein</p>
                              <p className="font-bold font-mono">{totals.protein}g</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Carbs</p>
                              <p className="font-bold font-mono">{totals.carbs}g</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Fat</p>
                              <p className="font-bold font-mono">{totals.fat}g</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {dayMeals.map((meal) => (
                        <div key={meal.id} className="flex items-center gap-3 p-2 bg-muted rounded-md" data-testid={`meal-card-${meal.id}`}>
                          <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-xl flex-shrink-0">
                            {meal.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{meal.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{meal.time}</span>
                              <span>•</span>
                              <span>{meal.kcal} kcal</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
