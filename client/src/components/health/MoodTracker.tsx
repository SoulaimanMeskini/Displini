import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import UniversalContainer from "@/components/UniversalContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

interface MoodEntry {
  id: string;
  date: string;
  mood: number; // 1-10 scale
  emoji: string;
  notes?: string;
}

const moodEmojis = [
  { emoji: "😢", value: 1, label: "Very Sad" },
  { emoji: "😔", value: 2, label: "Sad" },
  { emoji: "😕", value: 3, label: "Down" },
  { emoji: "😐", value: 4, label: "Neutral" },
  { emoji: "🙂", value: 5, label: "Okay" },
  { emoji: "😊", value: 6, label: "Good" },
  { emoji: "😄", value: 7, label: "Happy" },
  { emoji: "🤩", value: 8, label: "Great" },
  { emoji: "🥳", value: 9, label: "Amazing" },
  { emoji: "🤯", value: 10, label: "Ecstatic" }
];

export default function MoodTracker() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>(() => {
    const saved = localStorage.getItem('moodEntries');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
  }, [moodEntries]);

  const getTodayMood = () => {
    const today = new Date().toISOString().split('T')[0];
    return moodEntries.find(entry => entry.date === today);
  };

  const logMood = (mood: number, emoji: string) => {
    const today = new Date().toISOString().split('T')[0];
    const existingEntry = moodEntries.find(entry => entry.date === today);
    
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: today,
      mood,
      emoji,
      notes: notes.trim() || undefined
    };

    if (existingEntry) {
      setMoodEntries(prev => prev.map(entry => 
        entry.date === today ? newEntry : entry
      ));
    } else {
      setMoodEntries(prev => [newEntry, ...prev]);
    }
    
    setSelectedMood(null);
    setNotes('');
  };

  const getWeeklyMoods = () => {
    const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    const endOfCurrentWeek = endOfWeek(new Date(), { weekStartsOn: 1 });
    
    return moodEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfCurrentWeek && entryDate <= endOfCurrentWeek;
    });
  };

  const getAverageMood = (entries: MoodEntry[]) => {
    if (entries.length === 0) return 0;
    return entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length;
  };

  const getMoodTrend = () => {
    const last7Days = moodEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        const weekAgo = subDays(new Date(), 7);
        return entryDate >= weekAgo;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    if (last7Days.length < 2) return 'stable';
    
    const firstHalf = last7Days.slice(0, Math.floor(last7Days.length / 2));
    const secondHalf = last7Days.slice(Math.floor(last7Days.length / 2));
    
    const firstAvg = getAverageMood(firstHalf);
    const secondAvg = getAverageMood(secondHalf);
    
    if (secondAvg > firstAvg + 0.5) return 'improving';
    if (secondAvg < firstAvg - 0.5) return 'declining';
    return 'stable';
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 3) return 'text-red-500';
    if (mood <= 6) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getMoodBackground = (mood: number) => {
    if (mood <= 3) return 'bg-red-50 border-red-200';
    if (mood <= 6) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const todayMood = getTodayMood();
  const weeklyMoods = getWeeklyMoods();
  const averageMood = getAverageMood(weeklyMoods);
  const trend = getMoodTrend();

  return (
    <div>
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            {todayMood ? (
              <div className={`p-4 rounded-lg border ${getMoodBackground(todayMood.mood)}`}>
                <div className="text-center">
                  <div className="text-4xl mb-2">{todayMood.emoji}</div>
                  <p className="text-lg font-semibold">Mood: {todayMood.mood}/10</p>
                  <p className="text-sm text-muted-foreground">
                    {moodEmojis.find(m => m.value === todayMood.mood)?.label}
                  </p>
                  {todayMood.notes && (
                    <p className="text-sm mt-2 italic">"{todayMood.notes}"</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">How are you feeling today?</p>
                  <div className="grid grid-cols-5 gap-2">
                    {moodEmojis.map((mood) => (
                      <Button
                        key={mood.value}
                        variant={selectedMood === mood.value ? "default" : "outline"}
                        size="sm"
                        className="h-16 flex flex-col gap-1"
                        onClick={() => setSelectedMood(mood.value)}
                      >
                        <span className="text-2xl">{mood.emoji}</span>
                        <span className="text-xs">{mood.value}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedMood && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add notes (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                      />
                      <Button 
                        onClick={() => logMood(selectedMood, moodEmojis.find(m => m.value === selectedMood)!.emoji)}
                      >
                        Log Mood
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{averageMood.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Weekly Average</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-chart-2">{weeklyMoods.length}</p>
                <p className="text-sm text-muted-foreground">Days Tracked</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Weekly Progress</span>
                <Badge variant={trend === 'improving' ? 'default' : trend === 'declining' ? 'destructive' : 'secondary'}>
                  {trend === 'improving' ? '↗ Improving' : trend === 'declining' ? '↘ Declining' : '→ Stable'}
                </Badge>
              </div>
              <Progress value={(averageMood / 10) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">This Week's Moods</h4>
              <div className="space-y-1">
                {weeklyMoods.length > 0 ? (
                  weeklyMoods.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{entry.emoji}</span>
                        <span className="text-sm">{format(new Date(entry.date), 'EEE')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getMoodColor(entry.mood)}`}>
                          {entry.mood}/10
                        </span>
                        {entry.notes && (
                          <span className="text-xs text-muted-foreground truncate max-w-20">
                            {entry.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No mood entries this week
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
}
