import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Play, Pause, RotateCcw, AlertCircle, Plus, Trash2 } from "lucide-react";

interface BreakTime {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
}

interface WorkSchedule {
  mode: 'daily' | 'weekly' | 'custom';
  daily?: {
    startTime: string;
    endTime: string;
    breaks: BreakTime[];
    location?: 'office' | 'home' | 'hybrid';
  };
  weekly?: {
    monday: { startTime: string; endTime: string; breaks: BreakTime[]; location?: 'office' | 'home' | 'hybrid' };
    tuesday: { startTime: string; endTime: string; breaks: BreakTime[]; location?: 'office' | 'home' | 'hybrid' };
    wednesday: { startTime: string; endTime: string; breaks: BreakTime[]; location?: 'office' | 'home' | 'hybrid' };
    thursday: { startTime: string; endTime: string; breaks: BreakTime[]; location?: 'office' | 'home' | 'hybrid' };
    friday: { startTime: string; endTime: string; breaks: BreakTime[]; location?: 'office' | 'home' | 'hybrid' };
    saturday?: { startTime: string; endTime: string; breaks: BreakTime[]; location?: 'office' | 'home' | 'hybrid' };
    sunday?: { startTime: string; endTime: string; breaks: BreakTime[]; location?: 'office' | 'home' | 'hybrid' };
  };
  customDays?: string[]; // Array of day names
  enabled: boolean;
  addToTodo: boolean;
}

interface OfficeSettings {
  // Working Hours Schedule
  workSchedule?: WorkSchedule;
  
  // Legacy Working Hours (for backward compatibility)
  workStartTime: string;
  workEndTime: string;
  breaks: BreakTime[];
  
  // Pomodoro
  pomodoroWork: number; // minutes
  pomodoroBreak: number; // minutes
  pomodoroLongBreak: number; // minutes
  pomodoroLongBreakInterval: number; // after how many cycles
  
  // 30-60 Rule (Sit-Stand)
  sitStandEnabled: boolean;
  sitDuration: number; // minutes (default 30)
  standDuration: number; // minutes (default 60 or less)
  
  // 20-20-20 Eye Break
  eyeBreakEnabled: boolean;
  eyeBreakInterval: number; // minutes (default 20)
  eyeBreakDuration: number; // seconds (default 20)
  
  // Posture Check
  postureCheckEnabled: boolean;
  postureCheckInterval: number; // minutes
  
  // To Do integration
  addRemindersToTodo: boolean;
}

