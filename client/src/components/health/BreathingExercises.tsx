import { useState, useEffect, useRef } from "react";
// Card components removed - component now renders inside MinimizableCard
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UniversalDialog } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Play, Pause, RotateCcw, Timer, Heart, Wind, Settings, Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";

interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
  cycles: number;
  color: string;
  icon: string;
}

interface Session {
  id: string;
  date: string;
  exerciseId: string;
  duration: number;
  completed: boolean;
}

const breathingExercises: BreathingExercise[] = [
  {
    id: "4-7-8",
    name: "4-7-8 Breathing",
    description: "Calming technique for stress relief and better sleep",
    inhaleTime: 4,
    holdTime: 7,
    exhaleTime: 8,
    cycles: 4,
    color: "bg-blue-500",
    icon: "🌙"
  },
  {
    id: "box",
    name: "Box Breathing",
    description: "Military technique for focus and concentration",
    inhaleTime: 4,
    holdTime: 4,
    exhaleTime: 4,
    cycles: 6,
    color: "bg-green-500",
    icon: "📦"
  },
  {
    id: "belly",
    name: "Deep Belly Breathing",
    description: "Foundation breathing for relaxation and mindfulness",
    inhaleTime: 6,
    holdTime: 2,
    exhaleTime: 6,
    cycles: 5,
    color: "bg-purple-500",
    icon: "🫁"
  },
  {
    id: "triangle",
    name: "Triangle Breathing",
    description: "Simple 3-step breathing for quick stress relief",
    inhaleTime: 3,
    holdTime: 3,
    exhaleTime: 3,
    cycles: 8,
    color: "bg-orange-500",
    icon: "🔺"
  }
];

interface BreathingReminder {
  id: string;
  time: string;
  enabled: boolean;
}

