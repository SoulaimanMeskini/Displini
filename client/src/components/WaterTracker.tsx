import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Droplet, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
}

export default function WaterTracker() {
  const [settings, setSettings] = useState<WaterSettings>(() => {
    const saved = localStorage.getItem('water_settings');
    return saved ? JSON.parse(saved) : { dailyGoal: 2000, unit: 'ml' };
  });

  const [entries, setEntries] = useState<WaterEntry[]>(() => {
    const saved = localStorage.getItem('water_entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [goalInput, setGoalInput] = useState(settings.dailyGoal.toString());

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
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const saveSettings = () => {
    const goal = parseInt(goalInput);
    if (goal > 0) {
      setSettings(prev => ({ ...prev, dailyGoal: goal }));
      setIsSettingsOpen(false);
    }
  };

  const todayTotal = getTodayTotal();
  const progressPercentage = Math.min((todayTotal / settings.dailyGoal) * 100, 100);
  const quickAddAmounts = settings.unit === 'ml' ? [250, 500, 750, 1000] : [8, 16, 24, 32];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplet className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold">Water Intake</h3>
        </div>
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" data-testid="button-water-settings">
              Goal: {settings.dailyGoal} {settings.unit}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Water Goal Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
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
              <Button onClick={saveSettings} className="w-full" data-testid="button-save-water-settings">
                Save Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
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
      </div>
    </Card>
  );
}
