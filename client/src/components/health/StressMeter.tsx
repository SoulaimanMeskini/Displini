import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import UniversalContainer from "@/components/UniversalContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Heart, Activity, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

interface StressEntry {
  id: string;
  date: string;
  level: number; // 1-10 scale
  source?: string;
  notes?: string;
  heartRate?: number;
  timestamp: string;
}

const stressLevels = [
  { level: 1, label: "Very Low", color: "text-green-500", bgColor: "bg-green-50", borderColor: "border-green-200" },
  { level: 2, label: "Low", color: "text-green-500", bgColor: "bg-green-50", borderColor: "border-green-200" },
  { level: 3, label: "Mild", color: "text-yellow-500", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
  { level: 4, label: "Moderate", color: "text-yellow-500", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
  { level: 5, label: "Medium", color: "text-orange-500", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
  { level: 6, label: "Elevated", color: "text-orange-500", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
  { level: 7, label: "High", color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-200" },
  { level: 8, label: "Very High", color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-200" },
  { level: 9, label: "Extreme", color: "text-red-600", bgColor: "bg-red-100", borderColor: "border-red-300" },
  { level: 10, label: "Critical", color: "text-red-700", bgColor: "bg-red-200", borderColor: "border-red-400" }
];

const stressSources = [
  "Work", "Relationships", "Health", "Finances", "Family", "School", "Travel", "Other"
];

const stressReliefTips = [
  "Take 5 deep breaths",
  "Go for a short walk",
  "Listen to calming music",
  "Practice mindfulness",
  "Talk to someone you trust",
  "Do a quick stretching routine",
  "Write down your thoughts",
  "Take a break from screens"
];

export default function StressMeter() {
  const [stressEntries, setStressEntries] = useState<StressEntry[]>(() => {
    const saved = localStorage.getItem('stressEntries');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentStress, setCurrentStress] = useState(5);
  const [selectedSource, setSelectedSource] = useState('');
  const [notes, setNotes] = useState('');
  const [heartRate, setHeartRate] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('stressEntries', JSON.stringify(stressEntries));
  }, [stressEntries]);

  const getTodayStress = () => {
    const today = new Date().toISOString().split('T')[0];
    return stressEntries.filter(entry => entry.date === today);
  };

  const getAverageStress = (entries: StressEntry[]) => {
    if (entries.length === 0) return 0;
    return entries.reduce((sum, entry) => sum + entry.level, 0) / entries.length;
  };

  const getWeeklyStress = () => {
    const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    const endOfCurrentWeek = endOfWeek(new Date(), { weekStartsOn: 1 });
    
    return stressEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfCurrentWeek && entryDate <= endOfCurrentWeek;
    });
  };

  const getStressTrend = () => {
    const last7Days = stressEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        const weekAgo = subDays(new Date(), 7);
        return entryDate >= weekAgo;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    if (last7Days.length < 2) return 'stable';
    
    const firstHalf = last7Days.slice(0, Math.floor(last7Days.length / 2));
    const secondHalf = last7Days.slice(Math.floor(last7Days.length / 2));
    
    const firstAvg = getAverageStress(firstHalf);
    const secondAvg = getAverageStress(secondHalf);
    
    if (secondAvg > firstAvg + 0.5) return 'increasing';
    if (secondAvg < firstAvg - 0.5) return 'decreasing';
    return 'stable';
  };

  const logStress = () => {
    const newEntry: StressEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      level: currentStress,
      source: selectedSource || undefined,
      notes: notes.trim() || undefined,
      heartRate: heartRate || undefined,
      timestamp: new Date().toISOString()
    };

    setStressEntries(prev => [newEntry, ...prev]);
    setNotes('');
    setHeartRate(null);
  };

  const getStressColor = (level: number) => {
    return stressLevels.find(s => s.level === level)?.color || 'text-gray-500';
  };

  const getStressBackground = (level: number) => {
    return stressLevels.find(s => s.level === level)?.bgColor || 'bg-gray-50';
  };

  const getStressBorder = (level: number) => {
    return stressLevels.find(s => s.level === level)?.borderColor || 'border-gray-200';
  };

  const todayEntries = getTodayStress();
  const weeklyEntries = getWeeklyStress();
  const todayAverage = getAverageStress(todayEntries);
  const weeklyAverage = getAverageStress(weeklyEntries);
  const trend = getStressTrend();

  const currentStressLevel = stressLevels.find(s => s.level === currentStress);

  return (
    <div>
        <Tabs defaultValue="log" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="log">Log Stress</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="log" className="space-y-4">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">How stressed are you right now?</h3>
                <div className="mb-4">
                  <Slider
                    value={[currentStress]}
                    onValueChange={(value) => setCurrentStress(value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>1 - Very Low</span>
                    <span>10 - Critical</span>
                  </div>
                </div>
                <div className={`p-4 rounded-lg border ${getStressBackground(currentStress)} ${getStressBorder(currentStress)}`}>
                  <p className={`text-2xl font-bold ${getStressColor(currentStress)}`}>
                    {currentStress}/10
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentStressLevel?.label}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Stress Source (Optional)</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {stressSources.map((source) => (
                      <Button
                        key={source}
                        variant={selectedSource === source ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSource(selectedSource === source ? '' : source)}
                        className="text-xs"
                      >
                        {source}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Heart Rate (Optional)</label>
                  <input
                    type="number"
                    placeholder="BPM"
                    value={heartRate || ''}
                    onChange={(e) => setHeartRate(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full p-2 border rounded-md text-sm mt-1"
                    min="40"
                    max="200"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Notes (Optional)</label>
                  <textarea
                    placeholder="What's causing your stress?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm mt-1 resize-none"
                    rows={3}
                  />
                </div>

                <Button onClick={logStress} className="w-full">
                  Log Stress Level
                </Button>
              </div>

              {currentStress >= 7 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800">High Stress Detected</h4>
                      <p className="text-sm text-red-700 mb-2">Consider these stress relief techniques:</p>
                      <ul className="text-sm text-red-700 space-y-1">
                        {stressReliefTips.slice(0, 3).map((tip, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="today" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {todayAverage > 0 ? todayAverage.toFixed(1) : '--'}
                </p>
                <p className="text-sm text-muted-foreground">Today's Average</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-chart-2">{todayEntries.length}</p>
                <p className="text-sm text-muted-foreground">Entries Today</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Today's Entries</h4>
              {todayEntries.length > 0 ? (
                <div className="space-y-2">
                  {todayEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStressBackground(entry.level).replace('bg-', 'bg-').replace('-50', '-500')}`} />
                        <div>
                          <p className="text-sm font-medium">
                            {entry.level}/10 - {stressLevels.find(s => s.level === entry.level)?.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(entry.timestamp), 'h:mm a')}
                            {entry.source && ` • ${entry.source}`}
                          </p>
                        </div>
                      </div>
                      {entry.heartRate && (
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="text-sm">{entry.heartRate} BPM</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No stress entries today</p>
                  <p className="text-sm text-muted-foreground">Log your stress levels to track patterns</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {weeklyAverage > 0 ? weeklyAverage.toFixed(1) : '--'}
                </p>
                <p className="text-sm text-muted-foreground">Weekly Average</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-chart-2">{weeklyEntries.length}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Weekly Trend</span>
                <Badge variant={trend === 'decreasing' ? 'default' : trend === 'increasing' ? 'destructive' : 'secondary'}>
                  {trend === 'decreasing' ? (
                    <><TrendingDown className="w-3 h-3 mr-1" /> Decreasing</>
                  ) : trend === 'increasing' ? (
                    <><TrendingUp className="w-3 h-3 mr-1" /> Increasing</>
                  ) : (
                    'Stable'
                  )}
                </Badge>
              </div>
              <Progress value={(weeklyAverage / 10) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Recent Entries</h4>
              {stressEntries.length > 0 ? (
                <div className="space-y-1">
                  {stressEntries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStressBackground(entry.level).replace('bg-', 'bg-').replace('-50', '-500')}`} />
                        <span className="text-sm">{format(new Date(entry.date), 'MMM d')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getStressColor(entry.level)}`}>
                          {entry.level}/10
                        </span>
                        {entry.source && (
                          <Badge variant="outline" className="text-xs">{entry.source}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No stress data yet</p>
                  <p className="text-sm text-muted-foreground">Start logging to see your stress patterns</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
}
