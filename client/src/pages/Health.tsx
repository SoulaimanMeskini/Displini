import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import MonthlyStatsModal from "@/components/MonthlyStatsModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Calendar as CalendarIcon, Moon, Sun, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, differenceInDays, startOfWeek, addWeeks, subWeeks, isToday } from "date-fns";

interface CyclePeriod {
  id: string;
  startDate: string;
  cycleLength: number;
}

interface Medication {
  id: string;
  name: string;
  emoji: string;
  dosage: string;
  times: string[];
  frequency: string;
  lastTaken?: string;
}

interface SleepSchedule {
  id: string;
  mode: 'daily' | 'weekly';
  daily?: {
    wakeTime: string;
    sleepTime: string;
  };
  weekly?: {
    sunday: { wakeTime: string; sleepTime: string };
    monday: { wakeTime: string; sleepTime: string };
    tuesday: { wakeTime: string; sleepTime: string };
    wednesday: { wakeTime: string; sleepTime: string };
    thursday: { wakeTime: string; sleepTime: string };
    friday: { wakeTime: string; sleepTime: string };
    saturday: { wakeTime: string; sleepTime: string };
  };
  alarmEnabled: boolean;
  alarmSound: string;
}

interface SleepLog {
  id: string;
  date: string;
  quality: string;
  wakeTime?: string;
}

