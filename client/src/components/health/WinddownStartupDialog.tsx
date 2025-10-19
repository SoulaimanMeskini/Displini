import { useState, useEffect } from "react";
import { UniversalDialog } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Moon, Sun } from "lucide-react";

interface Subtask {
  id: string;
  title: string;
  order: number;
}

interface WinddownSettings {
  enabled: boolean;
  startTime: string; // When to start winding down
  endTime: string; // When you get into bed
  layInBedTime?: string; // Optional: When you actually fall asleep (for people who need time in bed)
  subtasks: Subtask[];
}

interface StartupSettings {
  enabled: boolean;
  bedExitTime: string; // When they get out of bed
  readyStartTime: string; // When they start getting ready
  fullyReadyTime: string; // When they are fully ready
  subtasks: Subtask[];
}

interface WinddownStartupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WinddownStartupDialog({ open, onOpenChange }: WinddownStartupDialogProps) {
  // Saved settings (what's currently in localStorage)
  const [savedWinddownSettings, setSavedWinddownSettings] = useState<WinddownSettings>(() => {
    const saved = localStorage.getItem('winddownSettings');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      startTime: "21:00",
      endTime: "22:00",
      subtasks: []
    };
  });

  const [savedStartupSettings, setSavedStartupSettings] = useState<StartupSettings>(() => {
    const saved = localStorage.getItem('startupSettings');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      bedExitTime: "06:30",
      readyStartTime: "06:45",
      fullyReadyTime: "07:00",
      subtasks: []
    };
  });

  // Current editing settings (what user is currently editing)
  const [winddownSettings, setWinddownSettings] = useState<WinddownSettings>(savedWinddownSettings);
  const [startupSettings, setStartupSettings] = useState<StartupSettings>(savedStartupSettings);

  const [newWinddownSubtask, setNewWinddownSubtask] = useState("");
  const [newStartupSubtask, setNewStartupSubtask] = useState("");
  
  // Track if there are unsaved changes
  const [hasWinddownChanges, setHasWinddownChanges] = useState(false);
  const [hasStartupChanges, setHasStartupChanges] = useState(false);

  // Reset editing state when opening dialog
  useEffect(() => {
    if (open) {
      setWinddownSettings(savedWinddownSettings);
      setStartupSettings(savedStartupSettings);
      setHasWinddownChanges(false);
      setHasStartupChanges(false);
    }
  }, [open, savedWinddownSettings, savedStartupSettings]);

  // Check for winddown changes
  useEffect(() => {
    const hasChanges = JSON.stringify(winddownSettings) !== JSON.stringify(savedWinddownSettings);
    setHasWinddownChanges(hasChanges);
  }, [winddownSettings, savedWinddownSettings]);

  // Check for startup changes
  useEffect(() => {
    const hasChanges = JSON.stringify(startupSettings) !== JSON.stringify(savedStartupSettings);
    setHasStartupChanges(hasChanges);
  }, [startupSettings, savedStartupSettings]);

  const handleUpdateWinddown = () => {
    console.log('Updating winddown settings:', winddownSettings);
    localStorage.setItem('winddownSettings', JSON.stringify(winddownSettings));
    setSavedWinddownSettings(winddownSettings);
    updateTodosWithWinddown(winddownSettings);
    setHasWinddownChanges(false);
  };

  const handleUpdateStartup = () => {
    console.log('Updating startup settings:', startupSettings);
    localStorage.setItem('startupSettings', JSON.stringify(startupSettings));
    setSavedStartupSettings(startupSettings);
    updateTodosWithStartup(startupSettings);
    setHasStartupChanges(false);
  };

  const updateTodosWithWinddown = (settings: WinddownSettings) => {
    console.log('updateTodosWithWinddown called, enabled:', settings.enabled);
    if (!settings.enabled) return;

    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    
    // Store completion status of existing winddown tasks before removing
    const winddownCompletionStatus: Record<string, { completed: boolean, completedAt?: string }> = {};
    todos.forEach((t: any) => {
      if (t.source === 'winddown') {
        winddownCompletionStatus[t.id] = { 
          completed: t.completed,
          completedAt: t.completedAt 
        };
      }
    });
    
    // Remove existing winddown tasks
    const filteredTodos = todos.filter((t: any) => t.source !== 'winddown');
    console.log('Creating winddown tasks with', settings.subtasks.length, 'subtasks');
    
    // Create winddown tasks for next 30 days
    for (let i = 0; i < 30; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + i);
      
      // Calculate duration and create timeline notes
      const startMinutes = parseInt(settings.startTime.split(':')[0]) * 60 + parseInt(settings.startTime.split(':')[1]);
      const endMinutes = parseInt(settings.endTime.split(':')[0]) * 60 + parseInt(settings.endTime.split(':')[1]);
      const layInBedMinutes = settings.layInBedTime 
        ? parseInt(settings.layInBedTime.split(':')[0]) * 60 + parseInt(settings.layInBedTime.split(':')[1])
        : null;
      
      const durationText = settings.layInBedTime 
        ? `${settings.startTime} → ${settings.endTime} → ${settings.layInBedTime}`
        : `${settings.startTime} → ${settings.endTime}`;
      
      // Main winddown task - always show
      const taskId = `winddown-main-${targetDate.toISOString().split('T')[0]}`;
      const winddownTask = {
        id: taskId,
        title: 'Winddown Time',
        emoji: '🌙',
        completed: winddownCompletionStatus[taskId]?.completed || false,
        completedAt: winddownCompletionStatus[taskId]?.completedAt,
        dueDate: targetDate.toISOString(),
        time: settings.startTime,
        endTime: settings.layInBedTime || settings.endTime,
        source: 'winddown',
        isContainer: true,
        notes: durationText
      };
      
      filteredTodos.push(winddownTask);
      
      // Add subtasks
      settings.subtasks.forEach((subtask, index) => {
        const subtaskId = `winddown-subtask-${targetDate.toISOString().split('T')[0]}-${subtask.id}`;
        filteredTodos.push({
          id: subtaskId,
          title: subtask.title,
          emoji: '⭐',
          completed: winddownCompletionStatus[subtaskId]?.completed || false,
          completedAt: winddownCompletionStatus[subtaskId]?.completedAt,
          dueDate: targetDate.toISOString(),
          time: settings.startTime,
          source: 'winddown',
          parentId: `winddown-main-${targetDate.toISOString().split('T')[0]}`,
          order: index
        });
      });
    }
    
    console.log('Winddown todos created:', filteredTodos.filter((t: any) => t.source === 'winddown').length);
    localStorage.setItem('todos', JSON.stringify(filteredTodos));
    window.dispatchEvent(new Event('todosUpdated'));
  };

  const updateTodosWithStartup = (settings: StartupSettings) => {
    console.log('updateTodosWithStartup called, enabled:', settings.enabled);
    if (!settings.enabled) {
      // Remove startup tasks if disabled
      const todos = JSON.parse(localStorage.getItem('todos') || '[]');
      const filteredTodos = todos.filter((t: any) => t.source !== 'startup');
      localStorage.setItem('todos', JSON.stringify(filteredTodos));
      window.dispatchEvent(new Event('todosUpdated'));
      console.log('Startup disabled, removed startup tasks');
      return;
    }

    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    
    // Store completion status of existing startup tasks before removing
    const startupCompletionStatus: Record<string, { completed: boolean, completedAt?: string }> = {};
    todos.forEach((t: any) => {
      if (t.source === 'startup') {
        startupCompletionStatus[t.id] = { 
          completed: t.completed,
          completedAt: t.completedAt 
        };
      }
    });
    
    // Remove existing startup tasks
    const filteredTodos = todos.filter((t: any) => t.source !== 'startup');
    console.log('Creating startup tasks with', settings.subtasks.length, 'subtasks');
    
    // Create startup tasks for next 30 days
    for (let i = 0; i < 30; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + i);
      
      // Calculate duration and create notes with timeline
      const bedExitMinutes = parseInt(settings.bedExitTime.split(':')[0]) * 60 + parseInt(settings.bedExitTime.split(':')[1]);
      const readyStartMinutes = parseInt(settings.readyStartTime.split(':')[0]) * 60 + parseInt(settings.readyStartTime.split(':')[1]);
      const fullyReadyMinutes = parseInt(settings.fullyReadyTime.split(':')[0]) * 60 + parseInt(settings.fullyReadyTime.split(':')[1]);
      const totalDurationMinutes = fullyReadyMinutes - bedExitMinutes;
      const hours = Math.floor(totalDurationMinutes / 60);
      const minutes = totalDurationMinutes % 60;
      const durationText = `${settings.bedExitTime} → ${settings.readyStartTime} → ${settings.fullyReadyTime}`;
      
      // Main startup task - always show even if no subtasks
      const startupTaskId = `startup-main-${targetDate.toISOString().split('T')[0]}`;
      const startupTask = {
        id: startupTaskId,
        title: 'Morning Startup',
        emoji: '🌅',
        completed: startupCompletionStatus[startupTaskId]?.completed || false,
        completedAt: startupCompletionStatus[startupTaskId]?.completedAt,
        dueDate: targetDate.toISOString(),
        time: settings.bedExitTime,
        endTime: settings.fullyReadyTime,
        source: 'startup',
        isContainer: true,
        notes: durationText
      };
      
      filteredTodos.push(startupTask);
      
      // Add subtasks
      settings.subtasks.forEach((subtask, index) => {
        const subtaskId = `startup-subtask-${targetDate.toISOString().split('T')[0]}-${subtask.id}`;
        filteredTodos.push({
          id: subtaskId,
          title: subtask.title,
          emoji: '⭐',
          completed: startupCompletionStatus[subtaskId]?.completed || false,
          completedAt: startupCompletionStatus[subtaskId]?.completedAt,
          dueDate: targetDate.toISOString(),
          time: settings.bedExitTime,
          source: 'startup',
          parentId: `startup-main-${targetDate.toISOString().split('T')[0]}`,
          order: index
        });
      });
    }
    
    console.log('Startup todos created:', filteredTodos.filter((t: any) => t.source === 'startup').length);
    localStorage.setItem('todos', JSON.stringify(filteredTodos));
    window.dispatchEvent(new Event('todosUpdated'));
  };

  const addWinddownSubtask = () => {
    if (!newWinddownSubtask.trim()) return;
    
    const newSubtask: Subtask = {
      id: Date.now().toString(),
      title: newWinddownSubtask,
      order: winddownSettings.subtasks.length
    };
    
    setWinddownSettings(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, newSubtask]
    }));
    setNewWinddownSubtask("");
  };

  const addStartupSubtask = () => {
    if (!newStartupSubtask.trim()) return;
    
    const newSubtask: Subtask = {
      id: Date.now().toString(),
      title: newStartupSubtask,
      order: startupSettings.subtasks.length
    };
    
    setStartupSettings(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, newSubtask]
    }));
    setNewStartupSubtask("");
  };

  const removeWinddownSubtask = (id: string) => {
    setWinddownSettings(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(s => s.id !== id)
    }));
  };

  const removeStartupSubtask = (id: string) => {
    setStartupSettings(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(s => s.id !== id)
    }));
  };

  return (
    <UniversalDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Winddown & Startup Routines"
      hideDefaultFooter
      scrollable
    >
      <Tabs defaultValue="winddown" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="winddown">
              <Moon className="w-4 h-4 mr-2" />
              Winddown
            </TabsTrigger>
            <TabsTrigger value="startup">
              <Sun className="w-4 h-4 mr-2" />
              Startup
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="winddown" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="winddown-enabled">Enable Winddown Routine</Label>
              <Switch
                id="winddown-enabled"
                checked={winddownSettings.enabled}
                onCheckedChange={(enabled) => setWinddownSettings(prev => ({ ...prev, enabled }))}
              />
            </div>
            
            {winddownSettings.enabled && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="winddown-start">Start Time</Label>
                    <Input
                      id="winddown-start"
                      type="time"
                      value={winddownSettings.startTime}
                      onChange={(e) => setWinddownSettings(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Start preparing</p>
                  </div>
                  <div>
                    <Label htmlFor="winddown-end">Get in Bed</Label>
                    <Input
                      id="winddown-end"
                      type="time"
                      value={winddownSettings.endTime}
                      onChange={(e) => setWinddownSettings(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Into bed</p>
                  </div>
                  <div>
                    <Label htmlFor="lay-in-bed">Fall Asleep (Optional)</Label>
                    <Input
                      id="lay-in-bed"
                      type="time"
                      value={winddownSettings.layInBedTime || ''}
                      onChange={(e) => setWinddownSettings(prev => ({ ...prev, layInBedTime: e.target.value }))}
                      placeholder="Optional"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Actual sleep time</p>
                  </div>
                </div>
                
                <div>
                  <Label>Winddown Subtasks</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="e.g., Brush teeth, Read book..."
                      value={newWinddownSubtask}
                      onChange={(e) => setNewWinddownSubtask(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addWinddownSubtask()}
                    />
                    <Button onClick={addWinddownSubtask} size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    {winddownSettings.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <span className="text-sm">{subtask.title}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeWinddownSubtask(subtask.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {hasWinddownChanges && (
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleUpdateWinddown} className="w-full sm:w-auto">
                      Update Winddown Settings
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="startup" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="startup-enabled">Enable Startup Routine</Label>
              <Switch
                id="startup-enabled"
                checked={startupSettings.enabled}
                onCheckedChange={(enabled) => setStartupSettings(prev => ({ ...prev, enabled }))}
              />
            </div>
            
            {startupSettings.enabled && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bed-exit">Get Out of Bed</Label>
                    <Input
                      id="bed-exit"
                      type="time"
                      value={startupSettings.bedExitTime}
                      onChange={(e) => setStartupSettings(prev => ({ ...prev, bedExitTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ready-start">Start Getting Ready</Label>
                    <Input
                      id="ready-start"
                      type="time"
                      value={startupSettings.readyStartTime}
                      onChange={(e) => setStartupSettings(prev => ({ ...prev, readyStartTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fully-ready">Fully Ready</Label>
                    <Input
                      id="fully-ready"
                      type="time"
                      value={startupSettings.fullyReadyTime}
                      onChange={(e) => setStartupSettings(prev => ({ ...prev, fullyReadyTime: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Startup Subtasks</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="e.g., Stretch, Make bed, Shower..."
                      value={newStartupSubtask}
                      onChange={(e) => setNewStartupSubtask(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addStartupSubtask()}
                    />
                    <Button onClick={addStartupSubtask} size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    {startupSettings.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <span className="text-sm">{subtask.title}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStartupSubtask(subtask.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {hasStartupChanges && (
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleUpdateStartup} className="w-full sm:w-auto">
                      Update Startup Settings
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
    </UniversalDialog>
  );
}

