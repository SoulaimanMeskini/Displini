import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { SEO } from "@/app/components/shared/SEO";
import { Bell, Plus, Clock, AlertCircle, Settings, X, Droplets, Pill, Moon, Heart, Dumbbell, Briefcase, Filter, Calendar, CheckSquare, CheckCircle2, History, Calendar as CalendarIcon, BarChart3, Menu, Sun, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Input } from "@/app/components/ui/input";
import AppHeader from "@/app/shared/AppHeader";
import { PageHeader, FeaturesSidebar, FeatureDialogs } from "@/app/components/shared";
import { useOptimizedLocalStorage } from "@/hooks/useLocalStorage";
import { useDarkMode } from "@/hooks/useDarkMode";

// Lazy load heavy dialog
const MonthlyStatsModal = lazy(() => import("@/app/components/shared/MonthlyStatsModal"));

interface Reminder {
  id: string;
  title: string;
  time: string;
  date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'water' | 'medication' | 'sleep' | 'menstrual' | 'workout' | 'work' | 'general';
  scheduled: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
  calendarId?: string;
  completed: boolean;
  completedAt?: string;
}

export default function Reminders() {
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showMenuDialog, setShowMenuDialog] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [activeRemindersTab, setActiveRemindersTab] = useState<'unscheduled' | 'scheduled' | 'completed'>('unscheduled');
  const [reminderSettings, setReminderSettings] = useState({
    notifications: true,
    sound: true,
    vibration: true,
    morningReminders: true,
    eveningReminders: false,
    weekendReminders: true
  });
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    calendarId: 'default'
  });
  // Use optimized localStorage with filtering
  const [reminders, setReminders] = useOptimizedLocalStorage<Reminder[]>('reminders', [], {
    deserialize: (value) => {
      const allReminders = JSON.parse(value);
      // Filter out system-generated reminders (water, medication, journal, sleep)
      return allReminders.filter((r: Reminder) => 
        r.category !== 'water' && 
        r.category !== 'medication' && 
        r.category !== 'sleep' &&
        !r.title.includes('💧') &&
        !r.title.includes('Drink Water') &&
        !r.title.includes('Journal')
      );
    },
    serialize: (value) => JSON.stringify(value),
  });

  // Load reminders and setup event listener
  useEffect(() => {
    const handleOpenAddReminder = () => {
      setShowScheduleDialog(true);
    };

    window.addEventListener('openAddReminder', handleOpenAddReminder);
    
    return () => {
      window.removeEventListener('openAddReminder', handleOpenAddReminder);
    };
  }, []);

  const toggleScheduled = useCallback((id: string) => {
    setReminders(prevReminders => prevReminders.map(reminder => 
      reminder.id === id 
        ? { ...reminder, scheduled: !reminder.scheduled }
        : reminder
    ));
  }, [setReminders]);

  const openScheduleDialog = useCallback((reminder: Reminder) => {
    setSelectedReminder(reminder);
    setScheduleData({
      date: reminder.scheduledDate || new Date().toISOString().split('T')[0],
      time: reminder.scheduledTime || reminder.time,
      calendarId: reminder.calendarId || 'default'
    });
    setShowScheduleDialog(true);
  }, []);

  const scheduleReminder = useCallback(() => {
    if (selectedReminder && scheduleData.date && scheduleData.time) {
      setReminders(reminders.map(r => 
        r.id === selectedReminder.id 
          ? { 
              ...r, 
              scheduled: true, 
              scheduledDate: scheduleData.date,
              scheduledTime: scheduleData.time,
              calendarId: scheduleData.calendarId
            } 
          : r
      ));
      setShowScheduleDialog(false);
      setSelectedReminder(null);
    }
  }, [selectedReminder, scheduleData, reminders, setReminders]);

  const markAsDone = useCallback((id: string) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id 
        ? { 
            ...reminder, 
            completed: true, 
            completedAt: new Date().toISOString() 
          } 
        : reminder
    ));
  }, [setReminders]);

  const unmarkAsDone = useCallback((id: string) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id 
        ? { 
            ...reminder, 
            completed: false, 
            completedAt: undefined 
          } 
        : reminder
    ));
  }, [setReminders]);

  // Memoize filtered reminders
  const filteredReminders = useMemo(() => 
    reminders.filter(reminder => 
      priorityFilter === 'all' || reminder.priority === priorityFilter
    ), [reminders, priorityFilter]
  );

  const unscheduledReminders = useMemo(() => 
    filteredReminders.filter(reminder => !reminder.scheduled && !reminder.completed),
    [filteredReminders]
  );
  
  const scheduledReminders = useMemo(() => 
    filteredReminders.filter(reminder => reminder.scheduled && !reminder.completed),
    [filteredReminders]
  );
  
  const completedReminders = useMemo(() => 
    filteredReminders.filter(reminder => reminder.completed),
    [filteredReminders]
  );

  // Handle feature clicks from sidebar - memoized
  const handleCloseMenu = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setShowMenuDialog(false);
      setIsClosing(false);
    }, 200);
  }, []);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  const getPriorityIcon = useCallback((priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-4 h-4" />;
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  }, []);

  const getCategoryIcon = useCallback((category: string) => {
    switch (category) {
      case 'water': return <Droplets className="w-4 h-4" />;
      case 'medication': return <Pill className="w-4 h-4" />;
      case 'sleep': return <Moon className="w-4 h-4" />;
      case 'menstrual': return <Heart className="w-4 h-4" />;
      case 'workout': return <Dumbbell className="w-4 h-4" />;
      case 'work': return <Briefcase className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  }, []);

  const getCategoryColor = useCallback((category: string) => {
    switch (category) {
      case 'water': return 'text-cyan-600 bg-cyan-100';
      case 'medication': return 'text-blue-600 bg-blue-100';
      case 'sleep': return 'text-purple-600 bg-purple-100';
      case 'menstrual': return 'text-pink-600 bg-pink-100';
      case 'workout': return 'text-orange-600 bg-orange-100';
      case 'work': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const getCategoryName = useCallback((category: string) => {
    switch (category) {
      case 'water': return 'Water Intake';
      case 'medication': return 'Medication';
      case 'sleep': return 'Sleep Schedule';
      case 'menstrual': return 'Menstrual Cycle';
      case 'workout': return 'Workout Routine';
      case 'work': return 'Work & School';
      default: return 'General';
    }
  }, []);

  // Group reminders by category - memoized
  const groupedReminders = useMemo(() => reminders.reduce((acc, reminder) => {
    if (!acc[reminder.category]) {
      acc[reminder.category] = [];
    }
    acc[reminder.category].push(reminder);
    return acc;
  }, {} as Record<string, Reminder[]>), [reminders]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <SEO
        title="Reminders"
        description="Manage your reminders and notifications"
        noindex={true}
      />
      {/* Sticky Header */}
      <PageHeader>
        {/* Header Row - Tabs and Menu */}
        <div className="flex items-center gap-2">
            <Button
              variant={activeRemindersTab === 'unscheduled' ? 'default' : 'outline'}
              size="sm"
              className="rounded-full flex-1"
              onClick={() => setActiveRemindersTab('unscheduled')}
            >
              To Schedule ({unscheduledReminders.length})
            </Button>
            <Button
              variant={activeRemindersTab === 'scheduled' ? 'default' : 'outline'}
              size="sm"
              className="rounded-full flex-1"
              onClick={() => setActiveRemindersTab('scheduled')}
            >
              Scheduled ({scheduledReminders.length})
            </Button>
            <Button
              variant={activeRemindersTab === 'completed' ? 'default' : 'outline'}
              size="sm"
              className="rounded-full flex-1"
              onClick={() => setActiveRemindersTab('completed')}
            >
              Done ({completedReminders.length})
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleDarkMode}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowMenuDialog(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
      </PageHeader>
      
      <div className="px-4 py-4" style={{ paddingTop: '160px' }}>
        {/* Tab Content */}
        <div className="w-full">
          {activeRemindersTab === 'unscheduled' && (
            <div className="space-y-3 mt-6">
            {unscheduledReminders.length > 0 ? (
              unscheduledReminders.map((reminder) => (
                <Card key={reminder.id} className="p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryColor(reminder.category)}`}>
                        {getCategoryIcon(reminder.category)}
                      </div>
                      <div>
                        <h3 className="font-medium">{reminder.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{reminder.time}</span>
                          </span>
                          <span>{reminder.date}</span>
                          <Badge className={`text-xs ${getPriorityColor(reminder.priority)}`}>
                            {getPriorityIcon(reminder.priority)}
                            <span className="ml-1 capitalize">{reminder.priority}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openScheduleDialog(reminder)}
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        Schedule
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsDone(reminder.id)}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Done
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No reminders to schedule</h3>
                <p className="text-muted-foreground mb-4">All your reminders are scheduled or completed</p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reminder
                </Button>
              </div>
            )}
            </div>
          )}

          {activeRemindersTab === 'scheduled' && (
            <div className="space-y-3 mt-6">
            {scheduledReminders.length > 0 ? (
              scheduledReminders.map((reminder) => (
                <Card key={reminder.id} className="p-4 bg-green-50 border-green-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckSquare className="w-4 h-4 text-white" />
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryColor(reminder.category)}`}>
                        {getCategoryIcon(reminder.category)}
                      </div>
                      <div>
                        <h3 className="font-medium">{reminder.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <CalendarIcon className="w-3 h-3" />
                            <span>{reminder.scheduledDate} at {reminder.scheduledTime}</span>
                          </span>
                          <Badge className={`text-xs ${getPriorityColor(reminder.priority)}`}>
                            {getPriorityIcon(reminder.priority)}
                            <span className="ml-1 capitalize">{reminder.priority}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsDone(reminder.id)}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Mark Done
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openScheduleDialog(reminder)}
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        Reschedule
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No scheduled reminders</h3>
                <p className="text-muted-foreground mb-4">Schedule reminders to see them here</p>
              </div>
            )}
            </div>
          )}

          {activeRemindersTab === 'completed' && (
            <div className="space-y-3 mt-6">
            {completedReminders.length > 0 ? (
              completedReminders.map((reminder) => (
                <Card key={reminder.id} className="p-4 bg-gray-50 border-gray-200 opacity-75 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryColor(reminder.category)}`}>
                        {getCategoryIcon(reminder.category)}
                      </div>
                      <div>
                        <h3 className="font-medium line-through text-muted-foreground">{reminder.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Completed on {reminder.completedAt ? new Date(reminder.completedAt).toLocaleDateString() : 'Unknown'}</span>
                          </span>
                          <Badge className={`text-xs ${getPriorityColor(reminder.priority)}`}>
                            {getPriorityIcon(reminder.priority)}
                            <span className="ml-1 capitalize">{reminder.priority}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unmarkAsDone(reminder.id)}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Undo
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No completed reminders</h3>
                <p className="text-muted-foreground mb-4">Completed reminders will appear here</p>
              </div>
            )}
            </div>
          )}
        </div>
      </div>

      {/* Features Sidebar */}
      <FeaturesSidebar
        isOpen={showMenuDialog}
        onClose={handleCloseMenu}
        isClosing={isClosing}
        onStatsClick={() => { setShowStats(true); handleCloseMenu(); }}
        onSettingsClick={() => { setShowSettings(true); handleCloseMenu(); }}
      />

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Reminder Settings</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="text-sm font-medium">
                  Push Notifications
                </Label>
                <Switch
                  id="notifications"
                  checked={reminderSettings.notifications}
                  onCheckedChange={(checked) => 
                    setReminderSettings(prev => ({ ...prev, notifications: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="sound" className="text-sm font-medium">
                  Sound Alerts
                </Label>
                <Switch
                  id="sound"
                  checked={reminderSettings.sound}
                  onCheckedChange={(checked) => 
                    setReminderSettings(prev => ({ ...prev, sound: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="vibration" className="text-sm font-medium">
                  Vibration
                </Label>
                <Switch
                  id="vibration"
                  checked={reminderSettings.vibration}
                  onCheckedChange={(checked) => 
                    setReminderSettings(prev => ({ ...prev, vibration: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="morning" className="text-sm font-medium">
                  Morning Reminders
                </Label>
                <Switch
                  id="morning"
                  checked={reminderSettings.morningReminders}
                  onCheckedChange={(checked) => 
                    setReminderSettings(prev => ({ ...prev, morningReminders: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="evening" className="text-sm font-medium">
                  Evening Reminders
                </Label>
                <Switch
                  id="evening"
                  checked={reminderSettings.eveningReminders}
                  onCheckedChange={(checked) => 
                    setReminderSettings(prev => ({ ...prev, eveningReminders: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="weekend" className="text-sm font-medium">
                  Weekend Reminders
                </Label>
                <Switch
                  id="weekend"
                  checked={reminderSettings.weekendReminders}
                  onCheckedChange={(checked) => 
                    setReminderSettings(prev => ({ ...prev, weekendReminders: checked }))
                  }
                />
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                onClick={() => setShowSettings(false)}
                className="w-full"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Schedule Reminder</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedReminder && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium">{selectedReminder.title}</h4>
                <p className="text-sm text-muted-foreground">{getCategoryName(selectedReminder.category)} • {selectedReminder.priority} priority</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="schedule-date">Date</Label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={scheduleData.date}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="schedule-time">Time</Label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={scheduleData.time}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="calendar">Calendar</Label>
                <Select value={scheduleData.calendarId} onValueChange={(value) => setScheduleData(prev => ({ ...prev, calendarId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select calendar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Calendar</SelectItem>
                    <SelectItem value="work">Work Calendar</SelectItem>
                    <SelectItem value="personal">Personal Calendar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={scheduleReminder} className="flex-1">
                Schedule Reminder
              </Button>
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Lazy loaded stats dialog */}
      <Suspense fallback={<div />}>
        {showStats && <MonthlyStatsModal open={showStats} onOpenChange={setShowStats} />}
      </Suspense>
      <FeatureDialogs />
    </div>
  );
}
