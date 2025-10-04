import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Camera } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MacroProgress from "./MacroProgress";

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

interface EnhancedMealLogProps {
  meals: Meal[];
  previousMeals: Meal[];
  onAddMeal: (meal: Omit<Meal, "id">) => void;
  onDeleteMeal: (id: string) => void;
  onScanBarcode: () => void;
  targets?: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  hideAddButton?: boolean;
}

const foodEmojis = ["🍗", "🥗", "🍳", "🥙", "🍕", "🍔", "🥩", "🍜", "🍛", "🥘", "🍲", "🍱", "🥪", "🌮", "🌯", "🍣", "🥑", "🍎", "🍌", "🥤", "☕", "🥛", "💊"];

export default function EnhancedMealLog({ meals, previousMeals, onAddMeal, onDeleteMeal, onScanBarcode, targets, hideAddButton = false }: EnhancedMealLogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mealName, setMealName] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [time, setTime] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🍗");
  const [scheduleType, setScheduleType] = useState<"now" | "day" | "weekly" | "biweekly">("now");
  const [scheduleDay, setScheduleDay] = useState("monday");
  const [scheduleTime, setScheduleTime] = useState("");

  const calculateKcal = () => {
    const p = parseFloat(protein) || 0;
    const c = parseFloat(carbs) || 0;
    const f = parseFloat(fat) || 0;
    return p * 4 + c * 4 + f * 9;
  };

  const handleSubmit = () => {
    if (mealName) {
      const kcal = calculateKcal();
      const schedule = scheduleType !== "now" ? {
        type: scheduleType,
        day: scheduleDay,
        time: scheduleTime || time,
      } : undefined;

      onAddMeal({
        name: mealName,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        kcal,
        time: scheduleType === "now" ? (time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })) : scheduleTime,
        emoji: selectedEmoji,
        schedule,
      });
      setMealName("");
      setProtein("");
      setCarbs("");
      setFat("");
      setTime("");
      setSelectedEmoji("🍗");
      setScheduleType("now");
      setScheduleDay("monday");
      setScheduleTime("");
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
      emoji: meal.emoji,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    });
    setIsOpen(false);
  };

  const totalKcal = meals.reduce((sum, meal) => sum + meal.kcal, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);

  return (
    <div className="space-y-4">
      {!hideAddButton && (
        <div className="flex items-center justify-end gap-2">
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
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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

                  <div>
                    <Label className="mb-2 block">Choose Emoji</Label>
                    <div className="flex flex-wrap gap-2">
                      {foodEmojis.map((emoji, index) => (
                        <button
                          key={`${emoji}-${index}`}
                          type="button"
                          onClick={() => setSelectedEmoji(emoji)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                            selectedEmoji === emoji
                              ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                              : "bg-muted hover-elevate"
                          }`}
                          data-testid={`button-emoji-${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
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

                  {calculateKcal() > 0 && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Estimated Calories</p>
                      <p className="text-lg font-bold font-mono" data-testid="text-calculated-kcal">
                        {Math.round(calculateKcal())} kcal
                      </p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="schedule-type">When to eat?</Label>
                    <Select value={scheduleType} onValueChange={(v) => setScheduleType(v as typeof scheduleType)}>
                      <SelectTrigger id="schedule-type" data-testid="select-schedule-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="now">Add now</SelectItem>
                        <SelectItem value="day">Specific day</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {scheduleType !== "now" && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="schedule-day">Day</Label>
                        <Select value={scheduleDay} onValueChange={setScheduleDay}>
                          <SelectTrigger id="schedule-day" data-testid="select-schedule-day">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monday">Monday</SelectItem>
                            <SelectItem value="tuesday">Tuesday</SelectItem>
                            <SelectItem value="wednesday">Wednesday</SelectItem>
                            <SelectItem value="thursday">Thursday</SelectItem>
                            <SelectItem value="friday">Friday</SelectItem>
                            <SelectItem value="saturday">Saturday</SelectItem>
                            <SelectItem value="sunday">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="schedule-time">Time</Label>
                        <Input
                          id="schedule-time"
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          data-testid="input-schedule-time"
                        />
                      </div>
                    </div>
                  )}

                  {scheduleType === "now" && (
                    <div>
                      <Label htmlFor="time">Time (Optional)</Label>
                      <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        data-testid="input-meal-time"
                      />
                    </div>
                  )}

                  <Button onClick={handleSubmit} className="w-full" data-testid="button-submit-meal">
                    {scheduleType === "now" ? "Add Meal" : "Schedule Meal"}
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
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl flex-shrink-0">
                              {meal.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium mb-1 truncate">{meal.name}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{meal.kcal} kcal</span>
                                <span>P: {meal.protein}g</span>
                                <span>C: {meal.carbs}g</span>
                                <span>F: {meal.fat}g</span>
                              </div>
                            </div>
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
      )}

      {targets && (
        <Card className="p-4 space-y-4">
          <MacroProgress current={totalKcal} target={targets.kcal} label="Calories" unit=" kcal" />
          <MacroProgress current={totalProtein} target={targets.protein} label="Protein" unit="g" />
          <MacroProgress current={totalCarbs} target={targets.carbs} label="Carbs" unit="g" />
          <MacroProgress current={totalFat} target={targets.fat} label="Fat" unit="g" />
        </Card>
      )}

      <div className="space-y-3">
        {meals.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No meals logged yet</p>
          </Card>
        ) : (
          meals.map((meal) => (
            <Card key={meal.id} className="p-4 hover-elevate" data-testid={`card-meal-${meal.id}`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl flex-shrink-0">
                  {meal.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-sm text-muted-foreground font-mono">{meal.time}</p>
                    <p className="font-medium truncate" data-testid={`text-meal-name-${meal.id}`}>{meal.name}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <span className="font-semibold">{meal.kcal} kcal</span>
                    <span className="text-chart-1">P: {meal.protein}g</span>
                    <span className="text-chart-3">C: {meal.carbs}g</span>
                    <span className="text-chart-4">F: {meal.fat}g</span>
                  </div>
                  {meal.schedule && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {meal.schedule.type === "weekly" && `Weekly on ${meal.schedule.day}`}
                      {meal.schedule.type === "biweekly" && `Every 2 weeks on ${meal.schedule.day}`}
                      {meal.schedule.type === "day" && `Scheduled for ${meal.schedule.day}`}
                    </p>
                  )}
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
