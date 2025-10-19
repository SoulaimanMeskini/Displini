import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UniversalDialog } from "@/components/shared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Calendar, Trash2, Edit, ChevronLeft, ChevronRight, Heart, Droplets, Brain, Zap } from "lucide-react";
import { format, addDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, subDays } from "date-fns";

interface MenstrualLog {
  id: string;
  date: string;
  flowLevel: 'none' | 'light' | 'medium' | 'heavy' | 'severe';
  symptoms: string[];
  mood: string;
  notes?: string;
}

interface CycleSettings {
  averageCycleLength: number;
  averagePeriodDuration: number;
  isSetup: boolean;
}

interface CyclePeriod {
  id: string;
  startDate: string;
  endDate?: string;
  cycleLength?: number;
  periodDuration?: number;
}

const flowLevels = [
  { value: 'none', label: 'None', emoji: '⚪', color: 'bg-gray-200' },
  { value: 'light', label: 'Light', emoji: '🟡', color: 'bg-yellow-200' },
  { value: 'medium', label: 'Medium', emoji: '🟠', color: 'bg-orange-200' },
  { value: 'heavy', label: 'Heavy', emoji: '🔴', color: 'bg-red-200' },
  { value: 'severe', label: 'Severe', emoji: '🟣', color: 'bg-purple-200' },
];

const commonSymptoms = [
  'Cramps', 'Bloating', 'Fatigue', 'Headache', 'Mood swings', 
  'Breast tenderness', 'Back pain', 'Nausea', 'Acne', 'Food cravings',
  'Insomnia', 'Anxiety', 'Depression', 'Irritability', 'Hot flashes'
];

const moodOptions = [
  { value: 'excellent', label: 'Excellent', emoji: '😄' },
  { value: 'good', label: 'Good', emoji: '😊' },
  { value: 'okay', label: 'Okay', emoji: '😐' },
  { value: 'poor', label: 'Poor', emoji: '😔' },
  { value: 'terrible', label: 'Terrible', emoji: '😢' },
];

