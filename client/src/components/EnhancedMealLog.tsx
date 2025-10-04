import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Camera, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Meal {
  id: string;
  time: string;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  kcal: number;
  isDaily?: boolean;
}

interface EnhancedMealLogProps {
  meals: Meal[];
  previousMeals: Meal[];
  onAddMeal: (meal: Omit<Meal, "id">) => void;
  onDeleteMeal: (id: string) => void;
  onScanBarcode: () => void;
}

export default function EnhancedMealLog({ meals, previousMeals, onAddMeal, onDeleteMeal, onScanBarcode }: EnhancedMealLogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mealName, setMealName] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [time, setTime] = useState("");
  const [isDaily, setIsDaily] = useState(false);

  const calculateKcal = () => {
    const p = parseFloat(protein) || 0;
    const c = parseFloat(carbs) || 0;
    const f = parseFloat(fat) || 0;
    return p * 4 + c * 4 + f * 9;
  };

  const handleSubmit = () => {
    if (mealName && time) {
      const kcal = calculateKcal();
      onAddMeal({
        name: mealName,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        kcal,
        time,
        isDaily,
      });
      setMealName("");
      setProtein("");
      setCarbs("");
      setFat("");
      setTime("");
      setIsDaily(false);
      setIsOpen(false);
    }
  };

  const handleQuickAdd = (meal: Meal) => {
    onAddMeal({
      name: meal.name,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      kcal: meal.kcal,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      isDaily: false,
    });
    setIsOpen(false);
  };

  const totalKcal = meals.reduce((sum, meal) => sum + meal.kcal, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Today's Meals</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onScanBarcode} data-testid="button-scan-barcode">
            <Camera className="w-4 h-4" />
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-meal">
                <Plus className="w-4 h-4 mr-2" />
                Log Food
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Log a Meal</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="manual" className="pt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual" data-testid="tab-manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="quick" data-testid="tab-quick-add">Quick Add</TabsTrigger>
                </TabsList>
                
                <TabsContent value="manual" className="space-y-4">
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
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="protein" className="text-sm">Protein (g)</Label>
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
                      <Label htmlFor="carbs" className="text-sm">Carbs (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        placeholder="40"
                        value={carbs}
                        onChange={(e) => setCarbs(e.target.value)}
                        data-testid="input-meal-carbs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fat" className="text-sm">Fat (g)</Label>
                      <Input
                        id="fat"
                        type="number"
                        placeholder="15"
                        value={fat}
                        onChange={(e) => setFat(e.target.value)}
                        data-testid="input-meal-fat"
                      />
                    </div>
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
                  {calculateKcal() > 0 && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Estimated Calories</p>
                      <p className="text-lg font-bold font-mono" data-testid="text-calculated-kcal">
                        {Math.round(calculateKcal())} kcal
                      </p>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="daily"
                      checked={isDaily}
                      onCheckedChange={(checked) => setIsDaily(!!checked)}
                      data-testid="checkbox-daily-meal"
                    />
                    <Label htmlFor="daily" className="text-sm cursor-pointer">
                      Set as daily recurring meal (will appear in To Do)
                    </Label>
                  </div>
                  <Button onClick={handleSubmit} className="w-full" data-testid="button-submit-meal">
                    Add Meal
                  </Button>
                </TabsContent>

                <TabsContent value="quick" className="space-y-3">
                  {previousMeals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No previous meals found</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {previousMeals.map((meal) => (
                        <Card
                          key={meal.id}
                          className="p-3 hover-elevate cursor-pointer"
                          onClick={() => handleQuickAdd(meal)}
                          data-testid={`card-quick-add-${meal.id}`}
                        >
                          <p className="font-medium mb-1">{meal.name}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{meal.kcal} kcal</span>
                            <span>P: {meal.protein}g</span>
                            <span>C: {meal.carbs}g</span>
                            <span>F: {meal.fat}g</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Calories</p>
            <p className="text-lg font-bold font-mono" data-testid="text-total-kcal">{totalKcal}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Protein</p>
            <p className="text-lg font-bold font-mono text-chart-1" data-testid="text-total-protein">{totalProtein}g</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Carbs</p>
            <p className="text-lg font-bold font-mono text-chart-3" data-testid="text-total-carbs">{totalCarbs}g</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Fat</p>
            <p className="text-lg font-bold font-mono text-chart-4" data-testid="text-total-fat">{totalFat}g</p>
          </div>
        </div>
      </Card>

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
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-sm text-muted-foreground font-mono">{meal.time}</p>
                    <p className="font-medium truncate" data-testid={`text-meal-name-${meal.id}`}>{meal.name}</p>
                    {meal.isDaily && (
                      <Clock className="w-4 h-4 text-warning flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-semibold">{meal.kcal} kcal</span>
                    <span className="text-chart-1">P: {meal.protein}g</span>
                    <span className="text-chart-3">C: {meal.carbs}g</span>
                    <span className="text-chart-4">F: {meal.fat}g</span>
                  </div>
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
