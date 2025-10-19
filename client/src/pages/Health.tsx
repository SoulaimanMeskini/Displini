import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import MonthlyStatsModal from "@/components/MonthlyStatsModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UniversalDialog } from "@/components/shared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, Calendar as CalendarIcon, Moon, Sun, Bell, ChevronLeft, ChevronRight, Sunset, Heart } from "lucide-react";
import ManageColumns from "@/components/ManageColumns";
import MinimizableCard from "@/components/MinimizableCard";
import UniversalContainer from "@/components/UniversalContainer";
import AlcoholSmokingTracker from "@/components/health/AlcoholSmokingTracker";
import PregnancyMode from "@/components/health/PregnancyMode";
import MoodTracker from "@/components/health/MoodTracker";
import BreathingExercises from "@/components/health/BreathingExercises";
import StressMeter from "@/components/health/StressMeter";
import BloodGlucoseTracker from "@/components/health/BloodGlucoseTracker";
import MenstrualCycleTracker from "@/components/health/MenstrualCycleTracker";
import WinddownStartupDialog from "@/components/health/WinddownStartupDialog";
import WeightGoalTracker from "@/components/food/WeightGoalTracker";
import { EmojiPicker } from "@/components/EmojiPicker";
import { DateCarousel } from "@/components/DateCarousel";
import { format, addDays, differenceInDays, startOfWeek, addWeeks, subWeeks, isToday } from "date-fns";


interface Medication {
  id: string;
  name: string;
  emoji: string;
  dosage: string;
  times: string[];
  frequency: string;
  days: Array<'sunday'|'monday'|'tuesday'|'wednesday'|'thursday'|'friday'|'saturday'>;
  lastTaken?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical'; // Must-take importance level
  missedDoses?: number; // Count of missed doses
  lastChecked?: string; // Last date checked for missed doses
}