export default function MenstrualCycleTracker() {
  const [logs, setLogs] = useState<MenstrualLog[]>([]);
  const [cycles, setCycles] = useState<CyclePeriod[]>([]);
  const [settings, setSettings] = useState<CycleSettings>({
    averageCycleLength: 28,
    averagePeriodDuration: 5,
    isSetup: false
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isEditSettingsOpen, setIsEditSettingsOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<MenstrualLog | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Form states
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [logFlowLevel, setLogFlowLevel] = useState<'none' | 'light' | 'medium' | 'heavy' | 'severe'>('none');
  const [logSymptoms, setLogSymptoms] = useState<string[]>([]);
  const [logMood, setLogMood] = useState('okay');
  const [logNotes, setLogNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [logs, cycles, settings]);

  const loadData = () => {
    const savedLogs = localStorage.getItem('menstrualLogs');
    const savedCycles = localStorage.getItem('menstrualCycles');
    const savedSettings = localStorage.getItem('menstrualSettings');

    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedCycles) setCycles(JSON.parse(savedCycles));
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      // Don't auto-open dialog - let user click the setup button
    } else {
      // Initialize with default settings but don't auto-open dialog
      setSettings({
        averageCycleLength: 28,
        averagePeriodDuration: 5,
        isSetup: false
      });
    }
  };

  const saveData = () => {
    localStorage.setItem('menstrualLogs', JSON.stringify(logs));
    localStorage.setItem('menstrualCycles', JSON.stringify(cycles));
    localStorage.setItem('menstrualSettings', JSON.stringify(settings));
    
    // Dispatch event to update calendar and other components
    window.dispatchEvent(new Event('menstrualDataUpdated'));
  };

  const handleInitialSetup = () => {
    const newSettings: CycleSettings = {
      averageCycleLength: cycleLength,
      averagePeriodDuration: periodDuration,
      isSetup: true
    };
    setSettings(newSettings);
    setIsSetupOpen(false);
    
    // Generate initial prediction
    generateInitialPrediction();
  };

  const handleEditSettings = () => {
    setCycleLength(settings.averageCycleLength);
    setPeriodDuration(settings.averagePeriodDuration);
    setIsEditSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    const newSettings: CycleSettings = {
      ...settings,
      averageCycleLength: cycleLength,
      averagePeriodDuration: periodDuration
    };
    setSettings(newSettings);
    setIsEditSettingsOpen(false);
    
    // Update predictions with new settings
    updatePredictions();
  };

  const generateInitialPrediction = () => {
    const today = new Date();
    const predictedStart = addDays(today, cycleLength);
    
    const newCycle: CyclePeriod = {
      id: Date.now().toString(),
      startDate: predictedStart.toISOString().split('T')[0],
      cycleLength: cycleLength,
      periodDuration: periodDuration
    };
    
    setCycles([newCycle]);
    addPredictionToTodos(predictedStart, periodDuration);
  };

  const addPredictionToTodos = (startDate: Date, duration: number) => {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    
    // Remove existing menstrual predictions
    const filteredTodos = todos.filter((t: any) => t.source !== 'menstrual');
    
    // Add new predictions for the next period
    for (let i = 0; i < duration; i++) {
      const periodDate = addDays(startDate, i);
      const todo = {
        id: `menstrual-prediction-${periodDate.toISOString().split('T')[0]}`,
        title: i === 0 ? 'Period starts (predicted)' : 'Period day (predicted)',
        emoji: '🌸',
        completed: false,
        dueDate: periodDate.toISOString(),
        allDay: true,
        source: 'menstrual',
        isPrediction: true
      };
      filteredTodos.push(todo);
    }
    
    localStorage.setItem("todos", JSON.stringify(filteredTodos));
    window.dispatchEvent(new Event("todosUpdated"));
  };

  const handleLogPeriod = () => {
    if (logFlowLevel === 'none') return;

    const newLog: MenstrualLog = {
      id: Date.now().toString(),
      date: selectedDate.toISOString().split('T')[0],
      flowLevel: logFlowLevel,
      symptoms: logSymptoms,
      mood: logMood,
      notes: logNotes
    };

    setLogs(prev => {
      const existingIndex = prev.findIndex(log => log.date === newLog.date);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newLog;
        return updated;
      }
      return [...prev, newLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    // If this is the first day of period, create a new cycle
    if (logFlowLevel !== 'none' && !isPeriodDay(selectedDate)) {
      const newCycle: CyclePeriod = {
        id: Date.now().toString(),
        startDate: selectedDate.toISOString().split('T')[0],
        cycleLength: settings.averageCycleLength,
        periodDuration: settings.averagePeriodDuration
      };
      setCycles(prev => [newCycle, ...prev]);
    }

    // Update predictions
    updatePredictions();

    // Reset form
    setLogFlowLevel('none');
    setLogSymptoms([]);
    setLogMood('okay');
    setLogNotes('');
    setIsLogOpen(false);
  };

  const isPeriodDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return logs.some(log => log.date === dateStr && log.flowLevel !== 'none');
  };

  const updatePredictions = () => {
    if (cycles.length === 0) return;

    // Calculate average cycle length from actual data
    const actualCycles = cycles.filter(c => c.cycleLength);
    const avgCycleLength = actualCycles.length > 0 
      ? Math.round(actualCycles.reduce((sum, c) => sum + (c.cycleLength || 28), 0) / actualCycles.length)
      : settings.averageCycleLength;

    // Get the most recent cycle
    const lastCycle = cycles[0];
    const lastStartDate = new Date(lastCycle.startDate);
    
    // Calculate next predicted period
    const nextPredictedStart = addDays(lastStartDate, avgCycleLength);
    
    // Update todos with new predictions
    addPredictionToTodos(nextPredictedStart, settings.averagePeriodDuration);
  };

  const getLogForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return logs.find(log => log.date === dateStr);
  };

  const getFlowLevelForDate = (date: Date) => {
    const log = getLogForDate(date);
    return log ? log.flowLevel : 'none';
  };

  const getNextPeriodPrediction = () => {
    if (cycles.length === 0) return null;
    
    const lastCycle = cycles[0];
    const lastStartDate = new Date(lastCycle.startDate);
    const avgCycleLength = cycles.reduce((sum, c) => sum + (c.cycleLength || 28), 0) / cycles.length;
    
    return addDays(lastStartDate, Math.round(avgCycleLength));
  };

  const nextPeriod = getNextPeriodPrediction();
  const daysUntilNext = nextPeriod ? differenceInDays(nextPeriod, new Date()) : null;

  const handleEditLog = (log: MenstrualLog) => {
    setEditingLog(log);
    setSelectedDate(new Date(log.date));
    setLogFlowLevel(log.flowLevel);
    setLogSymptoms(log.symptoms);
    setLogMood(log.mood);
    setLogNotes(log.notes || '');
    setIsLogOpen(true);
  };

  const handleUpdateLog = () => {
    if (!editingLog) return;

    const updatedLog: MenstrualLog = {
      ...editingLog,
      flowLevel: logFlowLevel,
      symptoms: logSymptoms,
      mood: logMood,
      notes: logNotes
    };

    setLogs(prev => prev.map(log => log.id === editingLog.id ? updatedLog : log));
    
    // Reset form
    setEditingLog(null);
    setLogFlowLevel('none');
    setLogSymptoms([]);
    setLogMood('okay');
    setLogNotes('');
    setIsLogOpen(false);
  };

  const handleDeleteLog = (logId: string) => {
    setLogs(prev => prev.filter(log => log.id !== logId));
  };

  const toggleSymptom = (symptom: string) => {
    setLogSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const getCalendarDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Add days from previous month to fill the first week
    const firstDay = start.getDay();
    const prevMonthDays = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      prevMonthDays.push(subDays(start, i + 1));
    }
    
    return [...prevMonthDays, ...days];
  };

  const renderCalendar = () => {
    const days = getCalendarDays();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
          {weekDays.map(day => (
            <div key={day} className="p-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const flowLevel = getFlowLevelForDate(day);
            const log = getLogForDate(day);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isTodayDate = isToday(day);
            const isSelected = isSameDay(day, selectedDate);
            
            return (
              <button
                key={index}
                onClick={() => {
                  setSelectedDate(day);
                  if (log) {
                    handleEditLog(log);
                  } else {
                    setEditingLog(null);
                    setLogFlowLevel('none');
                    setLogSymptoms([]);
                    setLogMood('okay');
                    setLogNotes('');
                    setIsLogOpen(true);
                  }
                }}
                className={`
                  relative p-2 text-sm rounded-lg transition-colors
                  ${!isCurrentMonth ? 'text-muted-foreground/50' : ''}
                  ${isTodayDate ? 'ring-2 ring-primary' : ''}
                  ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                `}
              >
                <div className="flex flex-col items-center gap-1">
                  <span>{day.getDate()}</span>
                  {flowLevel !== 'none' && (
                    <div className={`w-3 h-3 rounded-full ${flowLevels.find(f => f.value === flowLevel)?.color}`} />
                  )}
                  {log && (
                    <div className="flex gap-1">
                      {log.symptoms.length > 0 && <Brain className="w-2 h-2" />}
                      {log.mood && <Heart className="w-2 h-2" />}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Show setup container if not set up yet */}
      {!settings.isSetup ? (
        <div 
          className="flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer"
          onClick={() => setIsSetupOpen(true)}
        >
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Set up Menstrual Cycle Tracking</h3>
          <p className="text-sm text-muted-foreground text-center">
            Track your cycle, get predictions, and monitor your health
          </p>
        </div>
      ) : (
        <>
      {/* Main UI when set up */}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsCalendarOpen(true)}
          >
            <Calendar className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsLogOpen(true)}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleEditSettings}
            title="Edit cycle settings"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-3">
        {nextPeriod && daysUntilNext !== null && (
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Droplets className="w-4 h-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground">Next Period</p>
            </div>
            <p className="text-lg font-semibold text-primary">
              {daysUntilNext > 0 ? `In ${daysUntilNext} days` : 'Today'}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(nextPeriod, 'MMM d, yyyy')}
            </p>
          </div>
        )}

        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-success" />
            <p className="text-xs font-medium text-muted-foreground">Cycle Length</p>
          </div>
          <p className="text-lg font-semibold text-success">
            {settings.averageCycleLength} days
          </p>
          <p className="text-xs text-muted-foreground">
            {settings.averagePeriodDuration} day period
          </p>
        </div>
      </div>

      {/* Recent Logs */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Recent Logs</h3>
        <div>
          {logs.length > 0 ? (
            <div className="space-y-2">
              {logs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${flowLevels.find(f => f.value === log.flowLevel)?.color}`} />
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(log.date), 'MMM d, yyyy')}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{flowLevels.find(f => f.value === log.flowLevel)?.label}</span>
                        {log.symptoms.length > 0 && (
                          <span>• {log.symptoms.length} symptoms</span>
                        )}
                        {log.mood && (
                          <span>• {moodOptions.find(m => m.value === log.mood)?.emoji}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditLog(log)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteLog(log.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No logs yet. Start tracking your cycle!
            </p>
          )}
        </div>
      </div>
        </>
      )}

      {/* Initial Setup Dialog */}
      <UniversalDialog
        open={isSetupOpen}
        onOpenChange={setIsSetupOpen}
        title="Welcome to Menstrual Cycle Tracker"
        description="Let's set up your cycle tracking. This will help us provide accurate predictions."
        onSave={handleInitialSetup}
        saveLabel="Start Tracking"
      >
            <div>
              <Label htmlFor="cycle-length">Average Cycle Length (days)</Label>
              <Input
                id="cycle-length"
                type="number"
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
                min="21"
                max="35"
              />
            </div>
            <div>
              <Label htmlFor="period-duration">Average Period Duration (days)</Label>
              <Input
                id="period-duration"
                type="number"
                value={periodDuration}
                onChange={(e) => setPeriodDuration(parseInt(e.target.value) || 5)}
                min="2"
                max="10"
              />
            </div>
      </UniversalDialog>

      {/* Log Entry Dialog */}
      <UniversalDialog
        open={isLogOpen}
        onOpenChange={setIsLogOpen}
        title={editingLog ? 'Edit Log' : 'Log Period Data'}
        onSave={handleSaveLog}
        saveLabel={editingLog ? 'Update' : 'Save'}
        onCancel={() => setIsLogOpen(false)}
      >
            <div>
              <Label>Date</Label>
              <p className="text-sm font-medium">{format(selectedDate, 'EEEE, MMM d, yyyy')}</p>
            </div>

            <div>
              <Label>Flow Level</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {flowLevels.map(level => (
                  <button
                    key={level.value}
                    onClick={() => setLogFlowLevel(level.value as any)}
                    className={`p-2 rounded-lg border-2 transition-colors ${
                      logFlowLevel === level.value 
                        ? 'border-primary bg-primary/10' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg">{level.emoji}</div>
                      <div className="text-xs">{level.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Symptoms</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {commonSymptoms.map(symptom => (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      logSymptoms.includes(symptom)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted border-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Mood</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {moodOptions.map(mood => (
                  <button
                    key={mood.value}
                    onClick={() => setLogMood(mood.value)}
                    className={`p-2 rounded-lg border-2 transition-colors ${
                      logMood === mood.value 
                        ? 'border-primary bg-primary/10' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg">{mood.emoji}</div>
                      <div className="text-xs">{mood.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsLogOpen(false)} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={editingLog ? handleUpdateLog : handleLogPeriod} 
                className="flex-1"
                disabled={logFlowLevel === 'none'}
              >
                {editingLog ? 'Update' : 'Log'}
              </Button>
            </div>
      </UniversalDialog>

      {/* Calendar Dialog */}
      <UniversalDialog
        open={isCalendarOpen}
        onOpenChange={setIsCalendarOpen}
        title="Cycle Calendar"
        hideDefaultFooter
      >
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(subDays(currentMonth, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="text-lg font-semibold">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(addDays(currentMonth, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            {renderCalendar()}
            
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-200" />
                <span>Light</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-200" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-200" />
                <span>Heavy</span>
              </div>
            </div>
      </UniversalDialog>

      {/* Edit Settings Dialog */}
      <UniversalDialog
        open={isEditSettingsOpen}
        onOpenChange={setIsEditSettingsOpen}
        title="Edit Cycle Settings"
        hideDefaultFooter
      >
        <div>
              <Label htmlFor="edit-cycle-length">Average Cycle Length (days)</Label>
              <Input
                id="edit-cycle-length"
                type="number"
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
                min="21"
                max="35"
              />
            </div>
            <div>
              <Label htmlFor="edit-period-duration">Average Period Duration (days)</Label>
              <Input
                id="edit-period-duration"
                type="number"
                value={periodDuration}
                onChange={(e) => setPeriodDuration(parseInt(e.target.value) || 5)}
                min="2"
                max="10"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditSettingsOpen(false)} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveSettings} className="flex-1">
                Save Changes
              </Button>
            </div>
      </UniversalDialog>
    </div>
  );
}