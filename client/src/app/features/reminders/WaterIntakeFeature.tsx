import { useState, useEffect } from "react";
import { Droplets, Plus, Edit, Trash2, Target, CheckCircle, Calendar, Clock, Bell, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { colors } from "@/lib/designSystem";
import { handleError, handleSuccess } from "@/lib/errorHandling";

interface WaterGoal {
  id: string;
  name: string;
  targetAmount: number;
  unit: 'ml' | 'oz' | 'cups';
  reminderInterval: number;
  isActive: boolean;
  currentIntake: number;
}

interface WaterIntakeFeatureProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaterIntakeFeature({ isOpen, onClose }: WaterIntakeFeatureProps) {
  const [todayIntake, setTodayIntake] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTimes, setReminderTimes] = useState<string[]>([]);
  const [showAddReminderTime, setShowAddReminderTime] = useState(false);
  const [newReminderTime, setNewReminderTime] = useState('09:00');
  const [unit, setUnit] = useState<'ml' | 'oz'>('ml');
  const [reminderMode, setReminderMode] = useState<'custom' | 'interval'>('custom');
  const [reminderInterval, setReminderInterval] = useState(2); // Default: every 2 hours
  const [hasConfiguredGoal, setHasConfiguredGoal] = useState(false); // Track if user has actually set a goal

  // Load water settings and today's intake
  useEffect(() => {
    if (!isOpen) return;
    
    const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
    const savedGoal = waterSettings.dailyGoal || 2000;
    setDailyGoal(savedGoal);
    setRemindersEnabled(waterSettings.remindersEnabled || false);
    setReminderTimes(waterSettings.reminderTimes || []);
    setUnit(waterSettings.unit || 'ml');
    setReminderMode(waterSettings.reminderMode || 'custom');
    setReminderInterval(waterSettings.reminderInterval || 2);
    
    // Check if user has actually configured a goal (not just the default)
    setHasConfiguredGoal(!!waterSettings.dailyGoal);

    // Calculate today's intake
    const waterEntries = JSON.parse(localStorage.getItem('water_entries') || '[]');
    const today = new Date().toDateString();
    const todayEntries = waterEntries.filter((entry: any) => 
      new Date(entry.timestamp).toDateString() === today
    );
    const totalIntake = todayEntries.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0);
    setTodayIntake(totalIntake);
    
    // Auto-create water reminders if enabled and times are set
    if (waterSettings.remindersEnabled && waterSettings.reminderTimes?.length > 0) {
      // Check if reminders already exist for today
      const existingTasks = JSON.parse(localStorage.getItem('todos') || '[]');
      const todayStr = new Date().toISOString().split('T')[0];
      const hasWaterReminders = existingTasks.some((t: any) => 
        t.dueDate === todayStr && t.source === 'water'
      );
      
      if (!hasWaterReminders) {
        setTimeout(() => createWaterReminders(), 100);
      }
    }
  }, [isOpen]);

  // Auto-update reminders when intake changes
  useEffect(() => {
    if (remindersEnabled && reminderTimes.length > 0) {
      updateWaterReminderNotes();
    }
  }, [todayIntake]);

  // Create water reminders based on set times or intervals
  const createWaterReminders = () => {
    const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
    const dailyGoal = waterSettings.dailyGoal || 2000;
    const mode = waterSettings.reminderMode || 'custom';
    const times = waterSettings.reminderTimes || [];
    const interval = waterSettings.reminderInterval || 2;
    
    // Generate times based on mode
    let reminderTimes: string[] = [];
    if (mode === 'custom') {
      reminderTimes = times;
      if (reminderTimes.length === 0) {
        alert('Please add at least one reminder time first.');
        return 0;
      }
    } else {
      // Generate interval-based times
      const now = new Date();
      const startHour = parseInt(waterSettings.reminderStartTime?.split(':')[0] || '8');
      const endHour = parseInt(waterSettings.reminderEndTime?.split(':')[0] || '22');
      for (let hour = startHour; hour <= endHour; hour += interval) {
        reminderTimes.push(`${String(hour).padStart(2, '0')}:00`);
      }
    }
    
    // Get current date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Calculate today's intake
    const waterEntries = JSON.parse(localStorage.getItem('water_entries') || '[]');
    const todayEntries = waterEntries.filter((entry: any) => 
      new Date(entry.timestamp).toDateString() === today.toDateString()
    );
    const currentIntake = todayEntries.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0);
    
    const tasks: any[] = [];
    const existingTasks = JSON.parse(localStorage.getItem('todos') || '[]');
    
    // Remove existing water reminders for today
    const filteredTasks = existingTasks.filter((t: any) => 
      !(t.dueDate === todayStr && t.source === 'water')
    );
    
    // Create reminders for each set time
    reminderTimes.forEach((time: string, index: number) => {
      const progressPercent = Math.round((currentIntake / dailyGoal) * 100);
      tasks.push({
        id: `water_reminder_${todayStr}_${time.replace(':', '')}`,
        title: '💧 Drink Water',
        notes: `Today's intake: ${currentIntake}ml / ${dailyGoal}ml (${progressPercent}%)\nTap to log your water intake.`,
        time: time,
        dueDate: todayStr,
        completed: false,
        allDay: false,
        source: 'water',
        emoji: '💧',
        color: '#3B82F6',
        waterReminder: true
      });
    });
    
    // Save to localStorage
    localStorage.setItem('todos', JSON.stringify([...filteredTasks, ...tasks]));
    
    // Dispatch event to update timeline
    window.dispatchEvent(new Event('todosUpdated'));
    
    return tasks.length;
  };


  const handleAddWater = (amount: number) => {
    try {
      const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
      const unit = waterSettings.unit || 'ml';
      
      const newEntry = {
        id: Date.now().toString(),
        amount: amount,
        unit: unit,
        timestamp: new Date().toISOString(),
        source: 'water_intake_feature'
      };

      const waterEntries = JSON.parse(localStorage.getItem('water_entries') || '[]');
      waterEntries.unshift(newEntry);
      localStorage.setItem('water_entries', JSON.stringify(waterEntries));

      // Update today's intake
      setTodayIntake(prev => prev + amount);
      handleSuccess(`Added ${amount}ml of water`);
      
      // Update water reminder notes with new intake
      if (remindersEnabled && reminderTimes.length > 0) {
        updateWaterReminderNotes();
      }
      
      // Dispatch event to update timeline
      window.dispatchEvent(new Event('waterEntryAdded'));
    } catch (error) {
      handleError(error, { title: 'Failed to Add Water' });
    }
  };

  const updateWaterReminderNotes = () => {
    const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
    const dailyGoal = waterSettings.dailyGoal || 2000;
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Calculate current intake
    const waterEntries = JSON.parse(localStorage.getItem('water_entries') || '[]');
    const today = new Date();
    const todayEntries = waterEntries.filter((entry: any) => 
      new Date(entry.timestamp).toDateString() === today.toDateString()
    );
    const currentIntake = todayEntries.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0);
    const progressPercent = Math.round((currentIntake / dailyGoal) * 100);
    
    // Update all water reminder tasks for today
    const existingTasks = JSON.parse(localStorage.getItem('todos') || '[]');
    const updatedTasks = existingTasks.map((t: any) => {
      if (t.dueDate === todayStr && t.source === 'water') {
        return {
          ...t,
          notes: `Today's intake: ${currentIntake}ml / ${dailyGoal}ml (${progressPercent}%)\nTap to log your water intake.`
        };
      }
      return t;
    });
    
    localStorage.setItem('todos', JSON.stringify(updatedTasks));
    window.dispatchEvent(new Event('todosUpdated'));
  };

  const handleUpdateDailyGoal = (newGoal: number) => {
    setDailyGoal(newGoal);
    const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
    waterSettings.dailyGoal = newGoal;
    localStorage.setItem('water_settings', JSON.stringify(waterSettings));
    
    // Recreate reminders with new goal
    if (waterSettings.reminderInterval) {
      createWaterReminders();
    }
  };

  const toggleWaterReminders = (enabled: boolean) => {
    const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
    waterSettings.remindersEnabled = enabled;
    localStorage.setItem('water_settings', JSON.stringify(waterSettings));
    setRemindersEnabled(enabled);
    
    if (enabled) {
      const created = createWaterReminders();
      if (created > 0) {
        alert(`✅ Created ${created} water reminders for today! Check your timeline.`);
      }
    } else {
      // Remove existing reminders
      const existingTasks = JSON.parse(localStorage.getItem('todos') || '[]');
      const today = new Date().toISOString().split('T')[0];
      const filteredTasks = existingTasks.filter((t: any) => 
        !(t.dueDate === today && t.source === 'water')
      );
      localStorage.setItem('todos', JSON.stringify(filteredTasks));
      window.dispatchEvent(new Event('todosUpdated'));
      alert('Water reminders disabled and removed from timeline.');
    }
  };

  const addReminderTime = () => {
    if (newReminderTime && !reminderTimes.includes(newReminderTime)) {
      const updatedTimes = [...reminderTimes, newReminderTime].sort();
      setReminderTimes(updatedTimes);
      
      const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
      waterSettings.reminderTimes = updatedTimes;
      localStorage.setItem('water_settings', JSON.stringify(waterSettings));
      
      setShowAddReminderTime(false);
      setNewReminderTime('09:00');
      
      // Recreate reminders if enabled
      if (remindersEnabled) {
        createWaterReminders();
      }
    }
  };

  const removeReminderTime = (time: string) => {
    const updatedTimes = reminderTimes.filter(t => t !== time);
    setReminderTimes(updatedTimes);
    
    const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
    waterSettings.reminderTimes = updatedTimes;
    localStorage.setItem('water_settings', JSON.stringify(waterSettings));
    
    // Recreate reminders if enabled
    if (remindersEnabled) {
      createWaterReminders();
    }
  };


  // Check if water intake is set up
  // Check if water intake is actually configured
  const isSetup = hasConfiguredGoal;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5" />
            Water Intake Tracking
          </DialogTitle>
          <DialogDescription>
            Track your daily water intake and set reminders to stay hydrated
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Show setup prompt if not configured */}
          {!isSetup && (
            <Card className="mb-6 border-2" style={{ 
              background: `linear-gradient(to right, ${colors.features.water}15, ${colors.features.water}25)`,
              borderColor: `${colors.features.water}60`
            }}>
              <CardContent className="p-6">
                <div className="text-center">
                  <Droplets className="w-16 h-16 mx-auto mb-4" style={{ color: colors.features.water }} />
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Set Up Water Intake Tracking</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Track your daily water intake and get reminders to stay hydrated
                  </p>
                  <p className="text-sm mb-6" style={{ color: colors.features.water }}>
                    Set your daily goal and reminder times below to get started
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          

          
          {/* Setup Section - Only show if configured */}
          {!isSetup ? (
            <Card className="mb-6">
              <CardContent className="p-6">
                {/* Initial Setup - Only show goal setting */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="daily-goal" className="text-base font-semibold mb-2 block">Set Your Daily Water Goal</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="daily-goal"
                        type="number"
                        value={dailyGoal}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 2000;
                          setDailyGoal(value);
                        }}
                        className="w-32 h-10"
                        placeholder="2000"
                      />
                      <Select 
                        value={unit} 
                        onValueChange={(value: 'ml' | 'oz') => {
                          setUnit(value);
                          const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
                          waterSettings.unit = value;
                          localStorage.setItem('water_settings', JSON.stringify(waterSettings));
                        }}
                      >
                        <SelectTrigger className="w-24 h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="oz">oz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Set a daily goal to start tracking your water intake</p>
                  </div>
                  
                  {/* Save Button */}
                  <div className="pt-4">
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        // Mark as configured and save to localStorage
                        setHasConfiguredGoal(true);
                        const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
                        waterSettings.dailyGoal = dailyGoal;
                        waterSettings.unit = unit;
                        localStorage.setItem('water_settings', JSON.stringify(waterSettings));
                        
                        // If reminders are enabled and times are set, create water reminders
                        if (remindersEnabled && reminderTimes.length > 0) {
                          setTimeout(() => createWaterReminders(), 100);
                        }
                      }}
                    >
                      Save & Set Up
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardContent className="p-6">
                {/* Full Setup - Show when configured */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="daily-goal" className="text-sm">Daily Goal:</Label>
                    <Input
                      id="daily-goal"
                      type="number"
                      value={dailyGoal}
                      onChange={(e) => handleUpdateDailyGoal(parseInt(e.target.value) || 2000)}
                      className="w-20 h-8"
                    />
                    <Select 
                      value={unit} 
                      onValueChange={(value: 'ml' | 'oz') => {
                        setUnit(value);
                        const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
                        waterSettings.unit = value;
                        localStorage.setItem('water_settings', JSON.stringify(waterSettings));
                      }}
                    >
                      <SelectTrigger className="w-16 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="oz">oz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                
                {/* Reminder Times */}
                <div className="p-3 rounded-lg border-2 space-y-3" style={{ 
                  backgroundColor: `${colors.features.water}10`,
                  borderColor: `${colors.features.water}30`
                }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5" style={{ color: colors.features.water }} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Daily Reminders</p>
                        <p className="text-xs text-gray-700">Set times to get water reminders</p>
                      </div>
                    </div>
                    {reminderTimes.length > 0 && (
                      <Button
                        size="sm"
                        onClick={() => toggleWaterReminders(!remindersEnabled)}
                        variant={remindersEnabled ? "destructive" : "default"}
                      >
                        {remindersEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    )}
                  </div>
                  
                  {/* Reminder Mode Selector */}
                  <div className="flex gap-2 mb-3">
                    <Button
                      size="sm"
                      variant={reminderMode === 'custom' ? 'default' : 'outline'}
                      onClick={() => {
                        setReminderMode('custom');
                        const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
                        waterSettings.reminderMode = 'custom';
                        localStorage.setItem('water_settings', JSON.stringify(waterSettings));
                      }}
                    >
                      Custom Times
                    </Button>
                    <Button
                      size="sm"
                      variant={reminderMode === 'interval' ? 'default' : 'outline'}
                      onClick={() => {
                        setReminderMode('interval');
                        const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
                        waterSettings.reminderMode = 'interval';
                        localStorage.setItem('water_settings', JSON.stringify(waterSettings));
                      }}
                    >
                      Every X Hours
                    </Button>
                  </div>
                  
                  {/* Reminder Times List */}
                  {reminderTimes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {reminderTimes.map((time) => (
                        <div key={time} className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-blue-300">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span className="text-sm text-blue-900">{time}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-red-100"
                            onClick={() => removeReminderTime(time)}
                          >
                            <X className="w-3 h-3 text-red-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Custom Time Input */}
                  {reminderMode === 'custom' && (
                    <>
                      {showAddReminderTime ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={newReminderTime}
                            onChange={(e) => setNewReminderTime(e.target.value)}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={addReminderTime}>
                            Add
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setShowAddReminderTime(false)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAddReminderTime(true)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Reminder Time
                        </Button>
                      )}
                    </>
                  )}
                  
                  {/* Interval Selector */}
                  {reminderMode === 'interval' && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="reminder-interval" className="text-sm">Remind every:</Label>
                              <Select 
                                value={reminderInterval.toString()} 
                                onValueChange={(value) => {
                                  const interval = parseInt(value);
                                  setReminderInterval(interval);
                                  const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
                                  waterSettings.reminderInterval = interval;
                                  localStorage.setItem('water_settings', JSON.stringify(waterSettings));
                                  if (remindersEnabled) {
                                    createWaterReminders();
                                  }
                                }}
                              >
                                <SelectTrigger className="w-24 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 hour</SelectItem>
                                  <SelectItem value="2">2 hours</SelectItem>
                                  <SelectItem value="3">3 hours</SelectItem>
                                  <SelectItem value="4">4 hours</SelectItem>
                                  <SelectItem value="6">6 hours</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="text-xs text-muted-foreground p-2 bg-gray-50 rounded">
                              Reminders will be set from 8:00 AM to 10:00 PM
                            </div>
                          </div>
                  )}
                </div>
                        
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}