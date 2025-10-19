import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import UniversalContainer from "@/components/UniversalContainer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UniversalDialog } from "@/components/shared";
import { Switch } from "@/components/ui/switch";
import { Plus, Droplet, Settings, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GlucoseReading {
  id: string;
  value: number;
  unit: 'mg/dL' | 'mmol/L';
  timestamp: string;
  mealContext: 'fasting' | 'before-meal' | 'after-meal' | 'bedtime' | 'other';
  notes?: string;
}

interface GlucoseSettings {
  unit: 'mg/dL' | 'mmol/L';
  targetMin: number;
  targetMax: number;
  remindersEnabled: boolean;
  reminderTimes: string[];
  addToTodo: boolean;
}

export default function BloodGlucoseTracker() {
  const [readings, setReadings] = useState<GlucoseReading[]>(() => {
    const saved = localStorage.getItem('glucose_readings');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<GlucoseSettings>(() => {
    const saved = localStorage.getItem('glucose_settings');
    return saved ? JSON.parse(saved) : {
      unit: 'mg/dL',
      targetMin: 70,
      targetMax: 140,
      remindersEnabled: false,
      reminderTimes: ['08:00', '12:00', '18:00'],
      addToTodo: false
    };
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [newMealContext, setNewMealContext] = useState<'fasting' | 'before-meal' | 'after-meal' | 'bedtime' | 'other'>('fasting');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    localStorage.setItem('glucose_readings', JSON.stringify(readings));
  }, [readings]);

  useEffect(() => {
    localStorage.setItem('glucose_settings', JSON.stringify(settings));
    
    // Add/update glucose check reminders in To Do
    if (settings.remindersEnabled && settings.addToTodo) {
      syncRemindersToTodo();
    }
  }, [settings]);

  const syncRemindersToTodo = () => {
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    const today = new Date();
    
    // Remove old glucose reminder tasks for today
    const filteredTodos = todos.filter((t: any) => 
      t.source !== 'glucose' || 
      (t.dueDate && new Date(t.dueDate).toDateString() !== today.toDateString())
    );
    
    // Add new glucose reminder tasks for today
    settings.reminderTimes.forEach(time => {
      const newTask = {
        id: `glucose-${time}-${today.toISOString().split('T')[0]}`,
        title: 'Check blood glucose',
        completed: false,
        source: 'glucose' as const,
        dueDate: today.toISOString(),
        time: time,
        emoji: '🩸',
      };
      filteredTodos.push(newTask);
    });
    
    localStorage.setItem('todos', JSON.stringify(filteredTodos));
    window.dispatchEvent(new Event('todosUpdated'));
  };

  const handleAddReading = () => {
    if (!newValue) return;

    const reading: GlucoseReading = {
      id: Date.now().toString(),
      value: parseFloat(newValue),
      unit: settings.unit,
      timestamp: new Date().toISOString(),
      mealContext: newMealContext,
      notes: newNotes || undefined
    };

    setReadings([reading, ...readings]);
    setNewValue('');
    setNewNotes('');
    setNewMealContext('fasting');
    setIsAddOpen(false);
  };

  const deleteReading = (id: string) => {
    setReadings(readings.filter(r => r.id !== id));
  };

  const getStatusColor = (value: number) => {
    if (value < settings.targetMin) return 'text-yellow-600';
    if (value > settings.targetMax) return 'text-red-600';
    return 'text-green-600';
  };

  const getStatusLabel = (value: number) => {
    if (value < settings.targetMin) return 'Low';
    if (value > settings.targetMax) return 'High';
    return 'Normal';
  };

  const todayReadings = readings.filter(r => {
    const readingDate = new Date(r.timestamp).toDateString();
    const today = new Date().toDateString();
    return readingDate === today;
  });

  const averageToday = todayReadings.length > 0
    ? todayReadings.reduce((sum, r) => sum + r.value, 0) / todayReadings.length
    : 0;

  const isEmpty = readings.length === 0;

  return (
    <>
      <UniversalDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Log Glucose Reading"
        onSave={handleAddReading}
        onCancel={() => setIsAddOpen(false)}
        saveLabel="Log Reading"
      >
        <div>
          <Label>Glucose Level ({settings.unit})</Label>
          <Input
            type="number"
            placeholder="100"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
        </div>
        <div>
          <Label>Meal Context</Label>
          <Select value={newMealContext} onValueChange={(v: any) => setNewMealContext(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fasting">Fasting</SelectItem>
              <SelectItem value="before-meal">Before Meal</SelectItem>
              <SelectItem value="after-meal">After Meal</SelectItem>
              <SelectItem value="bedtime">Bedtime</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Notes (Optional)</Label>
          <Input
            placeholder="Feeling tired..."
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
          />
        </div>
      </UniversalDialog>

      <UniversalDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        title="Glucose Settings"
        onSave={() => setIsSettingsOpen(false)}
        saveLabel="Save Settings"
        hideDefaultFooter={false}
      >
        <div>
          <Label>Unit</Label>
          <Select
            value={settings.unit}
            onValueChange={(v: 'mg/dL' | 'mmol/L') => setSettings({...settings, unit: v})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mg/dL">mg/dL</SelectItem>
              <SelectItem value="mmol/L">mmol/L</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Target Min</Label>
            <Input
              type="number"
              value={settings.targetMin}
              onChange={(e) => setSettings({...settings, targetMin: parseFloat(e.target.value)})}
            />
          </div>
          <div>
            <Label>Target Max</Label>
            <Input
              type="number"
              value={settings.targetMax}
              onChange={(e) => setSettings({...settings, targetMax: parseFloat(e.target.value)})}
            />
          </div>
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
              <Label>Add to To Do</Label>
              <Switch
                checked={settings.addToTodo}
                onCheckedChange={(checked) => setSettings({...settings, addToTodo: checked})}
              />
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
                      size="icon"
                      onClick={() => {
                        const newTimes = settings.reminderTimes.filter((_, i) => i !== index);
                        setSettings({...settings, reminderTimes: newTimes});
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
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
      
      <UniversalContainer
        isEmpty={isEmpty}
        onAdd={() => setIsAddOpen(true)}
        onSettings={() => setIsSettingsOpen(true)}
        emptyMessage="No glucose readings yet"
      >
        {todayReadings.length > 0 && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Today's Average</p>
            <p className={`text-2xl font-bold ${getStatusColor(averageToday)}`}>
              {averageToday.toFixed(1)} {settings.unit}
            </p>
            <p className="text-xs text-muted-foreground">{todayReadings.length} readings</p>
          </div>
        )}

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {readings.slice(0, 10).map((reading) => (
            <div
              key={reading.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg hover-elevate"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${getStatusColor(reading.value)}`}>
                    {reading.value} {reading.unit}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-background">
                    {getStatusLabel(reading.value)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(reading.timestamp).toLocaleString()} • {reading.mealContext.replace('-', ' ')}
                </p>
                {reading.notes && (
                  <p className="text-xs text-muted-foreground italic mt-1">{reading.notes}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteReading(reading.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </UniversalContainer>
    </>
  );
}

