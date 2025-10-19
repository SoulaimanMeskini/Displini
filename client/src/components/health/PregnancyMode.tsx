import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import UniversalContainer from "@/components/UniversalContainer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Heart, Baby, CheckCircle, Circle } from "lucide-react";
import { format, addWeeks, differenceInWeeks } from "date-fns";

interface PregnancyData {
  dueDate: string;
  lastPeriod: string;
  enabled: boolean;
}

interface SymptomLog {
  id: string;
  date: string;
  symptoms: string[];
  notes: string;
}

interface DailyChecklist {
  id: string;
  date: string;
  items: { [key: string]: boolean };
}

export default function PregnancyMode() {
  const [pregnancyData, setPregnancyData] = useState<PregnancyData>(() => {
    const saved = localStorage.getItem('pregnancyData');
    return saved ? JSON.parse(saved) : { dueDate: '', lastPeriod: '', enabled: false };
  });

  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>(() => {
    const saved = localStorage.getItem('pregnancySymptomLogs');
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyChecklists, setDailyChecklists] = useState<DailyChecklist[]>(() => {
    const saved = localStorage.getItem('pregnancyDailyChecklists');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentWeek, setCurrentWeek] = useState(0);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [currentNotes, setCurrentNotes] = useState('');

  useEffect(() => {
    localStorage.setItem('pregnancyData', JSON.stringify(pregnancyData));
  }, [pregnancyData]);

  useEffect(() => {
    localStorage.setItem('pregnancySymptomLogs', JSON.stringify(symptomLogs));
  }, [symptomLogs]);

  useEffect(() => {
    localStorage.setItem('pregnancyDailyChecklists', JSON.stringify(dailyChecklists));
  }, [dailyChecklists]);

  const calculateCurrentWeek = () => {
    if (!pregnancyData.lastPeriod) return 0;
    const lastPeriodDate = new Date(pregnancyData.lastPeriod);
    return Math.min(differenceInWeeks(new Date(), lastPeriodDate), 40);
  };

  const getEstimatedDueDate = () => {
    if (!pregnancyData.lastPeriod) return null;
    const lastPeriodDate = new Date(pregnancyData.lastPeriod);
    return addWeeks(lastPeriodDate, 40);
  };

  const getTodayChecklist = () => {
    const today = new Date().toISOString().split('T')[0];
    return dailyChecklists.find(c => c.date === today) || {
      id: Date.now().toString(),
      date: today,
      items: {
        'Drink enough water': false,
        'Take prenatal vitamins': false,
        'Eat nutritious meals': false,
        'Get adequate rest': false,
        'Light exercise': false,
        'Practice relaxation': false
      }
    };
  };

  const updateChecklistItem = (item: string, checked: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    const existing = dailyChecklists.find(c => c.date === today);
    
    if (existing) {
      setDailyChecklists(prev => prev.map(c => 
        c.date === today 
          ? { ...c, items: { ...c.items, [item]: checked } }
          : c
      ));
    } else {
      const newChecklist = {
        id: Date.now().toString(),
        date: today,
        items: { [item]: checked }
      };
      setDailyChecklists(prev => [newChecklist, ...prev]);
    }
  };

  const addSymptom = () => {
    if (!currentSymptom.trim()) return;
    
    const today = new Date().toISOString().split('T')[0];
    const existing = symptomLogs.find(s => s.date === today);
    
    if (existing) {
      setSymptomLogs(prev => prev.map(s => 
        s.date === today 
          ? { ...s, symptoms: [...s.symptoms, currentSymptom], notes: currentNotes }
          : s
      ));
    } else {
      const newLog = {
        id: Date.now().toString(),
        date: today,
        symptoms: [currentSymptom],
        notes: currentNotes
      };
      setSymptomLogs(prev => [newLog, ...prev]);
    }
    
    setCurrentSymptom('');
    setCurrentNotes('');
  };

  const checklistItems = [
    'Drink enough water',
    'Take prenatal vitamins',
    'Eat nutritious meals',
    'Get adequate rest',
    'Light exercise',
    'Practice relaxation'
  ];

  const pregnancyTips = [
    "Stay hydrated - aim for 8-10 glasses of water daily",
    "Take prenatal vitamins with folic acid",
    "Eat small, frequent meals to manage nausea",
    "Get 7-9 hours of sleep per night",
    "Practice gentle exercises like walking or prenatal yoga",
    "Avoid alcohol, smoking, and excessive caffeine"
  ];

  const breathingExercises = [
    "4-7-8 Breathing: Inhale for 4, hold for 7, exhale for 8",
    "Box Breathing: Inhale 4, hold 4, exhale 4, hold 4",
    "Deep Belly Breathing: Focus on expanding your belly"
  ];

  if (!pregnancyData.enabled) {
    return (
      <div>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Enable pregnancy mode to track your journey</p>
            <div className="space-y-2">
              <div>
                <Label htmlFor="lastPeriod">First day of last period</Label>
                <Input
                  id="lastPeriod"
                  type="date"
                  value={pregnancyData.lastPeriod}
                  onChange={(e) => setPregnancyData(prev => ({ ...prev, lastPeriod: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Estimated due date (optional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={pregnancyData.dueDate}
                  onChange={(e) => setPregnancyData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <Button 
              onClick={() => setPregnancyData(prev => ({ ...prev, enabled: true }))}
              disabled={!pregnancyData.lastPeriod}
            >
              Enable Pregnancy Mode
            </Button>
          </div>
      </div>
    );
  }

  const currentWeekNum = calculateCurrentWeek();
  const dueDate = getEstimatedDueDate();
  const todayChecklist = getTodayChecklist();

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="secondary">Week {currentWeekNum}</Badge>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
            <TabsTrigger value="checklist">Daily</TabsTrigger>
            <TabsTrigger value="wellness">Wellness</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-2xl font-bold text-primary">{currentWeekNum}</p>
                <p className="text-sm text-muted-foreground">Weeks Pregnant</p>
              </div>
              <div className="text-center p-4 bg-chart-2/10 rounded-lg">
                <p className="text-2xl font-bold text-chart-2">{40 - currentWeekNum}</p>
                <p className="text-sm text-muted-foreground">Weeks to Go</p>
              </div>
            </div>

            {dueDate && (
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-lg font-semibold">Estimated Due Date</p>
                <p className="text-2xl text-primary">{format(dueDate, 'MMM d, yyyy')}</p>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-semibold">This Week's Tips</h4>
              <ul className="space-y-1 text-sm">
                {pregnancyTips.slice(0, 3).map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="symptoms" className="space-y-4">
            <div className="space-y-2">
              <Label>Symptom Log</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter symptom (e.g., nausea, fatigue)"
                  value={currentSymptom}
                  onChange={(e) => setCurrentSymptom(e.target.value)}
                />
                <Button onClick={addSymptom} disabled={!currentSymptom.trim()}>
                  Add
                </Button>
              </div>
              <Textarea
                placeholder="Additional notes..."
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Today's Symptoms</h4>
              {symptomLogs.find(s => s.date === new Date().toISOString().split('T')[0]) ? (
                <div className="space-y-1">
                  {symptomLogs.find(s => s.date === new Date().toISOString().split('T')[0])?.symptoms.map((symptom, index) => (
                    <Badge key={index} variant="outline">{symptom}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No symptoms logged today</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="checklist" className="space-y-4">
            <h4 className="font-semibold">Daily Checklist</h4>
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox
                    id={item}
                    checked={todayChecklist.items[item] || false}
                    onCheckedChange={(checked) => updateChecklistItem(item, checked as boolean)}
                  />
                  <Label htmlFor={item} className="text-sm">{item}</Label>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="wellness" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Breathing Exercises</h4>
                <div className="space-y-2">
                  {breathingExercises.map((exercise, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium">{exercise}</p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Start Exercise
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Relaxation Tips</h4>
                <ul className="space-y-1 text-sm">
                  {pregnancyTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
}
