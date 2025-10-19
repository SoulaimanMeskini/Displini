import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import UniversalContainer from "@/components/UniversalContainer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UniversalDialog } from "@/components/shared";
import { Switch } from "@/components/ui/switch";
import { Plus, Settings, Footprints, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StepLog {
  id: string;
  steps: number;
  date: string;
  timestamp: string;
}

interface StepSettings {
  dailyGoal: number;
  remindersEnabled: boolean;
  reminderTimes: string[];
  reminderDays: string[]; // Days of week: 'monday', 'tuesday', etc.
  addToTodo: boolean;
}

export default function StepCounter() {
  const [logs, setLogs] = useState<StepLog[]>(() => {
    const saved = localStorage.getItem('step_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<StepSettings>(() => {
    const saved = localStorage.getItem('step_settings');
    return saved ? JSON.parse(saved) : {
      dailyGoal: 10000,
      remindersEnabled: false,
      reminderTimes: ['12:00', '18:00'],
      reminderDays: [], // Empty by default - user must select days
      addToTodo: false
    };
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newSteps, setNewSteps] = useState('');

  useEffect(() => {
    localStorage.setItem('step_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('step_settings', JSON.stringify(settings));
    
    // Sync step reminders to To Do
    if (settings.remindersEnabled && settings.addToTodo) {
      syncRemindersToTodo();
    }
  }, [settings]);

  const syncRemindersToTodo = () => {
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    const today = new Date();
    
    // Remove all existing step reminder tasks (past, present, future)
    const filteredTodos = todos.filter((t: any) => t.source !== 'steps');
    
    // Day mapping
    const dayMap: Record<string, number> = {
      'sunday': 0, 'sun': 0,
      'monday': 1, 'mon': 1,
      'tuesday': 2, 'tue': 2,
      'wednesday': 3, 'wed': 3,
      'thursday': 4, 'thu': 4,
      'friday': 5, 'fri': 5,
      'saturday': 6, 'sat': 6
    };
    
    // Generate reminders for the next 7 days based on selected days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + dayOffset);
      
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      // Check if this day is selected
      if (settings.reminderDays.includes(dayName)) {
        // Add reminder tasks for each time on this day
        settings.reminderTimes.forEach(time => {
          const newTask = {
            id: `steps-${time}-${targetDate.toISOString().split('T')[0]}`,
            title: 'Check step count',
            completed: false,
            source: 'steps' as const,
            dueDate: targetDate.toISOString(),
            time: time,
            emoji: '👟',
          };
          filteredTodos.push(newTask);
        });
      }
    }
    
    localStorage.setItem('todos', JSON.stringify(filteredTodos));
    window.dispatchEvent(new Event('todosUpdated'));
  };

  const handleAddSteps = () => {
    if (!newSteps) return;

    const log: StepLog = {
      id: Date.now().toString(),
      steps: parseInt(newSteps),
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };

    setLogs([log, ...logs]);
    setNewSteps('');
    setIsAddOpen(false);
  };

  const todaySteps = logs
    .filter(l => l.date === new Date().toISOString().split('T')[0])
    .reduce((sum, l) => sum + l.steps, 0);

  const progress = Math.min((todaySteps / settings.dailyGoal) * 100, 100);

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-4">
          <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="w-4 h-4" />
          </Button>
      </div>

      <UniversalDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        title="Step Counter Settings"
        onSave={() => setIsSettingsOpen(false)}
        saveLabel="Save Settings"
      >
                <div>
                  <Label>Daily Step Goal</Label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={settings.dailyGoal}
                    onChange={(e) => setSettings({...settings, dailyGoal: parseInt(e.target.value) || 10000})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Enable Reminders</Label>
                  <Switch
                    checked={settings.remindersEnabled}
                    onCheckedChange={(checked) => setSettings({...settings, remindersEnabled: checked})}
                  />
                </div>
                {settings.remindersEnabled && (
                  <>
                    <div className="flex items-center justify-between">
                      <Label>Add to To Do Timeline</Label>
                      <Switch
                        checked={settings.addToTodo}
                        onCheckedChange={(checked) => setSettings({...settings, addToTodo: checked})}
                      />
                    </div>
                    <div>
                      <Label>Reminder Days</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {[
                          { value: 'monday', label: 'Mon' },
                          { value: 'tuesday', label: 'Tue' },
                          { value: 'wednesday', label: 'Wed' },
                          { value: 'thursday', label: 'Thu' },
                          { value: 'friday', label: 'Fri' },
                          { value: 'saturday', label: 'Sat' },
                          { value: 'sunday', label: 'Sun' },
                        ].map((day) => (
                          <Button
                            key={day.value}
                            type="button"
                            variant={settings.reminderDays.includes(day.value) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              const newDays = settings.reminderDays.includes(day.value)
                                ? settings.reminderDays.filter(d => d !== day.value)
                                : [...settings.reminderDays, day.value];
                              setSettings({...settings, reminderDays: newDays});
                            }}
                          >
                            {day.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Reminder Times</Label>
                      <div className="space-y-2 mt-2">
                        {settings.reminderTimes.map((time, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              type="time"
                              value={time}
                              onChange={(e) => {
                                const newTimes = [...settings.reminderTimes];
                                newTimes[index] = e.target.value;
                                setSettings({...settings, reminderTimes: newTimes});
                              }}
                            />
                            <Button
                              variant="ghost"
                              onClick={() => {
                                const newTimes = settings.reminderTimes.filter((_, i) => i !== index);
                                setSettings({...settings, reminderTimes: newTimes});
                              }}
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSettings({...settings, reminderTimes: [...settings.reminderTimes, '12:00']})}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Time
                        </Button>
                      </div>
                    </div>
                  </>
                )}
      </UniversalDialog>

      <UniversalDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Log Steps"
        onSave={handleAddSteps}
        saveLabel="Log Steps"
      >
        <div>
          <Label>Number of Steps</Label>
          <Input
            type="number"
            placeholder="5000"
            value={newSteps}
            onChange={(e) => setNewSteps(e.target.value)}
            autoFocus
          />
        </div>
      </UniversalDialog>
      <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Today's Progress</span>
              <span className="text-sm font-medium">
                {todaySteps.toLocaleString()} / {settings.dailyGoal.toLocaleString()}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">
              {todaySteps >= settings.dailyGoal ? (
                <span className="text-green-600 font-medium">🎉 Goal reached!</span>
              ) : (
                `${(settings.dailyGoal - todaySteps).toLocaleString()} steps to go`
              )}
            </p>
          </div>

          {logs.filter(l => l.date === new Date().toISOString().split('T')[0]).length > 0 && (
            <div className="pt-3 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-2">Today's Logs</p>
              <div className="space-y-1">
                {logs
                  .filter(l => l.date === new Date().toISOString().split('T')[0])
                  .map(log => (
                    <div key={log.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                      <span className="flex items-center gap-2">
                        <Footprints className="w-3 h-3" />
                        {log.steps.toLocaleString()} steps
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

