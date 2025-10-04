import { useState } from "react";
import MacroCalculator from "@/components/MacroCalculator";
import WeightGoalTracker from "@/components/WeightGoalTracker";
import EnhancedMealLog from "@/components/EnhancedMealLog";
import ThemeToggle from "@/components/ThemeToggle";
import Settings from "@/components/Settings";

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

export default function Food() {
  const [currentWeight, setCurrentWeight] = useState(70);
  const [targets, setTargets] = useState<{ kcal: number; protein: number; carbs: number; fat: number } | null>(null);
  const [meals, setMeals] = useState<Meal[]>([
    { id: "1", time: "08:00", name: "Oatmeal with protein powder", protein: 25, carbs: 45, fat: 10, kcal: 350, emoji: "🥣" },
    { id: "2", time: "12:30", name: "Grilled chicken salad", protein: 35, carbs: 20, fat: 15, kcal: 355, emoji: "🥗" },
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
        <EnhancedMealLog
          meals={meals}
          previousMeals={previousMeals}
          onAddMeal={handleAddMeal}
          onDeleteMeal={handleDeleteMeal}
          onScanBarcode={handleScanBarcode}
          targets={targets || undefined}
        />
      </main>
    </div>
  );
}