export default function OfficeProductivity() {
  const [settings, setSettings] = useState<OfficeSettings>(() => {
    const saved = localStorage.getItem('office_settings');
    return saved ? JSON.parse(saved) : {
      workStartTime: '09:00',
      workEndTime: '17:00',
      breaks: [
        { id: '1', startTime: '12:00', endTime: '13:00', label: 'Lunch Break' }
      ],
      pomodoroWork: 25,
      pomodoroBreak: 5,
      pomodoroLongBreak: 15,
      pomodoroLongBreakInterval: 4,
      sitStandEnabled: false,
      sitDuration: 30,
      standDuration: 5,
      eyeBreakEnabled: false,
      eyeBreakInterval: 20,
      eyeBreakDuration: 20,
      postureCheckEnabled: false,
      postureCheckInterval: 30,
      addRemindersToTodo: false,
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWorkScheduleOpen, setIsWorkScheduleOpen] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(settings.pomodoroWork * 60); // in seconds
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'break'>('work');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  
  // Work schedule state
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>(() => {
    const saved = localStorage.getItem('work_schedule');
    return saved ? JSON.parse(saved) : {
      mode: 'daily',
      daily: {
        startTime: '09:00',
        endTime: '17:00',
        breaks: [{ id: '1', startTime: '12:00', endTime: '13:00', label: 'Lunch Break' }],
        location: 'office',
      },
      enabled: false,
      addToTodo: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('office_settings', JSON.stringify(settings));
    
    // Sync reminders to To Do if enabled
    if (settings.addRemindersToTodo) {
      syncRemindersToTodo();
    }
  }, [settings]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (pomodoroRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(prev => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0 && pomodoroRunning) {
      // Timer finished
      handlePomodoroComplete();
    }
    return () => clearInterval(interval);
  }, [pomodoroRunning, pomodoroTime]);

  const isTimeInBreak = (time: string): boolean => {
    const [hour, min] = time.split(':').map(Number);
    const timeMinutes = hour * 60 + min;
    
    return settings.breaks.some(breakTime => {
      const [startHour, startMin] = breakTime.startTime.split(':').map(Number);
      const [endHour, endMin] = breakTime.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      return timeMinutes >= startMinutes && timeMinutes < endMinutes;
    });
  };

  const syncRemindersToTodo = () => {
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    const today = new Date();
    
    // Remove old office reminder tasks for today
    const filteredTodos = todos.filter((t: any) => 
      !['sit-stand', 'eye-break', 'posture'].includes(t.source) || 
      (t.dueDate && new Date(t.dueDate).toDateString() !== today.toDateString())
    );
    
    // Add Sit-Stand reminders
    if (settings.sitStandEnabled) {
      const reminders = generateTimeReminders(
        settings.workStartTime,
        settings.workEndTime,
        settings.sitDuration + settings.standDuration
      ).filter(time => !isTimeInBreak(time));
      
      reminders.forEach(time => {
        filteredTodos.push({
          id: `sit-stand-${time}-${today.toISOString().split('T')[0]}`,
          title: 'Stand up and stretch',
          completed: false,
          source: 'sit-stand' as const,
          dueDate: today.toISOString(),
          time: time,
          emoji: '🧍',
        });
      });
    }
    
    // Add Eye Break reminders
    if (settings.eyeBreakEnabled) {
      const reminders = generateTimeReminders(
        settings.workStartTime,
        settings.workEndTime,
        settings.eyeBreakInterval
      ).filter(time => !isTimeInBreak(time));
      
      reminders.forEach(time => {
        filteredTodos.push({
          id: `eye-break-${time}-${today.toISOString().split('T')[0]}`,
          title: '20-20-20 Eye Break',
          completed: false,
          source: 'eye-break' as const,
          dueDate: today.toISOString(),
          time: time,
          emoji: '👀',
        });
      });
    }
    
    // Add Posture Check reminders
    if (settings.postureCheckEnabled) {
      const reminders = generateTimeReminders(
        settings.workStartTime,
        settings.workEndTime,
        settings.postureCheckInterval
      ).filter(time => !isTimeInBreak(time));
      
      reminders.forEach(time => {
        filteredTodos.push({
          id: `posture-${time}-${today.toISOString().split('T')[0]}`,
          title: 'Check your posture',
          completed: false,
          source: 'posture' as const,
          dueDate: today.toISOString(),
          time: time,
          emoji: '🪑',
        });
      });
    }
    
    localStorage.setItem('todos', JSON.stringify(filteredTodos));
    window.dispatchEvent(new Event('todosUpdated'));
  };

  const generateTimeReminders = (startTime: string, endTime: string, intervalMinutes: number): string[] => {
    const reminders: string[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin <= endMin)) {
      reminders.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`);
      currentMin += intervalMinutes;
      while (currentMin >= 60) {
        currentMin -= 60;
        currentHour++;
      }
      if (currentHour > endHour) break;
    }
    
    return reminders;
  };

  const handlePomodoroComplete = () => {
    setPomodoroRunning(false);
    if (pomodoroMode === 'work') {
      setPomodoroCount(prev => prev + 1);
      const isLongBreak = (pomodoroCount + 1) % settings.pomodoroLongBreakInterval === 0;
      setPomodoroTime(isLongBreak ? settings.pomodoroLongBreak * 60 : settings.pomodoroBreak * 60);
      setPomodoroMode('break');
    } else {
      setPomodoroTime(settings.pomodoroWork * 60);
      setPomodoroMode('work');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const togglePomodoro = () => {
    setPomodoroRunning(!pomodoroRunning);
  };

  const resetPomodoro = () => {
    setPomodoroRunning(false);
    setPomodoroTime(settings.pomodoroWork * 60);
    setPomodoroMode('work');
    setPomodoroCount(0);
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {/* Header with Add widgets and Settings buttons */}
        <div className="flex items-center justify-end gap-2 mb-2">
          <Button 
            variant="outline" 
            size="icon"
            className="rounded-full w-10 h-10"
            onClick={() => setIsWorkScheduleOpen(true)}
            title="Add work schedule"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Office Productivity Settings</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="hours" className="pt-4">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="hours">⏰</TabsTrigger>
                    <TabsTrigger value="pomodoro">🍅</TabsTrigger>
                    <TabsTrigger value="sitstand">🧍</TabsTrigger>
                    <TabsTrigger value="eyes">👀</TabsTrigger>
                    <TabsTrigger value="posture">🪑</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="hours" className="space-y-4">
                    <h3 className="font-semibold">Working Hours</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Work Start</Label>
                        <Input
                          type="time"
                          value={settings.workStartTime}
                          onChange={(e) => setSettings({...settings, workStartTime: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Work End</Label>
                        <Input
                          type="time"
                          value={settings.workEndTime}
                          onChange={(e) => setSettings({...settings, workEndTime: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold">Break Times</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newBreak: BreakTime = {
                              id: Date.now().toString(),
                              startTime: '12:00',
                              endTime: '13:00',
                              label: 'Break'
                            };
                            setSettings({...settings, breaks: [...settings.breaks, newBreak]});
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Break
                        </Button>
                      </div>
                      
                      {settings.breaks.map((breakTime, index) => (
                        <div key={breakTime.id} className="p-3 bg-muted rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <Input
                              placeholder="Break name"
                              value={breakTime.label}
                              onChange={(e) => {
                                const newBreaks = [...settings.breaks];
                                newBreaks[index].label = e.target.value;
                                setSettings({...settings, breaks: newBreaks});
                              }}
                              className="h-8 text-sm"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const newBreaks = settings.breaks.filter((_, i) => i !== index);
                                setSettings({...settings, breaks: newBreaks});
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Start</Label>
                              <Input
                                type="time"
                                value={breakTime.startTime}
                                onChange={(e) => {
                                  const newBreaks = [...settings.breaks];
                                  newBreaks[index].startTime = e.target.value;
                                  setSettings({...settings, breaks: newBreaks});
                                }}
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">End</Label>
                              <Input
                                type="time"
                                value={breakTime.endTime}
                                onChange={(e) => {
                                  const newBreaks = [...settings.breaks];
                                  newBreaks[index].endTime = e.target.value;
                                  setSettings({...settings, breaks: newBreaks});
                                }}
                                className="h-8"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {settings.breaks.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          No breaks configured. Reminders will run throughout work hours.
                        </p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pomodoro" className="space-y-4">
                    <h3 className="font-semibold">Pomodoro Settings</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Work Duration (min)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="60"
                          value={settings.pomodoroWork}
                          onChange={(e) => setSettings({...settings, pomodoroWork: parseInt(e.target.value) || 25})}
                        />
                      </div>
                      <div>
                        <Label>Short Break (min)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          value={settings.pomodoroBreak}
                          onChange={(e) => setSettings({...settings, pomodoroBreak: parseInt(e.target.value) || 5})}
                        />
                      </div>
                      <div>
                        <Label>Long Break (min)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="60"
                          value={settings.pomodoroLongBreak}
                          onChange={(e) => setSettings({...settings, pomodoroLongBreak: parseInt(e.target.value) || 15})}
                        />
                      </div>
                      <div>
                        <Label>Long Break After</Label>
                        <Input
                          type="number"
                          min="2"
                          max="10"
                          value={settings.pomodoroLongBreakInterval}
                          onChange={(e) => setSettings({...settings, pomodoroLongBreakInterval: parseInt(e.target.value) || 4})}
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sitstand" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable Sit-Stand Reminders</Label>
                      <Switch
                        checked={settings.sitStandEnabled}
                        onCheckedChange={(checked) => setSettings({...settings, sitStandEnabled: checked})}
                      />
                    </div>
                    {settings.sitStandEnabled && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Sit Duration (min)</Label>
                            <Input
                              type="number"
                              min="10"
                              max="120"
                              value={settings.sitDuration}
                              onChange={(e) => setSettings({...settings, sitDuration: parseInt(e.target.value) || 30})}
                            />
                          </div>
                          <div>
                            <Label>Stand Duration (min)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="30"
                              value={settings.standDuration}
                              onChange={(e) => setSettings({...settings, standDuration: parseInt(e.target.value) || 5})}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          💡 Recommended: Sit for 30 min, stand for 5-10 min
                        </p>
                      </>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="eyes" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable 20-20-20 Eye Breaks</Label>
                      <Switch
                        checked={settings.eyeBreakEnabled}
                        onCheckedChange={(checked) => setSettings({...settings, eyeBreakEnabled: checked})}
                      />
                    </div>
                    {settings.eyeBreakEnabled && (
                      <>
                        <div>
                          <Label>Interval (minutes)</Label>
                          <Input
                            type="number"
                            min="5"
                            max="60"
                            value={settings.eyeBreakInterval}
                            onChange={(e) => setSettings({...settings, eyeBreakInterval: parseInt(e.target.value) || 20})}
                          />
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-900">
                            <strong>20-20-20 Rule:</strong> Every 20 minutes, look at something 20 feet (≈6 meters) away for 20 seconds.
                          </p>
                        </div>
                      </>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="posture" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable Posture Checks</Label>
                      <Switch
                        checked={settings.postureCheckEnabled}
                        onCheckedChange={(checked) => setSettings({...settings, postureCheckEnabled: checked})}
                      />
                    </div>
                    {settings.postureCheckEnabled && (
                      <>
                        <div>
                          <Label>Check Interval (minutes)</Label>
                          <Input
                            type="number"
                            min="10"
                            max="120"
                            value={settings.postureCheckInterval}
                            onChange={(e) => setSettings({...settings, postureCheckInterval: parseInt(e.target.value) || 30})}
                          />
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-xs text-amber-900">
                            <strong>Good Posture Tips:</strong><br />
                            • Keep back straight, shoulders relaxed<br />
                            • Feet flat on floor<br />
                            • Screen at eye level<br />
                            • Arms at 90° angle
                          </p>
                        </div>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label>Add Reminders to To Do</Label>
                    <Switch
                      checked={settings.addRemindersToTodo}
                      onCheckedChange={(checked) => setSettings({...settings, addRemindersToTodo: checked})}
                    />
                  </div>
                </div>
                
                <Button onClick={() => setIsSettingsOpen(false)} className="w-full mt-4">
                  Save Settings
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        
        {/* Pomodoro Timer */}
        <div className="text-center space-y-4">
          <div className={`text-6xl font-mono ${pomodoroMode === 'work' ? 'text-red-600' : 'text-green-600'}`}>
            {formatTime(pomodoroTime)}
          </div>
          <p className="text-sm text-muted-foreground">
            {pomodoroMode === 'work' ? '🔥 Work Time' : '☕ Break Time'} • Session #{pomodoroCount + 1}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={togglePomodoro} variant={pomodoroRunning ? "outline" : "default"}>
              {pomodoroRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {pomodoroRunning ? 'Pause' : 'Start'}
            </Button>
            <Button onClick={resetPomodoro} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Active Reminders Status */}
        <div className="space-y-2 pt-4 border-t">
          <h4 className="text-sm font-semibold mb-2">Active Reminders</h4>
          {settings.sitStandEnabled && (
            <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
              <span>🧍</span>
              <span>Sit-Stand every {settings.sitDuration + settings.standDuration} min</span>
            </div>
          )}
          {settings.eyeBreakEnabled && (
            <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
              <span>👀</span>
              <span>Eye break every {settings.eyeBreakInterval} min</span>
            </div>
          )}
          {settings.postureCheckEnabled && (
            <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
              <span>🪑</span>
              <span>Posture check every {settings.postureCheckInterval} min</span>
            </div>
          )}
          {!settings.sitStandEnabled && !settings.eyeBreakEnabled && !settings.postureCheckEnabled && (
            <p className="text-xs text-muted-foreground text-center py-2">
              No active reminders. Configure in settings.
            </p>
          )}
        </div>
      </CardContent>

      {/* Work Schedule Dialog */}
      <Dialog open={isWorkScheduleOpen} onOpenChange={setIsWorkScheduleOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Work Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label>Enable work schedule in timeline</Label>
              <Switch
                checked={workSchedule.enabled}
                onCheckedChange={(checked) => {
                  setWorkSchedule({...workSchedule, enabled: checked});
                  localStorage.setItem('work_schedule', JSON.stringify({...workSchedule, enabled: checked}));
                }}
              />
            </div>

            {workSchedule.enabled && (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <Label>Add to To Do list</Label>
                  <Switch
                    checked={workSchedule.addToTodo}
                    onCheckedChange={(checked) => {
                      setWorkSchedule({...workSchedule, addToTodo: checked});
                      localStorage.setItem('work_schedule', JSON.stringify({...workSchedule, addToTodo: checked}));
                    }}
                  />
                </div>

                <div>
                  <Label>Schedule Type</Label>
                  <Select 
                    value={workSchedule.mode} 
                    onValueChange={(value: 'daily' | 'weekly' | 'custom') => {
                      setWorkSchedule({...workSchedule, mode: value});
                      localStorage.setItem('work_schedule', JSON.stringify({...workSchedule, mode: value}));
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Same every day</SelectItem>
                      <SelectItem value="weekly">Different each day</SelectItem>
                      <SelectItem value="custom">Custom days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Days Selection */}
                {(workSchedule.mode === 'custom' || workSchedule.mode === 'weekly') && (
                  <div className="space-y-2">
                    <Label>
                      {workSchedule.mode === 'custom' ? 'Select Work Days' : 'Work Schedule (Different each day)'}
                    </Label>
                    {workSchedule.mode === 'custom' ? (
                      <div className="grid grid-cols-4 gap-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                          const isSelected = workSchedule.customDays?.includes(day) || false;
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                const currentDays = workSchedule.customDays || [];
                                const updated = isSelected
                                  ? currentDays.filter(d => d !== day)
                                  : [...currentDays, day];
                                setWorkSchedule({...workSchedule, customDays: updated});
                                localStorage.setItem('work_schedule', JSON.stringify({...workSchedule, customDays: updated}));
                              }}
                              className={`px-3 py-2 rounded-lg text-xs transition-colors ${
                                isSelected 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted hover:bg-muted/70'
                              }`}
                            >
                              {day.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground bg-blue-500/10 border border-blue-500/20 rounded p-3">
                        💡 Weekly schedule with different times per day will be available soon! For now, use "Custom days" to select which days you work.
                      </p>
                    )}
                  </div>
                )}

                {/* Working Hours */}
                <div className="space-y-3 border-t pt-4">
                  <h3 className="font-semibold">Working Hours</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Work Start</Label>
                      <Input
                        type="time"
                        value={settings.workStartTime}
                        onChange={(e) => setSettings({...settings, workStartTime: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Work End</Label>
                      <Input
                        type="time"
                        value={settings.workEndTime}
                        onChange={(e) => setSettings({...settings, workEndTime: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Work Location */}
                <div className="space-y-2">
                  <Label>Work Location</Label>
                  <Select 
                    value={workSchedule.daily?.location || 'office'}
                    onValueChange={(value: 'office' | 'home' | 'hybrid') => {
                      if (workSchedule.mode === 'daily' && workSchedule.daily) {
                        setWorkSchedule({
                          ...workSchedule,
                          daily: { ...workSchedule.daily, location: value }
                        });
                        localStorage.setItem('work_schedule', JSON.stringify({
                          ...workSchedule,
                          daily: { ...workSchedule.daily, location: value }
                        }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">🏢 Office</SelectItem>
                      <SelectItem value="home">🏠 Working from home</SelectItem>
                      <SelectItem value="hybrid">🔄 Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Break Times */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">Break Times</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newBreak: BreakTime = {
                          id: Date.now().toString(),
                          startTime: '12:00',
                          endTime: '13:00',
                          label: 'Lunch Break'
                        };
                        setSettings({...settings, breaks: [...settings.breaks, newBreak]});
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Break
                    </Button>
                  </div>
                  
                  {settings.breaks.map((breakTime, index) => (
                    <div key={breakTime.id} className="p-3 bg-muted rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <Input
                          placeholder="Break name"
                          value={breakTime.label}
                          onChange={(e) => {
                            const newBreaks = [...settings.breaks];
                            newBreaks[index].label = e.target.value;
                            setSettings({...settings, breaks: newBreaks});
                          }}
                          className="h-8 text-sm"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newBreaks = settings.breaks.filter((_, i) => i !== index);
                            setSettings({...settings, breaks: newBreaks});
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Start</Label>
                          <Input
                            type="time"
                            value={breakTime.startTime}
                            onChange={(e) => {
                              const newBreaks = [...settings.breaks];
                              newBreaks[index].startTime = e.target.value;
                              setSettings({...settings, breaks: newBreaks});
                            }}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">End</Label>
                          <Input
                            type="time"
                            value={breakTime.endTime}
                            onChange={(e) => {
                              const newBreaks = [...settings.breaks];
                              newBreaks[index].endTime = e.target.value;
                              setSettings({...settings, breaks: newBreaks});
                            }}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Reminders to To Do */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border-t pt-4">
                  <Label>Add Reminders to To Do</Label>
                  <Switch
                    checked={settings.addRemindersToTodo}
                    onCheckedChange={(checked) => setSettings({...settings, addRemindersToTodo: checked})}
                  />
                </div>
              </>
            )}

            <Button onClick={() => {
              // Add work schedule to To Do if enabled
              if (workSchedule.enabled && workSchedule.addToTodo) {
                const todos = JSON.parse(localStorage.getItem('todos') || '[]');
                
                // Remove existing work schedule tasks
                const filteredTodos = todos.filter((t: any) => t.source !== 'work');
                
                // Add work tasks based on schedule mode
                if (workSchedule.mode === 'daily') {
                  // Add for next 7 days
                  for (let i = 0; i < 7; i++) {
                    const date = new Date();
                    date.setDate(date.getDate() + i);
                    
                    // Create subtasks for breaks
                    const breakSubtasks = settings.breaks.map(breakTime => ({
                      id: `break-${breakTime.id}`,
                      title: `${breakTime.label} (${breakTime.startTime} - ${breakTime.endTime})`,
                      completed: false
                    }));
                    
                    filteredTodos.push({
                      id: `work-${date.toISOString().split('T')[0]}`,
                      title: '💼 Work',
                      emoji: '💼',
                      time: settings.workStartTime,
                      endTime: settings.workEndTime,
                      completed: false,
                      source: 'work' as const,
                      dueDate: date.toISOString(),
                      color: '#3b82f6',
                      subtasks: breakSubtasks.length > 0 ? breakSubtasks : undefined,
                    });
                  }
                } else if (workSchedule.mode === 'custom' && workSchedule.customDays && workSchedule.customDays.length > 0) {
                  // Add for next 4 weeks on selected days
                  const dayMap: Record<string, number> = {
                    'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
                    'Thursday': 4, 'Friday': 5, 'Saturday': 6
                  };
                  
                  // Create subtasks for breaks
                  const breakSubtasks = settings.breaks.map(breakTime => ({
                    id: `break-${breakTime.id}`,
                    title: `${breakTime.label} (${breakTime.startTime} - ${breakTime.endTime})`,
                    completed: false
                  }));
                  
                  for (let week = 0; week < 4; week++) {
                    workSchedule.customDays.forEach(day => {
                      const targetDayNum = dayMap[day];
                      const today = new Date();
                      const currentDay = today.getDay();
                      let daysAhead = targetDayNum - currentDay;
                      if (daysAhead < 0) daysAhead += 7;
                      daysAhead += (week * 7);
                      
                      const date = new Date(today);
                      date.setDate(date.getDate() + daysAhead);
                      
                      filteredTodos.push({
                        id: `work-${date.toISOString().split('T')[0]}`,
                        title: '💼 Work',
                        emoji: '💼',
                        time: settings.workStartTime,
                        endTime: settings.workEndTime,
                        completed: false,
                        source: 'work' as const,
                        dueDate: date.toISOString(),
                        color: '#3b82f6',
                        subtasks: breakSubtasks.length > 0 ? breakSubtasks : undefined,
                      });
                    });
                  }
                }
                
                localStorage.setItem('todos', JSON.stringify(filteredTodos));
                window.dispatchEvent(new Event('todosUpdated'));
              }
              
              setIsWorkScheduleOpen(false);
            }} className="w-full">
              Save & Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