export default function BreathingExercises() {
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('breathingSessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [reminders, setReminders] = useState<BreathingReminder[]>(() => {
    const saved = localStorage.getItem('breathingReminders');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise>(breathingExercises[0]);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [newReminderTime, setNewReminderTime] = useState('10:00');
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem('breathingSessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('breathingReminders', JSON.stringify(reminders));
    syncRemindersToTodo();
  }, [reminders]);

  const syncRemindersToTodo = () => {
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    // Remove old breathing reminders for today
    const filteredTodos = todos.filter((t: any) => 
      !(t.source === 'breathing' && new Date(t.dueDate || '').toISOString().split('T')[0] === today)
    );
    
    // Add enabled reminders
    reminders.forEach(reminder => {
      if (reminder.enabled) {
        filteredTodos.push({
          id: nanoid(),
          title: 'Breathing Exercise',
          emoji: '🧘',
          time: reminder.time,
          completed: false,
          source: 'breathing',
          reminderId: reminder.id,
          dueDate: new Date().toISOString()
        });
      }
    });
    
    localStorage.setItem('todos', JSON.stringify(filteredTodos));
    window.dispatchEvent(new Event('todosUpdated'));
  };

  const handleAddReminder = () => {
    const newReminder: BreathingReminder = {
      id: nanoid(),
      time: newReminderTime,
      enabled: true
    };
    setReminders([...reminders, newReminder]);
    setNewReminderTime('10:00');
  };

  const handleToggleReminder = (id: string) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            nextPhase();
            return getPhaseDuration();
          }
          return prev - 1;
        });
        setSessionDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, selectedExercise]);

  const getPhaseDuration = () => {
    switch (currentPhase) {
      case 'inhale': return selectedExercise.inhaleTime;
      case 'hold': return selectedExercise.holdTime;
      case 'exhale': return selectedExercise.exhaleTime;
      case 'rest': return 2;
      default: return 0;
    }
  };

  const nextPhase = () => {
    if (currentPhase === 'inhale') {
      setCurrentPhase('hold');
    } else if (currentPhase === 'hold') {
      setCurrentPhase('exhale');
    } else if (currentPhase === 'exhale') {
      if (currentCycle < selectedExercise.cycles - 1) {
        setCurrentCycle(prev => prev + 1);
        setCurrentPhase('rest');
      } else {
        completeSession();
      }
    } else if (currentPhase === 'rest') {
      setCurrentPhase('inhale');
    }
  };

  const startSession = () => {
    setIsActive(true);
    setCurrentPhase('inhale');
    setTimeLeft(selectedExercise.inhaleTime);
    setCurrentCycle(0);
    setSessionDuration(0);
    sessionStartRef.current = Date.now();
  };

  const pauseSession = () => {
    setIsActive(false);
  };

  const resetSession = () => {
    setIsActive(false);
    setCurrentPhase('inhale');
    setTimeLeft(selectedExercise.inhaleTime);
    setCurrentCycle(0);
    setSessionDuration(0);
  };

  const completeSession = () => {
    setIsActive(false);
    const newSession: Session = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      exerciseId: selectedExercise.id,
      duration: sessionDuration,
      completed: true
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentPhase('inhale');
    setTimeLeft(selectedExercise.inhaleTime);
    setCurrentCycle(0);
    setSessionDuration(0);
  };

  const getPhaseInstructions = () => {
    switch (currentPhase) {
      case 'inhale': return 'Breathe in slowly through your nose';
      case 'hold': return 'Hold your breath gently';
      case 'exhale': return 'Breathe out slowly through your mouth';
      case 'rest': return 'Rest and prepare for the next cycle';
      default: return '';
    }
  };

  const getProgressPercentage = () => {
    const totalCycles = selectedExercise.cycles;
    const currentCycleProgress = currentCycle / totalCycles;
    const phaseProgress = (selectedExercise.cycles - currentCycle - 1) / selectedExercise.cycles;
    return Math.min((currentCycleProgress + phaseProgress) * 100, 100);
  };

  const getTodaySessions = () => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.filter(session => session.date === today);
  };

  const getTotalMinutes = () => {
    return Math.floor(sessions.reduce((sum, session) => sum + session.duration, 0) / 60);
  };

  const todaySessions = getTodaySessions();
  const totalMinutes = getTotalMinutes();

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
          <Settings className="w-4 h-4" />
        </Button>
      </div>
      
      <UniversalDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        title="Breathing Reminders"
        hideDefaultFooter
      >
        <div className="space-y-2">
          <Label>Add Reminder Time</Label>
          <div className="flex gap-2">
            <Input
              type="time"
              value={newReminderTime}
              onChange={(e) => setNewReminderTime(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddReminder}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Active Reminders</Label>
          {reminders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No reminders set
            </p>
          ) : (
            reminders.map(reminder => (
              <div key={reminder.id} className="flex items-center justify-between p-2 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={reminder.enabled}
                    onCheckedChange={() => handleToggleReminder(reminder.id)}
                  />
                  <span className={`text-sm font-medium ${!reminder.enabled ? 'text-muted-foreground' : ''}`}>
                    {reminder.time}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteReminder(reminder.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </UniversalDialog>
      
      <Tabs defaultValue="exercises" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="exercises" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {breathingExercises.map((exercise) => (
                <Button
                  key={exercise.id}
                  variant={selectedExercise.id === exercise.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedExercise(exercise)}
                  className="h-auto p-3 flex flex-col gap-1"
                >
                  <span className="text-lg">{exercise.icon}</span>
                  <span className="text-xs font-medium">{exercise.name}</span>
                </Button>
              ))}
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">{selectedExercise.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{selectedExercise.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Wind className="w-4 h-4" />
                  <span>{selectedExercise.inhaleTime}s in</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{selectedExercise.holdTime}s hold</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="w-4 h-4" />
                  <span>{selectedExercise.exhaleTime}s out</span>
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  <span>{selectedExercise.cycles} cycles</span>
                </div>
              </div>
            </div>

            {isActive ? (
              <div className="text-center space-y-4">
                <div className={`w-32 h-32 mx-auto rounded-full ${selectedExercise.color} flex items-center justify-center text-white text-4xl font-bold transition-all duration-1000 ${
                  currentPhase === 'inhale' ? 'scale-110' : 
                  currentPhase === 'exhale' ? 'scale-90' : 'scale-100'
                }`}>
                  {timeLeft}
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold capitalize">{currentPhase}</p>
                  <p className="text-sm text-muted-foreground">{getPhaseInstructions()}</p>
                  <p className="text-xs text-muted-foreground">
                    Cycle {currentCycle + 1} of {selectedExercise.cycles}
                  </p>
                </div>
                <div className="space-y-2">
                  <Progress value={getProgressPercentage()} className="h-2" />
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm" onClick={pauseSession}>
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetSession}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-32 h-32 mx-auto rounded-full bg-muted flex items-center justify-center text-4xl">
                  {selectedExercise.icon}
                </div>
                <Button onClick={startSession} size="lg" className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Start Exercise
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{todaySessions.length}</p>
                <p className="text-sm text-muted-foreground">Today's Sessions</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-chart-2">{totalMinutes}</p>
                <p className="text-sm text-muted-foreground">Total Minutes</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Recent Sessions</h4>
              {sessions.length > 0 ? (
                <div className="space-y-2">
                  {sessions.slice(0, 5).map((session) => {
                    const exercise = breathingExercises.find(e => e.id === session.exerciseId);
                    return (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{exercise?.icon}</span>
                          <div>
                            <p className="text-sm font-medium">{exercise?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(session.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {Math.floor(session.duration / 60)}m {session.duration % 60}s
                          </Badge>
                          {session.completed && (
                            <Badge variant="default" className="text-xs">✓</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No sessions yet</p>
                  <p className="text-sm text-muted-foreground">Start your first breathing exercise</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
}
