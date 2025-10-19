import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import UniversalContainer from "@/components/UniversalContainer";
import { Progress } from "@/components/ui/progress";
import { Droplet, Plus, Clock, Bell, Settings } from "lucide-react";
import { UniversalDialog } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isToday } from "date-fns";

interface WaterEntry {
  id: string;
  amount: number;
  unit: "ml" | "oz";
  time: string;
  date: string;
}

interface WaterSettings {
  dailyGoal: number;
  unit: "ml" | "oz";
  remindersEnabled: boolean;
  addToTodo: boolean; // whether to add reminders to To Do list
  reminderInterval: number; // in hours
  reminderStartTime: string; // HH:MM format
  reminderEndTime: string; // HH:MM format
}

export default function WaterTracker() {
  const [settings, setSettings] = useState<WaterSettings>(() => {
    const saved = localStorage.getItem('water_settings');
    const defaultSettings = { 
      dailyGoal: 2000, 
      unit: 'ml',
      remindersEnabled: true, // Enable by default for testing
      addToTodo: true, // default to adding to To Do list
      reminderInterval: 2,
      reminderStartTime: '08:00',
      reminderEndTime: '22:00'
    };
    
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Try to get sleep schedule times
    const sleepSchedule = localStorage.getItem('sleepSchedule');
    if (sleepSchedule) {
      try {
        const schedule = JSON.parse(sleepSchedule);
        const today = new Date();
        const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()];
        
        let wakeTime = '08:00';
        let sleepTime = '22:00';
        
        if (schedule.mode === 'daily' && schedule.daily) {
          wakeTime = schedule.daily.wakeTime;
          sleepTime = schedule.daily.sleepTime;
        } else if (schedule.mode === 'weekly' && schedule.weekly && schedule.weekly[dayName]) {
          wakeTime = schedule.weekly[dayName].wakeTime;
          sleepTime = schedule.weekly[dayName].sleepTime;
        }
        
        return {
          ...defaultSettings,
          reminderStartTime: wakeTime,
          reminderEndTime: sleepTime
        };
      } catch (e) {
        console.error('Error parsing sleep schedule:', e);
      }
    }
    
    return defaultSettings;
  });

  const [entries, setEntries] = useState<WaterEntry[]>(() => {
    const saved = localStorage.getItem('water_entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [goalInput, setGoalInput] = useState(settings.dailyGoal.toString());
  const [reminderInput, setReminderInput] = useState(settings.reminderInterval?.toString() || "2");
  const [startTimeInput, setStartTimeInput] = useState(settings.reminderStartTime || "08:00");
  const [endTimeInput, setEndTimeInput] = useState(settings.reminderEndTime || "22:00");

  // Check if sleep schedule is available
  const hasSleepSchedule = () => {
    const sleepSchedule = localStorage.getItem('sleepSchedule');
    if (!sleepSchedule) return false;
    
    try {
      const schedule = JSON.parse(sleepSchedule);
      return schedule && (schedule.daily || schedule.weekly);
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    localStorage.setItem('water_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('water_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
    const filtered = entries.filter(e => e.date >= cutoffDate);
    
    if (filtered.length !== entries.length) {
      setEntries(filtered);
    }
  }, [entries]);

  const getTodayEntries = () => {
    const today = new Date().toISOString().split('T')[0];
    return entries.filter(e => e.date === today);
  };

  const convertUnit = (amount: number, fromUnit: "ml" | "oz", toUnit: "ml" | "oz"): number => {
    if (fromUnit === toUnit) return amount;
    if (fromUnit === "ml" && toUnit === "oz") return amount / 29.5735;
    if (fromUnit === "oz" && toUnit === "ml") return amount * 29.5735;
    return amount;
  };

  const getTodayTotal = () => {
    return getTodayEntries().reduce((sum, entry) => {
      const convertedAmount = convertUnit(entry.amount, entry.unit, settings.unit);
      return sum + convertedAmount;
    }, 0);
  };

  const addWater = (amount: number) => {
    const now = new Date();
    const entry: WaterEntry = {
      id: Date.now().toString(),
      amount,
      unit: settings.unit,
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      date: now.toISOString().split('T')[0],
    };
    setEntries(prev => [entry, ...prev]);
    
    // Mark the corresponding reminder as completed
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    
    // Find and complete the most recent water reminder
    const waterReminders = todos.filter((todo: any) => 
      todo.source === "water" && 
      !todo.completed &&
      isToday(new Date(todo.dueDate))
    ).sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    if (waterReminders.length > 0) {
      const reminderToComplete = waterReminders[0];
      const updatedTodos = todos.map((todo: any) => 
        todo.id === reminderToComplete.id ? { ...todo, completed: true } : todo
      );
      localStorage.setItem("todos", JSON.stringify(updatedTodos));
      window.dispatchEvent(new Event("todosUpdated"));
    }
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const generateWaterReminders = () => {
    if (!settings.remindersEnabled) return;

    // If addToTodo is enabled, we don't generate actual tasks - they're shown as emojis
    // If addToTodo is disabled, we don't generate anything
    // This function is kept for compatibility but doesn't do anything when addToTodo is true
    if (settings.addToTodo) return;

    const today = new Date();
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    
    // Remove existing water reminders for today
    const filteredTodos = todos.filter((todo: any) => 
      !todo.title.includes("Drink water") || 
      !isToday(new Date(todo.dueDate))
    );

    // Generate new reminders
    const startTime = (settings.reminderStartTime || "08:00").split(':').map(Number);
    const endTime = (settings.reminderEndTime || "22:00").split(':').map(Number);
    const startMinutes = startTime[0] * 60 + startTime[1];
    const endMinutes = endTime[0] * 60 + endTime[1];
    const intervalMinutes = settings.reminderInterval * 60;

    const newReminders = [];
    for (let time = startMinutes; time <= endMinutes; time += intervalMinutes) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const reminderDate = new Date(today);
      reminderDate.setHours(hours, minutes, 0, 0);
      
      newReminders.push({
        id: `water-reminder-${Date.now()}-${time}`,
        title: `Drink water (${settings.reminderInterval}h reminder)`,
        emoji: "💧",
        completed: false,
        source: "water" as const,
        dueDate: reminderDate,
        time: timeString
      });
    }

    const updatedTodos = [...filteredTodos, ...newReminders];
    localStorage.setItem("todos", JSON.stringify(updatedTodos));
    window.dispatchEvent(new Event("todosUpdated"));
  };


  const saveSettings = () => {
    const goal = parseInt(goalInput);
    const interval = parseInt(reminderInput);
    
    if (goal > 0 && interval > 0) {
      const newSettings = {
        ...settings,
        dailyGoal: goal,
        reminderInterval: interval,
        reminderStartTime: startTimeInput,
        reminderEndTime: endTimeInput
      };
      setSettings(newSettings);
      setIsSettingsOpen(false);
      
      // Regenerate reminders with new settings
      if (newSettings.remindersEnabled) {
        generateWaterReminders();
      }
    }
  };

  // Generate reminders when settings change
  useEffect(() => {
    if (settings.remindersEnabled) {
      generateWaterReminders();
    }
  }, [settings.remindersEnabled, settings.reminderInterval, settings.reminderStartTime, settings.reminderEndTime]);

  const todayTotal = getTodayTotal();
  const progressPercentage = Math.min((todayTotal / settings.dailyGoal) * 100, 100);
  const quickAddAmounts = settings.unit === 'ml' ? [250, 500, 750, 1000] : [8, 16, 24, 32];

  const isEmpty = entries.length === 0;

  return (
    <>
      <UniversalDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        title="Water Goal Settings"
        onSave={saveSettings}
        saveLabel="Save Settings"
      >
              <div>
                <Label htmlFor="water-goal">Daily Goal ({settings.unit})</Label>
                <Input
                  id="water-goal"
                  type="number"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  data-testid="input-water-goal"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Unit</Label>
                <div className="flex gap-2">
                  <Button
                    variant={settings.unit === 'ml' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, unit: 'ml' }))}
                    data-testid="button-unit-ml"
                  >
                    ml
                  </Button>
                  <Button
                    variant={settings.unit === 'oz' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, unit: 'oz' }))}
                    data-testid="button-unit-oz"
                  >
                    oz
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    <Label>Water Reminders</Label>
                  </div>
                  <Switch
                    checked={settings.remindersEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, remindersEnabled: checked }))}
                    data-testid="switch-water-reminders"
                  />
                </div>
                
                {settings.remindersEnabled && (
                  <div className="space-y-3 pl-6">
                    <div className="flex items-center justify-between">
                      <Label>Add to To Do List</Label>
                      <Switch
                        checked={settings.addToTodo}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, addToTodo: checked }))}
                        data-testid="switch-add-to-todo"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="reminder-interval">Reminder Interval (hours)</Label>
                      <Select
                        value={reminderInput}
                        onValueChange={setReminderInput}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Every 1 hour</SelectItem>
                          <SelectItem value="2">Every 2 hours</SelectItem>
                          <SelectItem value="3">Every 3 hours</SelectItem>
                          <SelectItem value="4">Every 4 hours</SelectItem>
                          <SelectItem value="6">Every 6 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="start-time">Start Time</Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={startTimeInput}
                          onChange={(e) => setStartTimeInput(e.target.value)}
                          data-testid="input-start-time"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-time">End Time</Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={endTimeInput}
                          onChange={(e) => setEndTimeInput(e.target.value)}
                          data-testid="input-end-time"
                        />
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground bg-accent/50 p-2 rounded space-y-1">
                      {settings.addToTodo ? (
                        <div>💡 Reminders will be added to your To Do list and can be completed by drinking water</div>
                      ) : (
                        <div>💡 Reminders will be generated but not added to your To Do list</div>
                      )}
                      {hasSleepSchedule() ? (
                        <div className="text-green-600">✅ Times are synced with your sleep schedule</div>
                      ) : (
                        <div className="text-amber-600">💤 Set up your sleep schedule in the Health tab to auto-sync reminder times</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
      </UniversalDialog>
      
      <UniversalContainer
        isEmpty={isEmpty}
        onAdd={() => addWater(quickAddAmounts[0])}
        onSettings={() => setIsSettingsOpen(true)}
        emptyMessage="Start tracking your water intake"
      >
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold">{todayTotal}</span>
            <span className="text-sm text-muted-foreground">/ {settings.dailyGoal} {settings.unit}</span>
          </div>
          <Progress value={progressPercentage} className="h-3" data-testid="progress-water" />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {quickAddAmounts.map(amount => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => addWater(amount)}
              className="flex flex-col h-auto py-2"
              data-testid={`button-add-water-${amount}`}
            >
              <Plus className="w-3 h-3 mb-1" />
              <span className="text-xs">{amount}{settings.unit}</span>
            </Button>
          ))}
        </div>

        {getTodayEntries().length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Today's Log</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {getTodayEntries().map(entry => {
                const displayAmount = convertUnit(entry.amount, entry.unit, settings.unit);
                return (
                  <div key={entry.id} className="flex items-center justify-between text-sm bg-muted rounded-md p-2" data-testid={`water-entry-${entry.id}`}>
                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-primary" />
                      <span className="font-medium">{Math.round(displayAmount)} {settings.unit}</span>
                      <span className="text-muted-foreground">{entry.time}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEntry(entry.id)}
                      className="h-6 w-6 p-0"
                      data-testid={`button-delete-water-${entry.id}`}
                    >
                      ×
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground bg-accent/50 p-3 rounded-md" data-testid="text-water-reminder">
          💧 Tip: Drink water regularly throughout the day. Aim for a glass every 2 hours!
        </div>
      </UniversalContainer>
    </>
  );
}