export default function Health() {
  const [showStats, setShowStats] = useState(false);
  const [cycles, setCycles] = useState<CyclePeriod[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [sleepSchedule, setSleepSchedule] = useState<SleepSchedule | null>(null);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [isAddCycleOpen, setIsAddCycleOpen] = useState(false);
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [isSleepScheduleOpen, setIsSleepScheduleOpen] = useState(false);
  const [isSleepQualityOpen, setIsSleepQualityOpen] = useState(false);
  const [newPeriodDate, setNewPeriodDate] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  
  const [newMedName, setNewMedName] = useState("");
  const [newMedEmoji, setNewMedEmoji] = useState("💊");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedTime, setNewMedTime] = useState("");
  const [newMedFrequency, setNewMedFrequency] = useState("daily");
  
  const [scheduleMode, setScheduleMode] = useState<'daily' | 'weekly'>('daily');
  const [dailyWakeTime, setDailyWakeTime] = useState("07:00");
  const [dailySleepTime, setDailySleepTime] = useState("23:00");
  const [weeklySchedule, setWeeklySchedule] = useState({
    sunday: { wakeTime: "07:00", sleepTime: "23:00" },
    monday: { wakeTime: "07:00", sleepTime: "23:00" },
    tuesday: { wakeTime: "07:00", sleepTime: "23:00" },
    wednesday: { wakeTime: "07:00", sleepTime: "23:00" },
    thursday: { wakeTime: "07:00", sleepTime: "23:00" },
    friday: { wakeTime: "08:00", sleepTime: "00:00" },
    saturday: { wakeTime: "08:00", sleepTime: "00:00" },
  });
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [alarmSound, setAlarmSound] = useState("default");
  const [sleepWeekStart, setSleepWeekStart] = useState(() => {
    const weekStartDay = parseInt(localStorage.getItem("weekStartDay") || "0");
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek - weekStartDay;
    const adjustedDiff = diff < 0 ? diff + 7 : diff;
    const start = new Date(today);
    start.setDate(today.getDate() - adjustedDiff);
    return start;
  });
  const [sleepTodos, setSleepTodos] = useState<any[]>([]);

  useEffect(() => {
    const savedCycles = localStorage.getItem("menstrualCycles");
    const savedMeds = localStorage.getItem("medications");
    const savedSleepSchedule = localStorage.getItem("sleepSchedule");
    const savedSleepLogs = localStorage.getItem("sleepLogs");
    
    if (savedCycles) setCycles(JSON.parse(savedCycles));
    if (savedMeds) setMedications(JSON.parse(savedMeds));
    if (savedSleepSchedule) {
      const schedule = JSON.parse(savedSleepSchedule);
      
      // Check if this is legacy format (has wakeTime/sleepTime at root level)
      if (!schedule.mode && schedule.wakeTime && schedule.sleepTime) {
        // Migrate legacy format to new daily format
        const migratedSchedule: SleepSchedule = {
          id: schedule.id || Date.now().toString(),
          mode: 'daily',
          daily: {
            wakeTime: schedule.wakeTime,
            sleepTime: schedule.sleepTime,
          },
          alarmEnabled: schedule.alarmEnabled || false,
          alarmSound: schedule.alarmSound || 'default',
        };
        setSleepSchedule(migratedSchedule);
        setScheduleMode('daily');
        setDailyWakeTime(schedule.wakeTime);
        setDailySleepTime(schedule.sleepTime);
        setAlarmEnabled(schedule.alarmEnabled || false);
        setAlarmSound(schedule.alarmSound || 'default');
        // Save migrated format immediately
        localStorage.setItem("sleepSchedule", JSON.stringify(migratedSchedule));
      } else {
        // New format
        setSleepSchedule(schedule);
        setScheduleMode(schedule.mode || 'daily');
        if (schedule.mode === 'daily' && schedule.daily) {
          setDailyWakeTime(schedule.daily.wakeTime);
          setDailySleepTime(schedule.daily.sleepTime);
        } else if (schedule.mode === 'weekly' && schedule.weekly) {
          setWeeklySchedule(schedule.weekly);
        }
        setAlarmEnabled(schedule.alarmEnabled || false);
        setAlarmSound(schedule.alarmSound || 'default');
      }
    }
    if (savedSleepLogs) setSleepLogs(JSON.parse(savedSleepLogs));

    const handleMedicationCompleted = (event: any) => {
      const savedMeds = localStorage.getItem("medications");
      if (savedMeds) {
        setMedications(JSON.parse(savedMeds));
      }
    };

    window.addEventListener('medication-completed', handleMedicationCompleted);
    return () => {
      window.removeEventListener('medication-completed', handleMedicationCompleted);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("menstrualCycles", JSON.stringify(cycles));
  }, [cycles]);

  useEffect(() => {
    localStorage.setItem("medications", JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    if (sleepSchedule) {
      localStorage.setItem("sleepSchedule", JSON.stringify(sleepSchedule));
    }
  }, [sleepSchedule]);

  useEffect(() => {
    localStorage.setItem("sleepLogs", JSON.stringify(sleepLogs));
  }, [sleepLogs]);

  useEffect(() => {
    const updateSleepTodos = () => {
      const todos = JSON.parse(localStorage.getItem("todos") || "[]");
      const today = new Date().toISOString().split('T')[0];
      const todaysSleepTodos = todos.filter((t: any) => 
        t.source === 'sleep' && 
        (!t.dueDate || new Date(t.dueDate).toISOString().split('T')[0] === today)
      );
      setSleepTodos(todaysSleepTodos);
    };

    updateSleepTodos();
    
    window.addEventListener('storage', updateSleepTodos);
    window.addEventListener('todosUpdated', updateSleepTodos);
    
    return () => {
      window.removeEventListener('storage', updateSleepTodos);
      window.removeEventListener('todosUpdated', updateSleepTodos);
    };
  }, []);

  const handleAddPeriod = () => {
    if (newPeriodDate) {
      const newCycle: CyclePeriod = {
        id: Date.now().toString(),
        startDate: newPeriodDate,
        cycleLength: cycleLength,
      };
      setCycles([...cycles, newCycle].sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      ));
      setNewPeriodDate("");
      setIsAddCycleOpen(false);
    }
  };

  const handleAddMedication = () => {
    if (newMedName && newMedTime) {
      const newMed: Medication = {
        id: Date.now().toString(),
        name: newMedName,
        emoji: newMedEmoji,
        dosage: newMedDosage,
        times: [newMedTime],
        frequency: newMedFrequency,
      };
      setMedications([...medications, newMed]);
      setNewMedName("");
      setNewMedEmoji("💊");
      setNewMedDosage("");
      setNewMedTime("");
      setIsAddMedOpen(false);
      
      addMedicationToTodo(newMed);
    }
  };

  const addMedicationToTodo = (med: Medication) => {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    const newTodo = {
      id: `med-${med.id}-${Date.now()}`,
      title: `${med.emoji} Take ${med.name}`,
      completed: false,
      dueDate: new Date().toISOString(),
      time: med.times[0],
      source: 'medication',
      medicationId: med.id,
    };
    todos.push(newTodo);
    localStorage.setItem("todos", JSON.stringify(todos));
  };

  const handleSaveSleepSchedule = () => {
    const schedule: SleepSchedule = {
      id: sleepSchedule?.id || Date.now().toString(),
      mode: scheduleMode,
      daily: scheduleMode === 'daily' ? {
        wakeTime: dailyWakeTime,
        sleepTime: dailySleepTime,
      } : undefined,
      weekly: scheduleMode === 'weekly' ? weeklySchedule : undefined,
      alarmEnabled,
      alarmSound,
    };
    setSleepSchedule(schedule);
    addSleepToTodos(schedule);
    setIsSleepScheduleOpen(false);
  };

  const addSleepToTodos = (schedule: SleepSchedule) => {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    const filteredTodos = todos.filter((t: any) => t.source !== 'sleep');
    
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    const dayName = dayNames[today.getDay()];
    
    let wakeTime: string;
    let sleepTime: string;
    
    if (schedule.mode === 'daily' && schedule.daily) {
      wakeTime = schedule.daily.wakeTime;
      sleepTime = schedule.daily.sleepTime;
    } else if (schedule.mode === 'weekly' && schedule.weekly && schedule.weekly[dayName]) {
      wakeTime = schedule.weekly[dayName].wakeTime;
      sleepTime = schedule.weekly[dayName].sleepTime;
    } else {
      return; // Invalid schedule
    }
    
    const wakeTodo = {
      id: `sleep-wake-${schedule.id}`,
      title: `${schedule.alarmEnabled ? '⏰' : '🌅'} Wake up`,
      completed: false,
      dueDate: new Date().toISOString(),
      time: wakeTime,
      source: 'sleep',
      sleepAction: 'wake',
    };
    
    const sleepTodo = {
      id: `sleep-bed-${schedule.id}`,
      title: '🌙 Go to bed',
      completed: false,
      dueDate: new Date().toISOString(),
      time: sleepTime,
      source: 'sleep',
      sleepAction: 'sleep',
    };
    
    filteredTodos.push(wakeTodo, sleepTodo);
    localStorage.setItem("todos", JSON.stringify(filteredTodos));
  };

  const handleLogSleepQuality = (quality: string) => {
    const newLog: SleepLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      quality,
      wakeTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };
    setSleepLogs([newLog, ...sleepLogs].slice(0, 30));
    setIsSleepQualityOpen(false);
  };

  const deleteCycle = (id: string) => {
    setCycles(cycles.filter(c => c.id !== id));
  };

  const deleteMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  const getNextPeriodDate = () => {
    if (cycles.length === 0) return null;
    const lastCycle = cycles[0];
    const avgLength = cycles.reduce((sum, c) => sum + c.cycleLength, 0) / cycles.length;
    return addDays(new Date(lastCycle.startDate), Math.round(avgLength));
  };

  const nextPeriod = getNextPeriodDate();
  const daysUntilNext = nextPeriod ? differenceInDays(nextPeriod, new Date()) : null;

  const getCurrentDaySchedule = () => {
    if (!sleepSchedule) return null;
    const today = new Date();
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()] as keyof typeof sleepSchedule.weekly;
    
    if (sleepSchedule.mode === 'daily' && sleepSchedule.daily) {
      return sleepSchedule.daily;
    } else if (sleepSchedule.mode === 'weekly' && sleepSchedule.weekly) {
      return sleepSchedule.weekly[dayName];
    }
    return null;
  };

  const currentDaySchedule = getCurrentDaySchedule();

  const emojiOptions = ["💊", "💉", "🩺", "🧪", "⚕️", "💝", "🌡️"];
  const alarmSounds = [
    { id: "default", name: "Default" },
    { id: "gentle", name: "Gentle Chimes" },
    { id: "nature", name: "Nature Sounds" },
    { id: "upbeat", name: "Upbeat" },
    { id: "classic", name: "Classic Bell" },
  ];
  const sleepQualityEmojis = ["😴", "😊", "🤩"];

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Health" onStatsClick={() => setShowStats(true)} />

      <main className="p-4 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Sleep Schedule</CardTitle>
            <div className="flex gap-2">
              {sleepSchedule && (
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={() => setIsSleepQualityOpen(true)}
                  data-testid="button-log-sleep-quality"
                >
                  <Sun className="w-4 h-4" />
                </Button>
              )}
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setIsSleepScheduleOpen(true)}
                data-testid="button-sleep-schedule"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {sleepSchedule ? (
              <Tabs defaultValue="schedule" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="schedule" data-testid="tab-sleep-schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="daily" data-testid="tab-sleep-daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly" data-testid="tab-sleep-weekly">Weekly</TabsTrigger>
                </TabsList>
                
                <TabsContent value="schedule" className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Sun className="w-4 h-4 text-warning" />
                        <p className="text-xs font-medium text-muted-foreground">Wake Time</p>
                      </div>
                      <p className="text-lg font-semibold font-mono">{currentDaySchedule?.wakeTime || '--:--'}</p>
                      {sleepSchedule.alarmEnabled && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <Bell className="w-3 h-3 inline mr-1" />
                          {alarmSounds.find(s => s.id === sleepSchedule.alarmSound)?.name}
                        </p>
                      )}
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Moon className="w-4 h-4 text-primary" />
                        <p className="text-xs font-medium text-muted-foreground">Bedtime</p>
                      </div>
                      <p className="text-lg font-semibold font-mono">{currentDaySchedule?.sleepTime || '--:--'}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="daily" className="space-y-3">
                  {(() => {
                    const today = new Date().toISOString().split('T')[0];
                    const todayLog = sleepLogs.find(log => log.date === today);
                    const wakeTodo = sleepTodos.find((t: any) => t.sleepAction === 'wake');
                    const sleepTodo = sleepTodos.find((t: any) => t.sleepAction === 'sleep');
                    
                    return (
                      <>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Today's Schedule</p>
                          <div className="space-y-2">
                            <div className={`p-3 rounded-lg border-2 ${wakeTodo?.completed ? 'bg-success/10 border-success' : 'bg-muted/50 border-border'}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Sun className="w-4 h-4 text-warning" />
                                  <span className="text-sm font-medium">Wake up</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-mono font-semibold">{currentDaySchedule?.wakeTime || '--:--'}</span>
                                  {wakeTodo?.completed && <span className="text-success">✓</span>}
                                </div>
                              </div>
                            </div>
                            <div className={`p-3 rounded-lg border-2 ${sleepTodo?.completed ? 'bg-success/10 border-success' : 'bg-muted/50 border-border'}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Moon className="w-4 h-4 text-primary" />
                                  <span className="text-sm font-medium">Go to bed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-mono font-semibold">{currentDaySchedule?.sleepTime || '--:--'}</span>
                                  {sleepTodo?.completed && <span className="text-success">✓</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {todayLog && (
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Sleep Quality</p>
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{todayLog.quality}</span>
                              {todayLog.wakeTime && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Woke up at</p>
                                  <p className="text-sm font-mono font-semibold">{todayLog.wakeTime}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </TabsContent>
                
                <TabsContent value="weekly" className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setSleepWeekStart(subWeeks(sleepWeekStart, 1))}
                      data-testid="button-prev-sleep-week"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h3 className="text-sm font-medium">Week View</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setSleepWeekStart(addWeeks(sleepWeekStart, 1))}
                      data-testid="button-next-sleep-week"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const date = addDays(sleepWeekStart, i);
                      const dateStr = date.toISOString().split('T')[0];
                      const log = sleepLogs.find(l => l.date === dateStr);
                      const isTodayDate = isToday(date);
                      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      
                      return (
                        <div 
                          key={i} 
                          className={`flex flex-col items-center p-2 rounded-lg ${isTodayDate ? 'bg-accent' : 'bg-muted/50'}`}
                          data-testid={`sleep-day-${i}`}
                        >
                          <span className="text-xs font-medium mb-1">{dayNames[date.getDay()]}</span>
                          <span className="text-sm font-bold mb-2">{date.getDate()}</span>
                          {log ? (
                            <div className="text-2xl">{log.quality}</div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/20"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {sleepLogs.length > 0 && (
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xl">😴</span>
                        <span>Poor</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xl">😊</span>
                        <span>Good</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xl">🤩</span>
                        <span>Excellent</span>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <p className="text-sm text-muted-foreground">
                Set up your sleep schedule for better rest
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Menstrual Cycle</CardTitle>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => setIsAddCycleOpen(true)}
              data-testid="button-add-cycle"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {cycles.length > 0 ? (
              <>
                {nextPeriod && daysUntilNext !== null && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium">Next period predicted</p>
                    <p className="text-lg font-semibold text-primary">
                      {daysUntilNext > 0 ? `In ${daysUntilNext} days` : 'Today'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(nextPeriod, 'MMMM d, yyyy')}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Recent periods</p>
                  {cycles.slice(0, 3).map((cycle) => (
                    <div 
                      key={cycle.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {format(new Date(cycle.startDate), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cycle.cycleLength} day cycle
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteCycle(cycle.id)}
                        data-testid={`button-delete-cycle-${cycle.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Track your cycle to get predictions
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Medications & Pills</CardTitle>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => setIsAddMedOpen(true)}
              data-testid="button-add-medication"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {medications.length > 0 ? (
              <div className="space-y-2">
                {medications.map((med) => (
                  <div 
                    key={med.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="text-3xl">{med.emoji}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{med.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {med.dosage} • {med.times.join(", ")} • {med.frequency}
                      </p>
                      {med.lastTaken && (
                        <p className="text-xs text-success mt-1">
                          ✓ Last taken: {format(new Date(med.lastTaken), 'MMM d, h:mm a')}
                        </p>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMedication(med.id)}
                      data-testid={`button-delete-medication-${med.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add medications to get reminders
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isAddCycleOpen} onOpenChange={setIsAddCycleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Period Start Date</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="period-date">Period Start Date</Label>
              <Input
                id="period-date"
                type="date"
                value={newPeriodDate}
                onChange={(e) => setNewPeriodDate(e.target.value)}
                data-testid="input-period-date"
              />
            </div>
            <div>
              <Label htmlFor="cycle-length">Typical Cycle Length (days)</Label>
              <Input
                id="cycle-length"
                type="number"
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
                data-testid="input-cycle-length"
              />
            </div>
            <Button onClick={handleAddPeriod} className="w-full" data-testid="button-submit-cycle">
              Add Period
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddMedOpen} onOpenChange={setIsAddMedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="med-emoji">Emoji</Label>
              <div className="flex gap-2 mt-2">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    className={`text-2xl p-2 rounded-lg ${newMedEmoji === emoji ? 'bg-primary/20' : 'hover-elevate'}`}
                    onClick={() => setNewMedEmoji(emoji)}
                    data-testid={`button-emoji-${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="med-name">Medication Name</Label>
              <Input
                id="med-name"
                placeholder="Vitamin D"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                data-testid="input-medication-name"
              />
            </div>
            <div>
              <Label htmlFor="med-dosage">Dosage</Label>
              <Input
                id="med-dosage"
                placeholder="1000 IU"
                value={newMedDosage}
                onChange={(e) => setNewMedDosage(e.target.value)}
                data-testid="input-medication-dosage"
              />
            </div>
            <div>
              <Label htmlFor="med-time">Time</Label>
              <Input
                id="med-time"
                type="time"
                value={newMedTime}
                onChange={(e) => setNewMedTime(e.target.value)}
                data-testid="input-medication-time"
              />
            </div>
            <Button onClick={handleAddMedication} className="w-full" data-testid="button-submit-medication">
              Add Medication
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSleepScheduleOpen} onOpenChange={setIsSleepScheduleOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{sleepSchedule ? 'Update' : 'Set'} Sleep Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Schedule Type</Label>
              <Tabs value={scheduleMode} onValueChange={(v) => setScheduleMode(v as 'daily' | 'weekly')} className="mt-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="daily" data-testid="tab-daily-schedule">Same Every Day</TabsTrigger>
                  <TabsTrigger value="weekly" data-testid="tab-weekly-schedule">Different Per Day</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {scheduleMode === 'daily' ? (
              <>
                <div>
                  <Label htmlFor="daily-wake-time">Wake Time</Label>
                  <Input
                    id="daily-wake-time"
                    type="time"
                    value={dailyWakeTime}
                    onChange={(e) => setDailyWakeTime(e.target.value)}
                    data-testid="input-daily-wake-time"
                  />
                </div>
                <div>
                  <Label htmlFor="daily-sleep-time">Bedtime</Label>
                  <Input
                    id="daily-sleep-time"
                    type="time"
                    value={dailySleepTime}
                    onChange={(e) => setDailySleepTime(e.target.value)}
                    data-testid="input-daily-sleep-time"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const).map((day) => (
                  <div key={day} className="p-3 border rounded-md space-y-2">
                    <p className="font-medium text-sm capitalize">{day}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor={`${day}-wake`} className="text-xs">Wake</Label>
                        <Input
                          id={`${day}-wake`}
                          type="time"
                          value={weeklySchedule[day].wakeTime}
                          onChange={(e) => setWeeklySchedule({
                            ...weeklySchedule,
                            [day]: { ...weeklySchedule[day], wakeTime: e.target.value }
                          })}
                          data-testid={`input-${day}-wake`}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${day}-sleep`} className="text-xs">Sleep</Label>
                        <Input
                          id={`${day}-sleep`}
                          type="time"
                          value={weeklySchedule[day].sleepTime}
                          onChange={(e) => setWeeklySchedule({
                            ...weeklySchedule,
                            [day]: { ...weeklySchedule[day], sleepTime: e.target.value }
                          })}
                          data-testid={`input-${day}-sleep`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <Label htmlFor="alarm-enabled">Enable Alarm</Label>
              <Switch
                id="alarm-enabled"
                checked={alarmEnabled}
                onCheckedChange={setAlarmEnabled}
                data-testid="switch-alarm-enabled"
              />
            </div>
            {alarmEnabled && (
              <div>
                <Label htmlFor="alarm-sound">Alarm Sound</Label>
                <Select value={alarmSound} onValueChange={setAlarmSound}>
                  <SelectTrigger id="alarm-sound" data-testid="select-alarm-sound">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {alarmSounds.map((sound) => (
                      <SelectItem key={sound.id} value={sound.id}>
                        {sound.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleSaveSleepSchedule} className="w-full" data-testid="button-save-sleep-schedule">
              Save Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSleepQualityOpen} onOpenChange={setIsSleepQualityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How was your sleep?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground text-center">Rate your sleep quality</p>
            <div className="flex justify-center gap-4">
              {sleepQualityEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleLogSleepQuality(emoji)}
                  className="w-20 h-20 rounded-full bg-muted hover-elevate flex items-center justify-center text-4xl transition-transform active:scale-95"
                  data-testid={`button-sleep-quality-${index}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-2 text-xs text-muted-foreground">
              <span>Poor</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MonthlyStatsModal open={showStats} onOpenChange={setShowStats} />
    </div>
  );
}
