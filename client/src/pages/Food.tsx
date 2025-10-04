import { useState } from "react";
import ProteinCalculator from "@/components/ProteinCalculator";
import ProteinProgress from "@/components/ProteinProgress";
import StatsGrid from "@/components/StatsGrid";
import MealLog from "@/components/MealLog";
import ThemeToggle from "@/components/ThemeToggle";
import { TrendingUp, Target, Flame } from "lucide-react";

interface Meal {
  id: string;
  time: string;
  name: string;
  protein: number;
}

export default function Food() {
  const [meals, setMeals] = useState<Meal[]>([
    { id: "1", time: "08:00", name: "Oatmeal with protein powder", protein: 25 },
    { id: "2", time: "12:30", name: "Grilled chicken salad", protein: 35 },
  ]);

  const stats = [
    { label: "Weight", value: "70kg", icon: TrendingUp, color: "text-chart-1" },
    { label: "Goal", value: "120g", icon: Target, color: "text-chart-2" },
    { label: "Streak", value: "7d", icon: Flame, color: "text-warning" },
  ];

  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const target = 120;

  const handleAddMeal = (meal: Omit<Meal, "id">) => {
    setMeals([...meals, { ...meal, id: Date.now().toString() }]);
  };

  const handleDeleteMeal = (id: string) => {
    setMeals(meals.filter((m) => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Food Tracking</h1>
        <ThemeToggle />
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <ProteinCalculator />
        <StatsGrid stats={stats} />
        <ProteinProgress current={totalProtein} target={target} />
        <MealLog meals={meals} onAddMeal={handleAddMeal} onDeleteMeal={handleDeleteMeal} />
      </main>
    </div>
  );
}