interface SleepSchedule {
  id: string;
  mode: 'daily' | 'weekly';
  daily?: {
    wakeTime: string;
    sleepTime: string;
    startupTime?: string; // Time to start morning routine
    startupEndTime?: string; // Time to end morning routine (usually same as wakeTime)
    winddownTime?: string; // Time to start bedtime routine
    winddownEndTime?: string; // Time to end bedtime routine (usually same as sleepTime)
  };
  weekly?: {
    sunday: { wakeTime: string; sleepTime: string; startupTime?: string; startupEndTime?: string; winddownTime?: string; winddownEndTime?: string };
    monday: { wakeTime: string; sleepTime: string; startupTime?: string; startupEndTime?: string; winddownTime?: string; winddownEndTime?: string };
    tuesday: { wakeTime: string; sleepTime: string; startupTime?: string; startupEndTime?: string; winddownTime?: string; winddownEndTime?: string };
    wednesday: { wakeTime: string; sleepTime: string; startupTime?: string; startupEndTime?: string; winddownTime?: string; winddownEndTime?: string };
    thursday: { wakeTime: string; sleepTime: string; startupTime?: string; startupEndTime?: string; winddownTime?: string; winddownEndTime?: string };
    friday: { wakeTime: string; sleepTime: string; startupTime?: string; startupEndTime?: string; winddownTime?: string; winddownEndTime?: string };
    saturday: { wakeTime: string; sleepTime: string; startupTime?: string; startupEndTime?: string; winddownTime?: string; winddownEndTime?: string };
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [medications, setMedications] = useState<Medication[]>([]);
  
  // Get current weight from user profile
  const getCurrentWeight = () => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      try {
        const userData = JSON.parse(profile);
        return userData.weight || 0;
      } catch (e) {
        return 0;
      }
    }
    return 0;
  };
  const [sleepSchedule, setSleepSchedule] = useState<SleepSchedule | null>(() => {
    const saved = localStorage.getItem('sleepSchedule');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default sleep schedule for testing
    const defaultSchedule = {
      bedtime: "23:00",
      wakeTime: "07:00",
      days: {
        monday: { wakeTime: "07:00", sleepTime: "23:00" },
        tuesday: { wakeTime: "07:00", sleepTime: "23:00" },
        wednesday: { wakeTime: "07:00", sleepTime: "23:00" },
        thursday: { wakeTime: "07:00", sleepTime: "23:00" },
        friday: { wakeTime: "07:00", sleepTime: "23:00" },
        saturday: { wakeTime: "08:00", sleepTime: "24:00" },
        sunday: { wakeTime: "08:00", sleepTime: "23:00" }
      },
      alarmEnabled: true,
      alarmSound: "gentle"
    };
    
    // Save to localStorage for timeline to use
    localStorage.setItem('sleepSchedule', JSON.stringify(defaultSchedule));
    return defaultSchedule;
  });
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [isSleepScheduleOpen, setIsSleepScheduleOpen] = useState(false);
  const [isSleepQualityOpen, setIsSleepQualityOpen] = useState(false);
  const [isWinddownStartupOpen, setIsWinddownStartupOpen] = useState(false);
  
  const [newMedName, setNewMedName] = useState("");
  const [newMedEmoji, setNewMedEmoji] = useState("💊");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedTime, setNewMedTime] = useState("");
  const [newMedFrequency, setNewMedFrequency] = useState("daily");
  const [newMedDays, setNewMedDays] = useState<Array<'sunday'|'monday'|'tuesday'|'wednesday'|'thursday'|'friday'|'saturday'>>(['monday','tuesday','wednesday','thursday','friday','saturday','sunday']);
  const [newMedPriority, setNewMedPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  // Section enable/order controls
  type SectionKey = 'sleep' | 'cycle' | 'weight' | 'meds' | 'alcohol' | 'pregnancy' | 'mood' | 'breathing' | 'stress' | 'glucose';
  const defaultOrder: SectionKey[] = ['sleep','cycle','weight','meds','glucose','mood','stress','breathing','alcohol','pregnancy'];
  const [enabledSections, setEnabledSections] = useState<Record<SectionKey, boolean>>(() => {
    const saved = localStorage.getItem('healthEnabledSections');
    return saved ? JSON.parse(saved) : { 
      sleep: true, 
      cycle: true, 
      weight: true,
      meds: true, 
      glucose: false,
      alcohol: false, 
      pregnancy: false, 
      mood: false, 
      breathing: false, 
      stress: false 
    };
  });

  const [minimizedSections, setMinimizedSections] = useState<Record<SectionKey, boolean>>(() => {
    const saved = localStorage.getItem('healthMinimizedSections');
    return saved ? JSON.parse(saved) : {};
  });
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(() => {
    const saved = localStorage.getItem('healthSectionOrder');
    return saved ? JSON.parse(saved) : defaultOrder;
  });

  const sections = [
    { id: 'sleep', name: 'Sleep Schedule' },
    { id: 'cycle', name: 'Menstrual Cycle' },
    { id: 'weight', name: '⚖️ Weight Tracker' },
    { id: 'meds', name: 'Medications & Pills' },
    { id: 'glucose', name: 'Blood Glucose' },
    { id: 'mood', name: 'Mood Tracker' },
    { id: 'stress', name: 'Stress Meter' },
    { id: 'breathing', name: 'Breathing Exercises' },
    { id: 'alcohol', name: 'Alcohol / Smoking' },
    { id: 'pregnancy', name: 'Pregnancy Mode' },
  ];

  useEffect(() => {
    localStorage.setItem('healthEnabledSections', JSON.stringify(enabledSections));
  }, [enabledSections]);

  useEffect(() => {
    localStorage.setItem('healthMinimizedSections', JSON.stringify(minimizedSections));
  }, [minimizedSections]);

  // Initialize sleep todos from sleep schedule if they don't exist
  useEffect(() => {
    if (sleepSchedule) {
      const todos = JSON.parse(localStorage.getItem("todos") || "[]");
      const hasSleepTodos = todos.some((t: any) => t.source === 'sleep');
      
      // Only add sleep todos if they don't exist yet
      if (!hasSleepTodos) {
        addSleepToTodos(sleepSchedule);
      }
    }
  }, []); // Run only once on mount

  useEffect(() => {
    localStorage.setItem('healthSectionOrder', JSON.stringify(sectionOrder));
  }, [sectionOrder]);

  function moveSection(section: SectionKey, direction: 'up'|'down') {
    const idx = sectionOrder.indexOf(section);
    if (idx === -1) return;
    const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= sectionOrder.length) return;
    const newOrder = [...sectionOrder];
    const [movedSection] = newOrder.splice(idx, 1);
    newOrder.splice(nextIdx, 0, movedSection);
    setSectionOrder(newOrder);
  }
  
  const [scheduleMode, setScheduleMode] = useState<'daily' | 'weekly'>('daily');
  const [dailyWakeTime, setDailyWakeTime] = useState("07:00");
  const [dailySleepTime, setDailySleepTime] = useState("23:00");
  const [dailyStartupTime, setDailyStartupTime] = useState("");
  const [dailyWinddownTime, setDailyWinddownTime] = useState("");
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
    const savedMeds = localStorage.getItem("medications");
    const savedSleepSchedule = localStorage.getItem("sleepSchedule");
    const savedSleepLogs = localStorage.getItem("sleepLogs");
    
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
    localStorage.setItem("medications", JSON.stringify(medications));
    
    // Check for missed doses daily
    checkMissedDoses();
  }, [medications]);

  const checkMissedDoses = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    
    medications.forEach(med => {
      // Only check once per day
      if (med.lastChecked === today) return;
      
      // Check if medication was scheduled for yesterday
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[yesterday.getDay()] as any;
      const shouldHaveTaken = med.frequency === 'daily' || 
        (med.frequency === 'weekly' && med.days.includes(dayName));
      
      if (shouldHaveTaken) {
        // Check if any medication tasks for yesterday were completed
        const yesterdayMedTasks = todos.filter((t: any) => 
          t.source === 'medication' &&
          t.medicationId === med.id &&
          t.dueDate && new Date(t.dueDate).toDateString() === yesterday.toDateString()
        );
        
        const allCompleted = yesterdayMedTasks.length > 0 && 
          yesterdayMedTasks.every((t: any) => t.completed);
        
        if (!allCompleted && yesterdayMedTasks.length > 0) {
          // Missed dose - increment counter
          setMedications(prev => prev.map(m => 
            m.id === med.id 
              ? { ...m, missedDoses: (m.missedDoses || 0) + 1, lastChecked: today }
              : m
          ));
        } else {
          // Mark as checked for today
          setMedications(prev => prev.map(m => 
            m.id === med.id 
              ? { ...m, lastChecked: today }
              : m
          ));
        }
      }
    });
  };

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


  const handleAddMedication = () => {
    if (newMedName && newMedTime) {
      const newMed: Medication = {
        id: Date.now().toString(),
        name: newMedName,
        emoji: newMedEmoji,
        dosage: newMedDosage,
        times: [newMedTime],
        frequency: newMedFrequency,
        days: newMedDays.slice(),
        priority: newMedPriority,
      };
      setMedications([...medications, newMed]);
      setNewMedName("");
      setNewMedEmoji("💊");
      setNewMedDosage("");
      setNewMedTime("");
      setNewMedDays(['monday','tuesday','wednesday','thursday','friday','saturday','sunday']);
      setNewMedPriority('medium');
      setIsAddMedOpen(false);
      
      addMedicationToTodo(newMed);
    }
  };

  const addMedicationToTodo = (med: Medication) => {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    const todayName = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][new Date().getDay()] as Medication['days'][number];
    const shouldScheduleToday = med.frequency === 'daily' || med.days?.includes(todayName);
    if (!shouldScheduleToday) {
      localStorage.setItem("todos", JSON.stringify(todos));
      return;
    }
    const timeForToday = med.times[0];
    const newTodo = {
      id: `med-${med.id}-${Date.now()}`,
      title: `${med.emoji} Take ${med.name}`,
      completed: false,
      dueDate: new Date().toISOString(),
      time: timeForToday,
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
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    
    // Create sleep tasks for the next 30 days
    for (let i = 0; i < 30; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + i);
      const dayName = dayNames[targetDate.getDay()];
      
      let wakeTime: string;
      let sleepTime: string;
      
      if (schedule.mode === 'daily' && schedule.daily) {
        wakeTime = schedule.daily.wakeTime;
        sleepTime = schedule.daily.sleepTime;
      } else if (schedule.mode === 'weekly' && schedule.weekly && schedule.weekly[dayName]) {
        wakeTime = schedule.weekly[dayName].wakeTime;
        sleepTime = schedule.weekly[dayName].sleepTime;
      } else {
        continue; // Skip if no schedule for this day
      }
      
      const wakeTodo = {
        id: `sleep-wake-${targetDate.toISOString().split('T')[0]}`,
        title: `${schedule.alarmEnabled ? '⏰' : '🌅'} Wake up`,
        completed: false,
        dueDate: targetDate.toISOString(),
        time: wakeTime,
        source: 'sleep',
        sleepAction: 'wake',
      };
      
      const sleepTodo = {
        id: `sleep-bed-${targetDate.toISOString().split('T')[0]}`,
        title: '🌙 Go to bed',
        completed: false,
        dueDate: targetDate.toISOString(),
        time: sleepTime,
        source: 'sleep',
        sleepAction: 'sleep',
      };
      
      filteredTodos.push(wakeTodo, sleepTodo);
    }
    
    localStorage.setItem("todos", JSON.stringify(filteredTodos));
    window.dispatchEvent(new Event("todosUpdated"));
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


  const deleteMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
  };


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

  const totalSleepHours = (() => {
    const schedule = getCurrentDaySchedule();
    if (!schedule?.wakeTime || !schedule?.sleepTime) return null;
    // compute duration from sleepTime to wakeTime across midnight if needed
    const [sleepH, sleepM] = schedule.sleepTime.split(":").map(Number);
    const [wakeH, wakeM] = schedule.wakeTime.split(":").map(Number);
    const sleepMinutes = sleepH * 60 + sleepM;
    const wakeMinutes = wakeH * 60 + wakeM;
    const minutes = (wakeMinutes - sleepMinutes + 24 * 60) % (24 * 60);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hr${hours !== 1 ? "" : ""}${mins ? ` ${mins} min` : ""}`;
  })();

  return (
    <div className="min-h-screen bg-background pb-20 pt-16">
      <PageHeader 
        title="Health" 
        icon={Heart}
        onStatsClick={() => setShowStats(true)} 
        additionalButtons={
          <ManageColumns
            title="Manage Columns"
            columns={sections}
            order={sectionOrder}
            visibility={enabledSections}
            minimized={minimizedSections}
            onOrderChange={(newOrder) => setSectionOrder(newOrder as SectionKey[])}
            onVisibilityChange={setEnabledSections}
            onMinimizeChange={setMinimizedSections}
            testId="button-column-settings"
          />
        }
      />

      <main className="w-full max-w-md lg:max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Date Carousel */}
        <DateCarousel 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {sectionOrder.map((sectionId) => {
          if (!enabledSections[sectionId as SectionKey]) return null;
          
          if (sectionId === 'sleep') {
            return (
        <MinimizableCard
          key={sectionId}
          title="😴 Sleep Schedule"
          minimized={minimizedSections[sectionId]}
          onMinimizeChange={(minimized) => setMinimizedSections(prev => ({ ...prev, [sectionId]: minimized }))}
        >
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex gap-2">
              {sleepSchedule && (
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={() => setIsSleepQualityOpen(true)}
                  data-testid="button-log-sleep-quality"
                  title="Log sleep quality"
                >
                  <Sun className="w-4 h-4" />
                </Button>
              )}
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setIsWinddownStartupOpen(true)}
                data-testid="button-winddown-startup"
                title="Winddown & Startup"
              >
                <Sunset className="w-4 h-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setIsSleepScheduleOpen(true)}
                data-testid="button-sleep-schedule"
                title="Sleep schedule"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {sleepSchedule ? (
              <Tabs defaultValue="schedule" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="schedule" data-testid="tab-sleep-schedule" className="rounded-full">Schedule</TabsTrigger>
                  <TabsTrigger value="daily" data-testid="tab-sleep-daily" className="rounded-full">Daily</TabsTrigger>
                  <TabsTrigger value="weekly" data-testid="tab-sleep-weekly" className="rounded-full">Weekly</TabsTrigger>
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
                  {totalSleepHours && (
                    <div className="text-center pt-2 text-sm text-muted-foreground">
                      Estimated sleep: <span className="font-semibold">{totalSleepHours}</span>
                    </div>
                  )}
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
                            {/* Wake up section with startup routine sub-section */}
                            <div className={`p-3 rounded-lg border-2 ${wakeTodo?.completed ? 'bg-success/10 border-success' : 'bg-muted/50 border-border'}`}>
                              <div className="flex items-center justify-between mb-2">
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
                            
                            {/* Bedtime section with winddown routine sub-section */}
                            <div className={`p-3 rounded-lg border-2 ${sleepTodo?.completed ? 'bg-success/10 border-success' : 'bg-muted/50 border-border'}`}>
                              <div className="flex items-center justify-between mb-2">
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
                      const isTodayDate = isToday(date);
                      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      const dayName = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][date.getDay()] as keyof typeof sleepSchedule.weekly;
                      const schedule = sleepSchedule?.mode === 'daily' && sleepSchedule.daily
                        ? sleepSchedule.daily
                        : sleepSchedule?.weekly?.[dayName];
                      return (
                        <div 
                          key={i} 
                          className={`flex flex-col items-center p-2 rounded-lg ${isTodayDate ? 'bg-accent' : 'bg-muted/50'}`}
                          data-testid={`sleep-day-${i}`}
                        >
                          <span className="text-xs font-medium mb-1">{dayNames[date.getDay()]}</span>
                          <span className="text-sm font-bold mb-1">{date.getDate()}</span>
                          {schedule ? (
                            <div className="text-xs text-center">
                              <div>Wake {schedule.wakeTime}</div>
                              <div>Sleep {schedule.sleepTime}</div>
                            </div>
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
          </div>
          </MinimizableCard>
            );
          }
          
          if (sectionId === 'cycle') {
            return (
              <MinimizableCard
                key={sectionId}
                title="🌸 Menstrual Cycle"
                minimized={minimizedSections[sectionId]}
                onMinimizeChange={(minimized) => setMinimizedSections(prev => ({ ...prev, [sectionId]: minimized }))}
              >
                <MenstrualCycleTracker />
              </MinimizableCard>
            );
          }

          if (sectionId === 'weight') {
            return (
              <MinimizableCard
                key={sectionId}
                title="⚖️ Weight Tracker"
                minimized={minimizedSections[sectionId]}
                onMinimizeChange={(minimized) => setMinimizedSections(prev => ({ ...prev, [sectionId]: minimized }))}
              >
                <WeightGoalTracker currentWeight={getCurrentWeight()} onWeightUpdate={() => {}} />
              </MinimizableCard>
            );
          }
          
          if (sectionId === 'meds') {
            return (
        <MinimizableCard
          key={sectionId}
          title="💊 Medications & Pills"
          minimized={minimizedSections[sectionId]}
          onMinimizeChange={(minimized) => setMinimizedSections(prev => ({ ...prev, [sectionId]: minimized }))}
        >
          <UniversalContainer
            isEmpty={medications.length === 0}
            onAdd={() => setIsAddMedOpen(true)}
            emptyMessage="Add medications to get reminders"
          >
            <div className="space-y-2">
              {medications.map((med) => (
                  <div 
                    key={med.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                  <div className="text-3xl">{med.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{med.name}</p>
                        {med.priority === 'critical' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300 font-semibold">
                            MUST TAKE
                          </span>
                        )}
                        {med.priority === 'high' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-300">
                            High
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {med.dosage} • {med.times.join(", ")} • {med.frequency}{med.frequency!=="daily" && med.days?.length ? ` • ${med.days.join(', ')}` : ''}
                      </p>
                      {med.lastTaken && (
                        <p className="text-xs text-success mt-1">
                          ✓ Last taken: {format(new Date(med.lastTaken), 'MMM d, h:mm a')}
                        </p>
                      )}
                      {med.missedDoses && med.missedDoses > 0 && (
                        <p className="text-xs text-destructive mt-1">
                          ⚠️ Missed doses: {med.missedDoses}
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
          </UniversalContainer>
        </MinimizableCard>
            );
          }
          
          if (sectionId === 'mood') {
            return (
              <MinimizableCard
                key={sectionId}
                title="😊 Mood Tracker"
                minimized={minimizedSections[sectionId]}
                onMinimizeChange={(minimized) => setMinimizedSections(prev => ({ ...prev, [sectionId]: minimized }))}
              >
                <MoodTracker />
              </MinimizableCard>
            );
          }
          
          if (sectionId === 'glucose') {
            return (
              <MinimizableCard
                key={sectionId}
                title="🩸 Blood Glucose"
                minimized={minimizedSections[sectionId]}
                onMinimizeChange={(minimized) => setMinimizedSections(prev => ({ ...prev, [sectionId]: minimized }))}
              >
                <BloodGlucoseTracker />
              </MinimizableCard>
            );
          }
          
          if (sectionId === 'stress') {
            return (
              <MinimizableCard
                key={sectionId}
                title="😰 Stress Meter"
                minimized={minimizedSections[sectionId]}
                onMinimizeChange={(minimized) => setMinimizedSections(prev => ({ ...prev, [sectionId]: minimized }))}
              >
                <StressMeter />
              </MinimizableCard>
            );
          }
          
          if (sectionId === 'breathing') {
            return (
              <MinimizableCard
                key={sectionId}
                title="🧘 Breathing & Mindfulness"
                minimized={minimizedSections[sectionId]}
                onMinimizeChange={(minimized) => setMinimizedSections(prev => ({ ...prev, [sectionId]: minimized }))}
              >
                <BreathingExercises />
              </MinimizableCard>
            );
          }
          
          if (sectionId === 'alcohol') {
            return (
              <MinimizableCard
                key={sectionId}
                title="🍷 Alcohol / Smoking"
                minimized={minimizedSections[sectionId]}
                onMinimizeChange={(minimized) => setMinimizedSections(prev => ({ ...prev, [sectionId]: minimized }))}
              >
                <AlcoholSmokingTracker />
              </MinimizableCard>
            );
          }
          
          if (sectionId === 'pregnancy') {
            return (
              <MinimizableCard
                key={sectionId}
                title="🤱 Pregnancy Mode"
                minimized={minimizedSections[sectionId]}
                onMinimizeChange={(minimized) => setMinimizedSections(prev => ({ ...prev, [sectionId]: minimized }))}
              >
                <PregnancyMode />
              </MinimizableCard>
            );
          }
          
          return null;
        })}
      </main>


      <UniversalDialog
        open={isAddMedOpen}
        onOpenChange={setIsAddMedOpen}
        title="Add Medication"
        onSave={handleAddMedication}
        saveLabel="Add Medication"
      >
            <div>
              <Label htmlFor="med-emoji">Emoji</Label>
              <EmojiPicker 
                value={newMedEmoji}
                onChange={setNewMedEmoji}
                category="health"
              />
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
            <div>
              <Label>Days</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(['sunday','monday','tuesday','wednesday','thursday','friday','saturday'] as const).map(day => (
                  <button
                    key={day}
                    type="button"
                    className={`px-3 py-1 rounded-full border text-xs ${newMedDays.includes(day) ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setNewMedDays(prev => prev.includes(day) ? prev.filter(d => d!==day) : [...prev, day])}
                  >
                    {day.slice(0,3)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="med-priority">Importance Level - {newMedPriority.charAt(0).toUpperCase() + newMedPriority.slice(1)}</Label>
              <div className="pt-2">
                <Slider
                  id="med-priority"
                  min={0}
                  max={3}
                  step={1}
                  value={[newMedPriority === 'low' ? 0 : newMedPriority === 'medium' ? 1 : newMedPriority === 'high' ? 2 : 3]}
                  onValueChange={(value) => {
                    const priority = value[0] === 0 ? 'low' : value[0] === 1 ? 'medium' : value[0] === 2 ? 'high' : 'critical';
                    setNewMedPriority(priority);
                  }}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                  <span className="text-red-600 font-semibold">Must Take</span>
                </div>
              </div>
            </div>
      </UniversalDialog>

      <UniversalDialog
        open={isSleepScheduleOpen}
        onOpenChange={setIsSleepScheduleOpen}
        title={`${sleepSchedule ? 'Update' : 'Set'} Sleep Schedule`}
        onSave={handleSaveSleepSchedule}
        saveLabel="Save Schedule"
      >
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
                <div className="grid grid-cols-2 gap-3">
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
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const).map((day) => (
                  <div key={day} className="p-3 border rounded-md space-y-2">
                    <p className="font-medium text-sm capitalize">{day}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor={`${day}-wake`} className="text-xs">Wake Time</Label>
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
                        <Label htmlFor={`${day}-sleep`} className="text-xs">Bedtime</Label>
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
      </UniversalDialog>

      <UniversalDialog
        open={isSleepQualityOpen}
        onOpenChange={setIsSleepQualityOpen}
        title="How was your sleep?"
        hideDefaultFooter
      >
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
      </UniversalDialog>

      <WinddownStartupDialog 
        open={isWinddownStartupOpen} 
        onOpenChange={setIsWinddownStartupOpen} 
      />

      <MonthlyStatsModal open={showStats} onOpenChange={setShowStats} />
    </div>
  );
}
