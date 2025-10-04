import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Meal {
  id: string;
  time: string;
  name: string;
  protein: number;
}

interface MealLogProps {
  meals: Meal[];
  onAddMeal: (meal: Omit<Meal, "id">) => void;
  onDeleteMeal: (id: string) => void;
}

export default function MealLog({ meals, onAddMeal, onDeleteMeal }: MealLogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mealName, setMealName] = useState("");
  const [protein, setProtein] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = () => {
    if (mealName && protein && time) {
      onAddMeal({
        name: mealName,
        protein: parseFloat(protein),
        time,
      });
      setMealName("");
      setProtein("");
      setTime("");
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Today's Meals</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-meal">
              <Plus className="w-4 h-4 mr-2" />
              Log Food
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log a Meal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="meal-name">Meal Name</Label>
                <Input
                  id="meal-name"
                  placeholder="Grilled chicken"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  data-testid="input-meal-name"
                />
              </div>
              <div>
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  placeholder="30"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  data-testid="input-meal-protein"
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  data-testid="input-meal-time"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full" data-testid="button-submit-meal">
                Add Meal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {meals.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No meals logged yet</p>
          </Card>
        ) : (
          meals.map((meal) => (
            <Card key={meal.id} className="p-4 hover-elevate" data-testid={`card-meal-${meal.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3">
                    <p className="text-sm text-muted-foreground font-mono">{meal.time}</p>
                    <p className="font-medium truncate" data-testid={`text-meal-name-${meal.id}`}>{meal.name}</p>
                  </div>
                  <p className="text-sm text-chart-1 font-semibold mt-1" data-testid={`text-meal-protein-${meal.id}`}>
                    {meal.protein}g protein
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteMeal(meal.id)}
                  data-testid={`button-delete-meal-${meal.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
