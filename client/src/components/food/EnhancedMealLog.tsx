import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Camera } from "lucide-react";
import { UniversalDialog } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    type: "now" | "today" | "day" | "weekly" | "biweekly" | "monthly";
    day?: string;
    time?: string;
  };
}

interface EnhancedMealLogProps {
  meals: Meal[];
  scheduledMeals?: Meal[];
  previousMeals: Meal[];
  onAddMeal: (meal: Omit<Meal, "id">) => void;
  onDeleteMeal: (id: string) => void;
  onUpdateMealEmoji?: (id: string, emoji: string) => void;
  onScanBarcode: () => void;
  onConsumeMeal?: (id: string) => void;
  targets?: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  hideAddButton?: boolean;
  showTitle?: string;
}

const foodEmojis = ["🍗", "🥗", "🍳", "🥙", "🍕", "🍔", "🥩", "🍜", "🍛", "🥘", "🍲", "🍱", "🥪", "🌮", "🌯", "🍣", "🥑", "🍎", "🍌", "🥤", "☕", "🥛", "💊"];

export default function EnhancedMealLog({ 
  meals, 
  scheduledMeals = [],
  previousMeals, 
  onAddMeal, 
  onDeleteMeal, 
  onUpdateMealEmoji,
  onScanBarcode, 
  onConsumeMeal, 
  targets, 
  hideAddButton = false,
  showTitle
}: EnhancedMealLogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mealName, setMealName] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [time, setTime] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🍗");
  const [scheduleType, setScheduleType] = useState<"now" | "today" | "day" | "weekly" | "biweekly" | "monthly">("now");
  const [scheduleDay, setScheduleDay] = useState("monday");
  const [specificDate, setSpecificDate] = useState(""); // For "Specific day" calendar date
  const [scheduleTime, setScheduleTime] = useState("");
  
  const [emojiPickerMealId, setEmojiPickerMealId] = useState<string | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [saveToQuickAdd, setSaveToQuickAdd] = useState(false);

  const calculateKcal = () => {
    const p = parseFloat(protein) || 0;
    const c = parseFloat(carbs) || 0;
    const f = parseFloat(fat) || 0;
    return p * 4 + c * 4 + f * 9;
  };

  const handleSubmit = () => {
    if (mealName) {
      const kcal = calculateKcal();
      const schedule = scheduleType !== "now" && scheduleType !== "today" ? {
        type: scheduleType,
        day: scheduleType === "day" ? specificDate : scheduleDay,
        time: scheduleTime || time,
      } : (scheduleType === "today" ? {
        type: "today" as const,
        day: new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
        time: scheduleTime || time,
      } : undefined);

      onAddMeal({
        name: mealName,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        kcal,
        time: scheduleType === "now" || scheduleType === "today" ? (time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })) : scheduleTime,
        emoji: selectedEmoji,
        schedule,
      });
      
      // Save to quick add if checkbox is checked
      if (saveToQuickAdd) {
        const quickAddMeals = JSON.parse(localStorage.getItem('quickAddMeals') || '[]');
        const newQuickAddMeal = {
          id: Date.now().toString(),
          name: mealName,
          protein: parseFloat(protein) || 0,
          carbs: parseFloat(carbs) || 0,
          fat: parseFloat(fat) || 0,
          kcal,
          emoji: selectedEmoji,
          time: '',
        };
        quickAddMeals.push(newQuickAddMeal);
        localStorage.setItem('quickAddMeals', JSON.stringify(quickAddMeals));
      }
      
      setMealName("");
      setProtein("");
      setCarbs("");
      setFat("");
      setTime("");
      setSelectedEmoji("🍗");
      setScheduleType("now");
      setScheduleDay("monday");
      setSpecificDate("");
      setScheduleTime("");
      setSaveToQuickAdd(false);
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
      schedule: undefined, // Quick add meals are consumed immediately
    });
    setIsOpen(false);
  };

  const handleEmojiChange = (emoji: string) => {
    if (emojiPickerMealId && onUpdateMealEmoji) {
      onUpdateMealEmoji(emojiPickerMealId, emoji);
    }
    setEmojiPickerOpen(false);
    setEmojiPickerMealId(null);
  };

  const renderMealCard = (meal: Meal, isScheduled: boolean = false) => (
    <Card 
      key={meal.id} 
      className={`p-4 ${isScheduled && onConsumeMeal ? 'hover-elevate cursor-pointer' : 'hover-elevate'}`}
      onClick={() => isScheduled && onConsumeMeal ? onConsumeMeal(meal.id) : undefined}
      data-testid={`card-meal-${meal.id}`}
    >
      <div className="flex items-start gap-4">
        <button
          className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-4xl flex-shrink-0 hover-elevate transition-transform active:scale-95"
          onClick={(e) => {
            e.stopPropagation();
            setEmojiPickerMealId(meal.id);
            setEmojiPickerOpen(true);
          }}
          data-testid={`button-emoji-${meal.id}`}
        >
          {meal.emoji}
        </button>
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
            <p className="text-xs text-success mt-2">
              Tap to consume • {meal.schedule.type === "today" && `Scheduled for today`}
              {meal.schedule.type === "weekly" && `Weekly on ${meal.schedule.day}`}
              {meal.schedule.type === "biweekly" && `Every 2 weeks on ${meal.schedule.day}`}
              {meal.schedule.type === "monthly" && `Monthly on ${meal.schedule.day}`}
              {meal.schedule.type === "day" && `Scheduled for ${meal.schedule.day}`}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteMeal(meal.id);
          }}
          data-testid={`button-delete-meal-${meal.id}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4">
      {!hideAddButton && (
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" onClick={() => setIsOpen(true)} data-testid="button-add-meal">
            <Plus className="w-4 h-4 mr-2" />
            Log Food
          </Button>
        </div>
      )}

      <UniversalDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Log a Meal"
        hideDefaultFooter
      >
        <div className="flex items-center justify-end mb-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={onScanBarcode} 
            data-testid="button-scan-barcode"
          >
            <Camera className="w-4 h-4 mr-2" />
            Scan Barcode
          </Button>
        </div>
        <Tabs defaultValue="manual">
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
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="save-quick-add"
                      checked={saveToQuickAdd}
                      onChange={(e) => setSaveToQuickAdd(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <Label htmlFor="save-quick-add" className="cursor-pointer">
                      Save to Quick Add
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="schedule-type">When to eat?</Label>
                    <Select value={scheduleType} onValueChange={(v) => setScheduleType(v as typeof scheduleType)}>
                      <SelectTrigger id="schedule-type" data-testid="select-schedule-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="now">Eat now</SelectItem>
                        <SelectItem value="today">Schedule for today</SelectItem>
                        <SelectItem value="day">Specific day</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {scheduleType !== "now" && scheduleType !== "today" && (
                    <div className="space-y-3">
                      {scheduleType === "day" ? (
                        <div>
                          <Label htmlFor="specific-date">Date</Label>
                          <Input
                            id="specific-date"
                            type="date"
                            value={specificDate}
                            onChange={(e) => setSpecificDate(e.target.value)}
                            data-testid="input-specific-date"
                          />
                        </div>
                      ) : (
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
                      )}
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
                  {(() => {
                    const quickAddMeals = JSON.parse(localStorage.getItem('quickAddMeals') || '[]');
                    const allQuickMeals = [...quickAddMeals, ...previousMeals];
                    
                    return allQuickMeals.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No quick add meals found</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {allQuickMeals.map((meal) => {
                          const isCustomQuickAdd = quickAddMeals.some((qm: Meal) => qm.id === meal.id);
                          
                          return (
                            <Card
                              key={meal.id}
                              className="p-3 hover-elevate cursor-pointer relative group"
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
                                {isCustomQuickAdd && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const updated = quickAddMeals.filter((qm: Meal) => qm.id !== meal.id);
                                      localStorage.setItem('quickAddMeals', JSON.stringify(updated));
                                      setIsOpen(false); // Force re-render
                                      setTimeout(() => setIsOpen(true), 0);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    );
                  })()}
                </TabsContent>
        </Tabs>
      </UniversalDialog>

      {showTitle && <h4 className="text-sm font-semibold text-muted-foreground">{showTitle}</h4>}

      <div className="space-y-3">
        {meals.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <Button
              size="icon"
              variant="outline"
              className="h-16 w-16 rounded-full"
                onClick={() => setIsOpen(true)}
              title="Log food"
            >
              <Plus className="w-8 h-8" />
            </Button>
          </div>
        ) : (
          meals.map((meal) => renderMealCard(meal, false))
        )}
      </div>

      {scheduledMeals.length > 0 && (
        <div className="space-y-3 pt-4">
          <h4 className="text-sm font-semibold text-muted-foreground">Scheduled Meals</h4>
          {scheduledMeals.map((meal) => renderMealCard(meal, true))}
        </div>
      )}

      <UniversalDialog
        open={emojiPickerOpen}
        onOpenChange={setEmojiPickerOpen}
        title="Change Emoji"
        hideDefaultFooter
      >
        <div className="flex flex-wrap gap-2">
          {foodEmojis.map((emoji, index) => (
            <button
              key={`picker-${emoji}-${index}`}
              type="button"
              onClick={() => handleEmojiChange(emoji)}
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-muted hover-elevate"
              data-testid={`button-picker-emoji-${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </UniversalDialog>
    </div>
  );
}
