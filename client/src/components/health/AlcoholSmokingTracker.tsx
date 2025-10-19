import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import UniversalContainer from "@/components/UniversalContainer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Minus, Target, Flame } from "lucide-react";

interface AlcoholSmokingEntry {
  id: string;
  date: string;
  type: 'alcohol' | 'smoking';
  amount: number;
  unit: string;
}

export default function AlcoholSmokingTracker() {
  const [entries, setEntries] = useState<AlcoholSmokingEntry[]>(() => {
    const saved = localStorage.getItem('alcoholSmokingEntries');
    return saved ? JSON.parse(saved) : [];
  });

  const [newEntry, setNewEntry] = useState({
    type: 'alcohol' as 'alcohol' | 'smoking',
    amount: 0,
    unit: 'drinks'
  });

  const [goals, setGoals] = useState({
    alcohol: { max: 2, unit: 'drinks' },
    smoking: { max: 0, unit: 'cigarettes' }
  });

  useEffect(() => {
    localStorage.setItem('alcoholSmokingEntries', JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    if (newEntry.amount <= 0) return;
    
    const entry: AlcoholSmokingEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: newEntry.type,
      amount: newEntry.amount,
      unit: newEntry.unit
    };
    
    setEntries(prev => [entry, ...prev]);
    setNewEntry({ type: 'alcohol', amount: 0, unit: 'drinks' });
  };

  const getTodayEntries = (type: 'alcohol' | 'smoking') => {
    const today = new Date().toISOString().split('T')[0];
    return entries.filter(e => e.date === today && e.type === type);
  };

  const getTodayTotal = (type: 'alcohol' | 'smoking') => {
    return getTodayEntries(type).reduce((sum, e) => sum + e.amount, 0);
  };

  const getWeeklyTotal = (type: 'alcohol' | 'smoking') => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entries
      .filter(e => e.type === type && new Date(e.date) >= weekAgo)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getStreak = (type: 'alcohol' | 'smoking') => {
    const sortedEntries = entries
      .filter(e => e.type === type)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate = entryDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getProgressPercentage = (type: 'alcohol' | 'smoking') => {
    const todayTotal = getTodayTotal(type);
    const max = goals[type].max;
    return Math.min((todayTotal / max) * 100, 100);
  };

  return (
    <div>
        <Tabs defaultValue="alcohol" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="alcohol">Alcohol</TabsTrigger>
            <TabsTrigger value="smoking">Smoking</TabsTrigger>
          </TabsList>

          <TabsContent value="alcohol" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-chart-2">{getTodayTotal('alcohol')}</p>
                <p className="text-sm text-muted-foreground">Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-chart-2">{getWeeklyTotal('alcohol')}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Daily Goal Progress</Label>
                <Badge variant="outline">{getTodayTotal('alcohol')}/{goals.alcohol.max} drinks</Badge>
              </div>
              <Progress value={getProgressPercentage('alcohol')} className="h-2" />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setNewEntry(prev => ({ ...prev, amount: Math.max(0, prev.amount - 1) }))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={newEntry.amount}
                onChange={(e) => setNewEntry(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                className="w-20 text-center"
                min="0"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setNewEntry(prev => ({ ...prev, amount: prev.amount + 1 }))}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button onClick={addEntry} disabled={newEntry.amount <= 0}>
                Log Drink
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Streak: {getStreak('alcohol')} days</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="smoking" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">{getTodayTotal('smoking')}</p>
                <p className="text-sm text-muted-foreground">Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">{getWeeklyTotal('smoking')}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Daily Goal Progress</Label>
                <Badge variant="outline">{getTodayTotal('smoking')}/{goals.smoking.max} cigarettes</Badge>
              </div>
              <Progress value={getProgressPercentage('smoking')} className="h-2" />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setNewEntry(prev => ({ ...prev, amount: Math.max(0, prev.amount - 1) }))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={newEntry.amount}
                onChange={(e) => setNewEntry(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                className="w-20 text-center"
                min="0"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setNewEntry(prev => ({ ...prev, amount: prev.amount + 1 }))}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button onClick={addEntry} disabled={newEntry.amount <= 0}>
                Log Cigarette
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-green-500" />
                <span>Goal: {goals.smoking.max === 0 ? 'Quit' : 'Reduce'}</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
}
