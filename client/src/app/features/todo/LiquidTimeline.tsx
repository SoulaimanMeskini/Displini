import React, { useState, useEffect, useMemo, useRef } from "react";
import { Task } from "@/app/types/types";
import { getCurrentTime, formatTimeString } from "@/lib/timeUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Edit2, X, Plus, ChevronDown, ChevronUp, Clock, Repeat, Repeat1, Repeat2, Calendar, GripVertical, Image as ImageIcon, Sparkles, ExternalLink } from "lucide-react";
import { Textarea } from "@/app/components/ui/textarea";
import { EmojiPicker } from "@/app/components/shared/EmojiPicker";
import { ImageViewerDialog } from "@/app/components/shared";
import { getAffirmationSettings, getDailyAffirmationText } from "@/app/features/todo/DailyAffirmations";
import { useLocation } from "wouter";
import Work from "@/app/features/todo/Work";

interface Props {
  tasks: Task[];
  date?: Date; // The date being viewed
  onToggleTask: (id: string) => void;
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
  onDeleteTask?: (id: string, deleteFuture?: boolean) => void;
  onWaterReminderClick?: (time: string) => void;
  onAddTaskClick?: (prefillTime: string) => void;
  getSourceBadge?: (source: Task["source"]) => { label: string; className: string } | null;
}

interface TimelineItem {
  time: string;
  tasks: Task[];
  waterReminder?: boolean;
  medicationReminder?: boolean;
  stepReminder?: boolean;
  meditationReminder?: boolean;
  glucoseReminder?: boolean;
  isWakeUp?: boolean;
  isBedTime?: boolean;
}

export default function LiquidTimeline({ tasks, date, onToggleTask, onUpdateTask, onDeleteTask, onWaterReminderClick, onAddTaskClick, getSourceBadge }: Props) {
  const [, setLocation] = useLocation();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [combinedReminderOpen, setCombinedReminderOpen] = useState(false);
  const [selectedReminderTime, setSelectedReminderTime] = useState<string>("");
  const [waterAmount, setWaterAmount] = useState("250");
  const [medicationTaken, setMedicationTaken] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Helper to get source page for navigation
  const getSourcePage = (source: Task["source"]) => {
    switch (source) {
      case 'water':
      case 'medication':
      case 'sleep':
        return '/health';
      case 'food':
        return '/food';
      case 'workout':
      case 'steps':
        return '/sport';
      case 'work':
        return 'work-dialog'; // Special case: opens dialog
      case 'school':
        return 'student-dialog'; // Special case: opens dialog
      default:
        return null;
    }
  };
  
  // Handle shortcut click for external source
  const handleSourceShortcut = (source: Task["source"]) => {
    const destination = getSourcePage(source);
    if (!destination) return;
    
    if (destination === 'work-dialog') {
      setWorkDialogOpen(true);
    } else if (destination === 'student-dialog') {
      // We need to dispatch an event to open the student dialog from the parent component
      window.dispatchEvent(new CustomEvent('openStudentDialog'));
    } else {
      setLocation(destination);
    }
  };
  
  // Edit task state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editDate, setEditDate] = useState("");
  
  // Drag state
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [dragStartY, setDragStartY] = useState<number>(0);
  const [dragCurrentY, setDragCurrentY] = useState<number>(0);
  const [dragPreviewTime, setDragPreviewTime] = useState<string>("");
  const timelineRef = useRef<HTMLDivElement>(null);
  const currentTimeMarkerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasAutoScrolledRef = useRef(false);
  
  // Track if this is a true page load vs tab switch
  const isInitialPageLoad = useRef(true);
  
  // Detect if this is a true page load (refresh/app open) vs tab switch
  useEffect(() => {
    // Check if we're in a fresh page load by looking at performance API
    const isPageLoad = performance.navigation?.type === 1 || // TYPE_RELOAD
                      performance.navigation?.type === 0 || // TYPE_NAVIGATE (fresh load)
                      !sessionStorage.getItem('hasVisitedToDo');
    
    if (isPageLoad) {
      // This is a fresh page load or refresh
      isInitialPageLoad.current = true;
      sessionStorage.setItem('hasVisitedToDo', 'true');
    } else {
      // This is a tab switch
      isInitialPageLoad.current = false;
    }
  }, []);
  const [editNotes, setEditNotes] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editRepeat, setEditRepeat] = useState<"none" | "daily" | "weekly" | "monthly" | "yearly" | "weekdays" | "custom">("none");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  
  // Track which task containers are expanded
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  
  // Medication dialog state
  const [medicationDialogOpen, setMedicationDialogOpen] = useState(false);
  const [selectedMedicationTime, setSelectedMedicationTime] = useState("");
  
  // Step counter dialog state
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [selectedStepTime, setSelectedStepTime] = useState("");
  const [stepCount, setStepCount] = useState("");
  
  // Meditation dialog state
  const [meditationDialogOpen, setMeditationDialogOpen] = useState(false);
  const [selectedMeditationTime, setSelectedMeditationTime] = useState("");
  
  // Glucose check dialog state
  const [glucoseDialogOpen, setGlucoseDialogOpen] = useState(false);
  const [selectedGlucoseTime, setSelectedGlucoseTime] = useState("");
  const [glucoseValue, setGlucoseValue] = useState("");
  
  // Work dialog state
  const [workDialogOpen, setWorkDialogOpen] = useState(false);
  
  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  
  // Image viewer state
  const [imageViewerTask, setImageViewerTask] = useState<Task | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  
  // Show task tags setting
  const [showTaskTags, setShowTaskTags] = useState(() => {
    return localStorage.getItem("showTaskTags") !== "false";
  });
  
  // Track if liquid fill animation has played
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Track recently completed tasks for fill animation
  const [recentlyCompleted, setRecentlyCompleted] = useState<Set<string>>(new Set());
  
  // Affirmation settings
  const [affirmationSettings, setAffirmationSettings] = useState(getAffirmationSettings());

  // Trigger animation on mount, but only for current day and only on initial page load
  useEffect(() => {
    // Only animate if viewing current day AND it's an initial page load (not tab switch)
    const viewingDate = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const isViewingToday = viewingDate === today;
    
    // Only animate on initial page load, not on tab switches
    if (isViewingToday && isInitialPageLoad.current) {
      // Reset animation state
      setHasAnimated(false);
      
      // Small delay to ensure proper rendering
      const timer = setTimeout(() => {
        setHasAnimated(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // For tab switches or non-today dates, set animation state immediately without animation
      setHasAnimated(true);
    }
  }, [date]);

  // Auto-scroll to current time on initial load
  useEffect(() => {
    // Check if auto-scroll is enabled in settings
    const autoScrollEnabled = localStorage.getItem("autoScrollEnabled") !== "false";
    if (!autoScrollEnabled) return;
    
    // Only scroll on initial page load (refresh/app open), not on tab switches
    if (!isInitialPageLoad.current || hasAutoScrolledRef.current) return;
    
    // Only scroll if viewing today
    const viewingDate = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const isViewingToday = viewingDate === today;
    
    if (!isViewingToday) return;
    
    // Scroll to current time immediately on mount/refresh
    const scrollTimer = setTimeout(() => {
      if (timelineRef.current) {
        const timelineElement = timelineRef.current;
        
        // Calculate current time position on timeline
        const currentMinutes = timeToMinutes(currentTimeStr);
        const startMinutes = timeToMinutes('07:00'); // Default start time
        const endMinutes = timeToMinutes('23:00'); // Default end time
        
        // Get sleep schedule for more accurate positioning
        const sleepSchedule = JSON.parse(localStorage.getItem('sleepSchedule') || '{}');
        let wakeTime = '07:00';
        let sleepTime = '23:00';
        
        if (sleepSchedule.daily) {
          wakeTime = sleepSchedule.daily.wakeTime || '07:00';
          sleepTime = sleepSchedule.daily.sleepTime || '23:00';
        } else if (sleepSchedule.wakeTime) {
          wakeTime = sleepSchedule.wakeTime;
          sleepTime = sleepSchedule.bedtime || sleepSchedule.sleepTime || '23:00';
        }
        
        const actualStartMinutes = timeToMinutes(wakeTime);
        const actualEndMinutes = timeToMinutes(sleepTime);
        
        // Calculate position percentage
        let positionPercentage = 0;
        if (currentMinutes < actualStartMinutes) {
          positionPercentage = 0; // Before wake up
        } else if (currentMinutes > actualEndMinutes) {
          positionPercentage = 100; // After sleep
        } else {
          // During active hours
          positionPercentage = ((currentMinutes - actualStartMinutes) / (actualEndMinutes - actualStartMinutes)) * 100;
        }
        
        // Calculate scroll position
        const timelineHeight = timelineElement.offsetHeight;
        const currentTimePosition = (positionPercentage / 100) * timelineHeight;
        const viewportHeight = window.innerHeight;
        
        // Scroll to position the current time in the center of the viewport
        const scrollPosition = currentTimePosition - (viewportHeight / 2) + timelineElement.offsetTop;
        
        // Smooth scroll to current time
        window.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
        
        hasAutoScrolledRef.current = true;
      }
    }, 100); // Short delay to ensure DOM is ready
    
    return () => clearTimeout(scrollTimer);
  }, [date]);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleTimezoneChange = () => setCurrentTime(getCurrentTime());
    window.addEventListener('timezoneChanged', handleTimezoneChange);
    return () => window.removeEventListener('timezoneChanged', handleTimezoneChange);
  }, []);

  useEffect(() => {
    const handleTagSettingChange = () => {
      setShowTaskTags(localStorage.getItem("showTaskTags") !== "false");
    };
    window.addEventListener('taskTagsSettingChanged', handleTagSettingChange);
    return () => window.removeEventListener('taskTagsSettingChanged', handleTagSettingChange);
  }, []);

  useEffect(() => {
    const handleAffirmationSettingChange = () => {
      setAffirmationSettings(getAffirmationSettings());
    };
    window.addEventListener('affirmationSettingsChanged', handleAffirmationSettingChange);
    return () => window.removeEventListener('affirmationSettingsChanged', handleAffirmationSettingChange);
  }, []);

  // Listen for updates to water/medication entries
  useEffect(() => {
    const handleUpdate = () => setRefreshKey(prev => prev + 1);
    window.addEventListener('todosUpdated', handleUpdate);
    window.addEventListener('waterEntryAdded', handleUpdate);
    window.addEventListener('medicationCompleted', handleUpdate);
    window.addEventListener('stepLogged', handleUpdate);
    return () => {
      window.removeEventListener('todosUpdated', handleUpdate);
      window.removeEventListener('waterEntryAdded', handleUpdate);
      window.removeEventListener('medicationCompleted', handleUpdate);
      window.removeEventListener('stepLogged', handleUpdate);
    };
  }, []);

  const timeBasedTasks = tasks.filter(task => task.time && !task.allDay);

  // Get water and medication reminders
  const getWaterReminderTimes = () => {
    const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
    const dailyGoal = waterSettings.dailyGoal;
    
    // Only show if daily goal is set AND reminders are enabled
    if (!dailyGoal || dailyGoal === 0) {
      return [];
    }
    if (!waterSettings.remindersEnabled) {
      return [];
    }
    
    // If custom times are set, use those
    if (waterSettings.reminderTimes && waterSettings.reminderTimes.length > 0) {
      return waterSettings.reminderTimes;
    }
    
    // Otherwise, generate based on interval mode
    const interval = waterSettings.reminderInterval || 2;
    const startTime = waterSettings.reminderStartTime || '08:00';
    const endTime = waterSettings.reminderEndTime || '22:00';
    
    const [startHour] = startTime.split(':').map(Number);
    const [endHour] = endTime.split(':').map(Number);
    
    const reminderTimes: string[] = [];
    for (let hour = startHour; hour <= endHour; hour += interval) {
      reminderTimes.push(`${String(hour).padStart(2, '0')}:00`);
    }
    
    return reminderTimes;
  };

  const getMedicationReminderTimes = () => {
    const medications = JSON.parse(localStorage.getItem('medications') || '[]');
    const times: string[] = [];
    medications.forEach((med: any) => {
      // Skip all-day medications - they should not appear as dots on the timeline
      if (med.allDay) return;
      
      if (med.times && Array.isArray(med.times)) {
        med.times.forEach((time: string) => {
          if (!times.includes(time)) {
            times.push(time);
          }
        });
      }
    });
    return times;
  };

  const getStepReminderTimes = () => {
    const stepSettings = JSON.parse(localStorage.getItem('step_settings') || '{}');
    if (!stepSettings.remindersEnabled || !stepSettings.addToTodo) return [];
    
    // Check if the current viewing date's day is in the selected reminderDays
    const viewingDate = date || new Date();
    const dayName = viewingDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const reminderDays = stepSettings.reminderDays || [];
    
    // Only return times if today's day is in the selected days
    if (reminderDays.includes(dayName)) {
      return stepSettings.reminderTimes || [];
    }
    
    return [];
  };

  const getMeditationReminderTimes = () => {
    const reminders = JSON.parse(localStorage.getItem('breathingReminders') || '[]');
    const times: string[] = [];
    reminders.forEach((reminder: any) => {
      if (reminder.enabled && reminder.time) {
        times.push(reminder.time);
      }
    });
    return times;
  };

  const getGlucoseReminderTimes = () => {
    const glucoseSettings = JSON.parse(localStorage.getItem('glucose_settings') || '{}');
    if (!glucoseSettings.remindersEnabled || !glucoseSettings.addToTodo) return [];
    return glucoseSettings.reminderTimes || [];
  };

  // Build timeline items - refreshKey ensures re-calculation when reminders are completed
  const timelineItems: TimelineItem[] = useMemo(() => {
    const waterReminderTimes = getWaterReminderTimes();
    const medicationReminderTimes = getMedicationReminderTimes();
    const stepReminderTimes = getStepReminderTimes();
    const meditationReminderTimes = getMeditationReminderTimes();
    const glucoseReminderTimes = getGlucoseReminderTimes();
    
    const itemsMap: Record<string, TimelineItem> = {};

    // Add tasks
    timeBasedTasks.forEach(task => {
      const time = task.time!;
      
      // For startup and winddown tasks, use a unique key that includes the task id
      // This prevents them from being grouped together even if they have the same time
      const key = (task.source === 'startup' || task.source === 'winddown') 
        ? `${time}_${task.source}_${task.id}` 
        : time;
      
      if (!itemsMap[key]) {
        itemsMap[key] = { time, tasks: [], isWakeUp: false, isBedTime: false };
      }
      itemsMap[key].tasks.push(task);
      
      if (task.source === 'sleep' && task.sleepAction === 'wake') {
        itemsMap[key].isWakeUp = true;
      }
      if (task.source === 'sleep' && task.sleepAction === 'sleep') {
        itemsMap[key].isBedTime = true;
      }
    });

    // Add water reminders - check both generated times and existing water tasks
    // First add from generated times
    waterReminderTimes.forEach((time: string) => {
      if (!itemsMap[time]) {
        itemsMap[time] = { time, tasks: [] };
      }
      itemsMap[time].waterReminder = true;
    });
    
    // Also check if there are existing water tasks that weren't added yet
    timeBasedTasks.forEach(task => {
      const isWaterReminder = (task as any).waterReminder;
      if (task.source === 'water' && isWaterReminder && task.time) {
        const time = task.time;
        if (!itemsMap[time]) {
          itemsMap[time] = { time, tasks: [] };
        }
        itemsMap[time].waterReminder = true;
      }
    });

    // Add medication reminders
    medicationReminderTimes.forEach(time => {
      if (!itemsMap[time]) {
        itemsMap[time] = { time, tasks: [] };
      }
      itemsMap[time].medicationReminder = true;
    });

    // Add step reminders
    stepReminderTimes.forEach((time: string) => {
      if (!itemsMap[time]) {
        itemsMap[time] = { time, tasks: [] };
      }
      itemsMap[time].stepReminder = true;
    });

    // Add meditation reminders
    meditationReminderTimes.forEach(time => {
      if (!itemsMap[time]) {
        itemsMap[time] = { time, tasks: [] };
      }
      itemsMap[time].meditationReminder = true;
    });

    // Add glucose check reminders
    glucoseReminderTimes.forEach((time: string) => {
      if (!itemsMap[time]) {
        itemsMap[time] = { time, tasks: [] };
      }
      itemsMap[time].glucoseReminder = true;
    });

    // Sort by time
    const sortedItems = Object.values(itemsMap).sort((a, b) => {
      const [aH, aM] = a.time.split(':').map(Number);
      const [bH, bM] = b.time.split(':').map(Number);
      return (aH * 60 + aM) - (bH * 60 + bM);
    });

    return sortedItems;
  }, [timeBasedTasks, refreshKey, date]);

  // Check if we only have one task with no end time (can't create a timeline)
  const hasOnlyOneTaskNoEndTime = timelineItems.length === 1 && timelineItems[0].tasks.length === 1 && !timelineItems[0].tasks[0].endTime && 
    !timelineItems[0].waterReminder && !timelineItems[0].medicationReminder && !timelineItems[0].stepReminder && 
    !timelineItems[0].meditationReminder && !timelineItems[0].glucoseReminder;

  if (timelineItems.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No scheduled tasks for today</p>
        <p className="text-sm mt-2">Add tasks with specific times to see your timeline</p>
        {onAddTaskClick && (
          <Button 
            onClick={() => onAddTaskClick("")} 
            className="mt-4 rounded-full"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>
    );
  }

  // If we only have one task with no end time, show it without timeline
  if (hasOnlyOneTaskNoEndTime) {
    const task = timelineItems[0].tasks[0];
    return (
      <div className="space-y-4">
        {/* Show the task */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleTask(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  task.completed ? "bg-success border-success" : "border-muted-foreground"
                }`}
              >
                {task.completed && "✓"}
              </button>
              <div className="text-2xl">{task.emoji || "📝"}</div>
              <div className="flex-1">
                <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </h3>
                {task.notes && (
                  <p className="text-sm text-muted-foreground mt-1">{task.notes}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{timelineItems[0].time}</span>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Show empty timeline message */}
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No timeline available</p>
          <p className="text-sm mt-2">Add more tasks with specific times to see your timeline</p>
          {onAddTaskClick && (
            <Button 
              onClick={() => onAddTaskClick("")} 
              className="mt-4 rounded-full"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </div>
    );
  }

  const currentTimeStr = formatTimeString(currentTime);
  
  // Find wake up and bed time from timeline items
  const wakeUpItem = timelineItems.find(item => item.isWakeUp);
  const bedTimeItem = timelineItems.find(item => item.isBedTime);
  
  // Use wake up time as start if available, otherwise use first item
  const startTime = wakeUpItem ? wakeUpItem.time : timelineItems[0].time;
  
  // Use bed time as end if available, otherwise use last item
  const endTime = bedTimeItem ? bedTimeItem.time : timelineItems[timelineItems.length - 1].time;

  // Check if viewing today, past, or future date
  const today = new Date().toISOString().split('T')[0];
  
  // Use the passed date prop, or try to find it from tasks
  let viewingDate = today;
  if (date) {
    viewingDate = date.toISOString().split('T')[0];
  } else {
    // Fallback: Find viewing date from any task with a dueDate
    for (const item of timelineItems) {
      for (const task of item.tasks) {
        if (task.dueDate) {
          viewingDate = typeof task.dueDate === 'string' 
            ? task.dueDate.split('T')[0]
            : new Date(task.dueDate).toISOString().split('T')[0];
          break;
        }
      }
      if (viewingDate !== today) break;
    }
  }
  
  const isPastDate = viewingDate < today;
  const isToday = viewingDate === today;
  const isFutureDate = viewingDate > today;

  // Calculate fill percentage
  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const currentMinutes = timeToMinutes(currentTimeStr);
  
  // Calculate fill percentage based on task completion, not just time
  let fillPercentage = 0;
  
  // Get tasks for the viewing date
  const viewingDateStr = viewingDate;
  const dateTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const taskDate = typeof t.dueDate === 'string' ? t.dueDate.split('T')[0] : t.dueDate.toISOString().split('T')[0];
    return taskDate === viewingDateStr;
  });
  
  if (isPastDate) {
    // Past dates: Always 100% filled
    fillPercentage = 100;
  } else if (isFutureDate) {
    // Future dates: Never filled
    fillPercentage = 0;
  } else {
    // Today: Fill based on current time
    fillPercentage = Math.max(0, Math.min(100, 
      ((currentMinutes - startMinutes) / (endMinutes - startMinutes)) * 100
    ));
    
    // If current time is past the end time, fill 100%
    if (currentMinutes >= endMinutes) {
      fillPercentage = 100;
    }
    // If current time is before start time, no fill
    if (currentMinutes <= startMinutes) {
      fillPercentage = 0;
    }
  }

  // Check if task is missed (time has passed but not completed)
  const isTaskMissed = (time: string, tasks: Task[]) => {
    // On past dates, any incomplete task is missed
    if (isPastDate) {
      return tasks.some(task => !task.completed);
    }
    // On future dates, nothing is missed
    if (isFutureDate) {
      return false;
    }
    // On today, check if time has passed
    if (time >= currentTimeStr) return false;
    return tasks.some(task => !task.completed);
  };

  const handleCombinedReminderClick = (time: string) => {
    setSelectedReminderTime(time);
    setWaterAmount("250");
    setMedicationTaken(false);
    setCombinedReminderOpen(true);
  };

  const handleMedicationReminderClick = (time: string) => {
    // Toggle medication status (mark as taken or untaken)
    const medications = JSON.parse(localStorage.getItem('medications') || '[]');
    const viewingDateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    // First check if medication is already taken
    let isAlreadyTaken = false;
    medications.forEach((med: any) => {
      if (med.times?.includes(time)) {
        if (!med.takenDates) med.takenDates = [];
        const takenEntry = `${viewingDateStr}_${time}`;
        if (med.takenDates.includes(takenEntry)) {
          isAlreadyTaken = true;
        }
      }
    });
    
    // Toggle medication status
    medications.forEach((med: any) => {
      if (med.times?.includes(time)) {
        if (!med.takenDates) med.takenDates = [];
        const takenEntry = `${viewingDateStr}_${time}`;
        if (isAlreadyTaken) {
          // Unmark as taken
          med.takenDates = med.takenDates.filter((entry: string) => entry !== takenEntry);
        } else {
          // Mark as taken
          if (!med.takenDates.includes(takenEntry)) {
            med.takenDates.push(takenEntry);
          }
        }
      }
    });
    
    localStorage.setItem('medications', JSON.stringify(medications));
    window.dispatchEvent(new Event('medicationCompleted'));
    window.dispatchEvent(new Event('todosUpdated'));
    
    // Also update the task completion status
    const tasks = JSON.parse(localStorage.getItem('todos') || '[]');
    tasks.forEach((task: any) => {
      if (task.source === 'medication' && task.time === time && task.dueDate === viewingDateStr) {
        task.completed = !isAlreadyTaken;
      }
    });
    localStorage.setItem('todos', JSON.stringify(tasks));
    setRefreshKey(prev => prev + 1);
  };

  const handleStepReminderClick = (time: string) => {
    setSelectedStepTime(time);
    setStepCount("");
    setStepDialogOpen(true);
  };

  const handleMeditationReminderClick = (time: string) => {
    setSelectedMeditationTime(time);
    setMeditationDialogOpen(true);
  };

  const handleGlucoseReminderClick = (time: string) => {
    setSelectedGlucoseTime(time);
    setGlucoseValue("");
    setGlucoseDialogOpen(true);
  };

  const handleStepSubmit = () => {
    if (!stepCount || parseInt(stepCount) <= 0) return;
    
    const viewingDateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    // Add step log entry
    const stepLogs = JSON.parse(localStorage.getItem('step_logs') || '[]');
    const newLog = {
      id: Date.now().toString(),
      steps: parseInt(stepCount),
      date: viewingDateStr,
      timestamp: new Date().toISOString(),
    };
    
    stepLogs.unshift(newLog);
    localStorage.setItem('step_logs', JSON.stringify(stepLogs));
    
    // Dispatch event to update components
    window.dispatchEvent(new Event('stepLogged'));
    window.dispatchEvent(new Event('todosUpdated'));
    
    setStepDialogOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleMedicationSubmit = () => {
    const medications = JSON.parse(localStorage.getItem('medications') || '[]');
    const viewingDateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    medications.forEach((med: any) => {
      if (med.times?.includes(selectedMedicationTime)) {
        if (!med.takenDates) med.takenDates = [];
        const takenEntry = `${viewingDateStr}_${selectedMedicationTime}`;
        if (!med.takenDates.includes(takenEntry)) {
          med.takenDates.push(takenEntry);
        }
      }
    });
    
    localStorage.setItem('medications', JSON.stringify(medications));
    window.dispatchEvent(new Event('medicationCompleted'));
    window.dispatchEvent(new Event('todosUpdated'));
    setMedicationDialogOpen(false);
  };

  const handleMeditationSubmit = () => {
    const viewingDateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    // Add meditation session entry
    const sessions = JSON.parse(localStorage.getItem('breathingSessions') || '[]');
    const newSession = {
      id: Date.now().toString(),
      date: viewingDateStr,
      exerciseId: 'reminder', // Mark as reminder-based
      duration: 5, // Default 5 minutes
      completed: true,
      timestamp: new Date().toISOString(),
      reminderTime: selectedMeditationTime,
    };
    
    sessions.unshift(newSession);
    localStorage.setItem('breathingSessions', JSON.stringify(sessions));
    
    window.dispatchEvent(new Event('meditationCompleted'));
    window.dispatchEvent(new Event('todosUpdated'));
    setMeditationDialogOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleGlucoseSubmit = () => {
    if (!glucoseValue || parseFloat(glucoseValue) <= 0) return;
    
    const viewingDateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const settings = JSON.parse(localStorage.getItem('glucose_settings') || '{}');
    
    // Add glucose reading
    const readings = JSON.parse(localStorage.getItem('glucose_readings') || '[]');
    const newReading = {
      id: Date.now().toString(),
      value: parseFloat(glucoseValue),
      unit: settings.unit || 'mg/dL',
      timestamp: new Date().toISOString(),
      mealContext: 'other',
      reminderTime: selectedGlucoseTime,
      date: viewingDateStr,
    };
    
    readings.unshift(newReading);
    localStorage.setItem('glucose_readings', JSON.stringify(readings));
    
    window.dispatchEvent(new Event('glucoseLogged'));
    window.dispatchEvent(new Event('todosUpdated'));
    setGlucoseDialogOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  const getMedicationsForTime = (time: string) => {
    const medications = JSON.parse(localStorage.getItem('medications') || '[]');
    return medications.filter((med: any) => med.times?.includes(time));
  };

  const getMedicationEmojiForTime = (time: string): string => {
    const meds = getMedicationsForTime(time);
    // If multiple medications at same time, return first one's emoji, else default
    return meds.length > 0 && meds[0].emoji ? meds[0].emoji : '💊';
  };

  const handleCombinedReminderSubmit = () => {
    // Add water entry
    const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
    const unit = waterSettings.unit || 'ml';
    
    const viewingDateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const waterEntries = JSON.parse(localStorage.getItem('water_entries') || '[]');
    const newEntry = {
      id: Date.now().toString(),
      amount: parseInt(waterAmount),
      unit,
      time: selectedReminderTime,
      date: viewingDateStr, // Use viewing date
    };
    
    waterEntries.unshift(newEntry);
    localStorage.setItem('water_entries', JSON.stringify(waterEntries));
    window.dispatchEvent(new Event('waterEntryAdded'));

    // Mark medication as taken if checkbox is checked
    if (medicationTaken) {
      const medications = JSON.parse(localStorage.getItem('medications') || '[]');
      
      medications.forEach((med: any) => {
        if (med.times && med.times.includes(selectedReminderTime)) {
          if (!med.takenDates) med.takenDates = [];
          const takenEntry = `${viewingDateStr}_${selectedReminderTime}`;
          if (!med.takenDates.includes(takenEntry)) {
            med.takenDates.push(takenEntry);
          }
        }
      });
      
      localStorage.setItem('medications', JSON.stringify(medications));
      window.dispatchEvent(new Event('medicationCompleted'));
    }

    window.dispatchEvent(new Event('todosUpdated'));
    setCombinedReminderOpen(false);
  };

  const getWaterUnit = () => {
    const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
    return waterSettings.unit || 'ml';
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditEmoji(task.emoji || "");
    setEditTime(task.time || "");
    setEditEndTime(task.endTime || "");
    setEditNotes(task.notes || "");
    setEditColor(task.color || "");
    setEditRepeat(task.repeat || "none");
    
    // Set date from dueDate
    if (task.dueDate) {
      const dateObj = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      setEditDate(dateObj.toISOString().split('T')[0]);
    } else if (date) {
      // If no dueDate, use the viewing date
      setEditDate(date.toISOString().split('T')[0]);
    } else {
      setEditDate(new Date().toISOString().split('T')[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingTask) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          const currentAttachments = editingTask.attachments || [];
          if (onUpdateTask) {
            onUpdateTask(editingTask.id, {
              attachments: [...currentAttachments, dataUrl]
            });
          }
          // Update local editing state
          setEditingTask({
            ...editingTask,
            attachments: [...currentAttachments, dataUrl]
          });
        };
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = (index: number) => {
    if (!editingTask || !onUpdateTask) return;
    const currentAttachments = editingTask.attachments || [];
    const newAttachments = currentAttachments.filter((_: string, i: number) => i !== index);
    onUpdateTask(editingTask.id, {
      attachments: newAttachments
    });
    // Update local editing state
    setEditingTask({
      ...editingTask,
      attachments: newAttachments
    });
  };

  const handleSaveEdit = () => {
    if (!editingTask || !onUpdateTask) return;
    
    onUpdateTask(editingTask.id, {
      title: editTitle,
      emoji: editEmoji,
      time: editTime,
      endTime: editEndTime || undefined,
      dueDate: editDate ? new Date(editDate) : undefined,
      notes: editNotes,
      color: editColor || undefined,
      repeat: editRepeat !== "none" ? editRepeat : undefined,
    });
    
    setEditingTask(null);
  };

  const handleAddSubtask = () => {
    if (!editingTask || !newSubtaskTitle.trim() || !onUpdateTask) return;
    
    const newSubtask = {
      id: Date.now().toString(),
      text: newSubtaskTitle.trim(),
      completed: false,
    };
    
    const updatedSubtasks = [...(editingTask.subtasks || []), newSubtask];
    onUpdateTask(editingTask.id, { subtasks: updatedSubtasks });
    
    setEditingTask({ ...editingTask, subtasks: updatedSubtasks });
    setNewSubtaskTitle("");
  };

  const handleToggleSubtask = (subtaskId: string) => {
    if (!editingTask || !onUpdateTask) return;
    
    const updatedSubtasks = (editingTask.subtasks || []).map((st: any) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    
    onUpdateTask(editingTask.id, { subtasks: updatedSubtasks });
    setEditingTask({ ...editingTask, subtasks: updatedSubtasks });
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
    setEditingTask(null); // Close edit dialog
  };

  const handleDeleteConfirm = (deleteFuture: boolean) => {
    if (!taskToDelete || !onDeleteTask) return;
    onDeleteTask(taskToDelete.id, deleteFuture);
    setDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };

  const hasFutureInstances = (task: Task): boolean => {
    // If task has a repeat field, it's a recurring task
    if (task.repeat) return true;
    
    // Otherwise check if there are future instances with same title and time
    if (!task.time || !task.title) return false;
    const taskDate = task.dueDate ? (task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate)) : new Date();
    const taskDateStr = taskDate.toISOString().split('T')[0];
    
    return tasks.some(t => 
      t.id !== task.id && 
      t.title === task.title && 
      t.time === task.time &&
      t.dueDate && 
      new Date(t.dueDate).toISOString().split('T')[0] > taskDateStr
    );
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (!editingTask || !onUpdateTask) return;
    
    const updatedSubtasks = (editingTask.subtasks || []).filter((st: any) => st.id !== subtaskId);
    onUpdateTask(editingTask.id, { subtasks: updatedSubtasks });
    setEditingTask({ ...editingTask, subtasks: updatedSubtasks });
  };

  const handleToggleSubtaskInContainer = (taskId: string, subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateTask) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const updatedSubtasks = (task.subtasks || []).map((st: any) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    
    onUpdateTask(taskId, { subtasks: updatedSubtasks });
  };

  const toggleTaskExpanded = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };
  
  // Wrapper to track task completions for fill animation
  const handleTaskToggle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      // Task is being completed, add to recently completed
      setRecentlyCompleted(prev => new Set(prev).add(taskId));
      // Remove from recently completed after animation
      setTimeout(() => {
        setRecentlyCompleted(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
      }, 1000); // Match animation duration
    }
    onToggleTask(taskId);
  };

  // Drag-to-reschedule handlers
  const handleDragStart = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent text selection
    
    // Only allow dragging tasks with time (not all-day tasks)
    if (!task.time || task.allDay) return;
    
    // Don't allow dragging auto-generated tasks
    if (task.source === 'water' || 
        task.source === 'medication' || 
        task.source === 'steps' || 
        task.source === 'sleep' ||
        task.source === 'work' ||
        task.source === 'school' ||
        task.source === 'workout' ||
        task.source === 'food' ||
        task.source === 'winddown' ||
        task.source === 'startup' ||
        task.isContainer) return;
    
    setDraggingTask(task);
    setDragStartY(e.clientY);
    setDragCurrentY(e.clientY);
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!draggingTask || !timelineRef.current) return;
    
    setDragCurrentY(e.clientY);
    
    // Calculate and show preview time
    const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
    const wakeTime = waterSettings.reminderStartTime || '08:00';
    const sleepTime = waterSettings.reminderEndTime || '22:00';
    const startMinutesWake = timeToMinutes(wakeTime);
    const endMinutesSleep = timeToMinutes(sleepTime);
    const timeRangeMinutes = endMinutesSleep - startMinutesWake;
    
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const dragDeltaY = e.clientY - dragStartY;
    const timelineHeight = timelineRect.height;
    
    const minutesDelta = (dragDeltaY / timelineHeight) * timeRangeMinutes;
    const currentTaskMinutes = timeToMinutes(draggingTask.time!);
    let newTimeMinutes = currentTaskMinutes + minutesDelta;
    
    // Snap to nearest 15 minutes for preview
    newTimeMinutes = Math.round(newTimeMinutes / 15) * 15;
    newTimeMinutes = Math.max(startMinutesWake, Math.min(endMinutesSleep, newTimeMinutes));
    
    const newHours = Math.floor(newTimeMinutes / 60);
    const newMinutes = newTimeMinutes % 60;
    const previewTimeStr = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    
    setDragPreviewTime(previewTimeStr);
  };

  const handleDragEnd = () => {
    if (!draggingTask || !timelineRef.current) return;
    
    const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
    const wakeTime = waterSettings.reminderStartTime || '08:00';
    const sleepTime = waterSettings.reminderEndTime || '22:00';
    const startMinutesWake = timeToMinutes(wakeTime);
    const endMinutesSleep = timeToMinutes(sleepTime);
    const timeRangeMinutes = endMinutesSleep - startMinutesWake;
    
    // Calculate the new time based on Y position
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const dragDeltaY = dragCurrentY - dragStartY;
    const timelineHeight = timelineRect.height;
    
    // Calculate how many minutes the drag represents
    const minutesDelta = (dragDeltaY / timelineHeight) * timeRangeMinutes;
    
    // Get current task time in minutes
    const currentTaskMinutes = timeToMinutes(draggingTask.time!);
    
    // Calculate new time in minutes
    let newTimeMinutes = currentTaskMinutes + minutesDelta;
    
    // Snap to the nearest 15 minutes
    newTimeMinutes = Math.round(newTimeMinutes / 15) * 15;
    
    // Constrain within wake/sleep boundaries
    newTimeMinutes = Math.max(startMinutesWake, Math.min(endMinutesSleep, newTimeMinutes));
    
    // Convert back to time string
    const newHours = Math.floor(newTimeMinutes / 60);
    const newMinutes = newTimeMinutes % 60;
    const newTimeStr = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    
    // Only update if time actually changed
    if (newTimeStr !== draggingTask.time && onUpdateTask) {
      // If task has an end time, calculate the new end time by maintaining the duration
      if (draggingTask.endTime) {
        const originalStartMinutes = timeToMinutes(draggingTask.time!);
        const originalEndMinutes = timeToMinutes(draggingTask.endTime);
        const durationMinutes = originalEndMinutes - originalStartMinutes;
        
        // Calculate new end time
        const newEndTimeMinutes = newTimeMinutes + durationMinutes;
        const newEndHours = Math.floor(newEndTimeMinutes / 60);
        const newEndMinutes = newEndTimeMinutes % 60;
        const newEndTimeStr = `${String(newEndHours).padStart(2, '0')}:${String(newEndMinutes).padStart(2, '0')}`;
        
        // Update both time and endTime
        onUpdateTask(draggingTask.id, { time: newTimeStr, endTime: newEndTimeStr });
      } else {
        // Update only the time
        onUpdateTask(draggingTask.id, { time: newTimeStr });
      }
    }
    
    // Reset drag state
    setDraggingTask(null);
    setDragStartY(0);
    setDragCurrentY(0);
    setDragPreviewTime("");
    // Re-enable text selection
    document.body.style.userSelect = '';
  };

  const checkTasksOverlap = (tasks: Task[]): Task[] => {
    // Check all tasks in the current timeline view, not just at this specific time
    const allTimelineTasks = tasks.filter(t => t.time && !t.allDay && t.endTime);
    const overlapping: Task[] = [];
    
    // Check each task against all other tasks
    for (let i = 0; i < allTimelineTasks.length; i++) {
      const task1 = allTimelineTasks[i];
      const start1 = timeToMinutes(task1.time!);
      const end1 = timeToMinutes(task1.endTime!);
      
      for (let j = 0; j < allTimelineTasks.length; j++) {
        if (i === j) continue; // Skip self
        
        const task2 = allTimelineTasks[j];
        const start2 = timeToMinutes(task2.time!);
        const end2 = timeToMinutes(task2.endTime!);
        
        // Check if they overlap: task1 starts before task2 ends AND task1 ends after task2 starts
        if (start1 < end2 && end1 > start2) {
          if (!overlapping.includes(task1)) overlapping.push(task1);
          if (!overlapping.includes(task2)) overlapping.push(task2);
        }
      }
    }
    return overlapping;
  };

  const calculateFreeTime = (currentItem: TimelineItem, nextItem: TimelineItem | null): { hours: number; minutes: number; text: string } | null => {
    // Only calculate between actual tasks (not water/medication/step reminders or sleep)
    if (currentItem.tasks.length === 0) return null; // Skip if current is only a reminder
    if (!nextItem || nextItem.tasks.length === 0) return null; // Skip if next is only a reminder
    
    // Skip if current item is medication, water, steps, or sleep
    if (currentItem.tasks.every(t => t.source === 'medication' || t.source === 'water' || t.source === 'steps' || t.source === 'sleep')) return null;
    // Skip if next item is medication, water, steps, or sleep (using every)
    if (nextItem.tasks.every(t => t.source === 'medication' || t.source === 'water' || t.source === 'steps' || t.source === 'sleep')) return null;
    
    // Skip if current item has winddown (don't show free time after winddown)
    if (currentItem.tasks.some(t => t.source === 'winddown')) return null;
    
    // Skip if next item has winddown or startup (don't show free time before these routines)
    if (nextItem.tasks.some(t => t.source === 'winddown' || t.source === 'startup')) return null;
    
    // Use end time of current task if available, otherwise use start time
    const currentTask = currentItem.tasks.find(t => t.endTime);
    const currentEndTime = currentTask?.endTime || currentItem.time;
    const currentMinutes = timeToMinutes(currentEndTime);
    const nextMinutes = timeToMinutes(nextItem.time);
    const diffMinutes = nextMinutes - currentMinutes;
    
    // Don't show if less than 30 minutes
    if (diffMinutes < 30) return null;
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours === 0 && minutes === 0) return null;
    
    let text = '';
    if (hours === 0) text = `${minutes}m`;
    else if (minutes === 0) text = `${hours}h`;
    else text = `${hours}h ${minutes}m`;
    
    return { hours, minutes, text };
  };

  // Calculate timeline height based on time range (more accurate for positioning)
  const timeRangeMinutes = endMinutes - startMinutes;
  const timelineHeight = Math.max(timeRangeMinutes * 2.5, timelineItems.length * 180); // 2.5px per minute for better spacing

  return (
    <div className="w-full mx-auto pl-2 pr-0 sm:px-2 md:px-4 mb-12">
      <div className="py-8 pb-12 pl-24 sm:pl-28 md:pl-32 pr-1 sm:pr-2 overflow-visible">


        {/* Timeline Container */}
        <div 
          ref={timelineRef}
          className="relative overflow-visible" 
          style={{ height: `${timelineHeight}px` }}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          {/* Liquid Fill Background - Full height timeline */}
          <div 
            className="absolute w-2 bg-muted left-0"
            style={{ 
              top: '0',
              bottom: '0',
              borderRadius: '9999px 9999px 0 0', // Only rounded at top
            }}
          >
            {/* Extended timeline lines to connect with wake/sleep dots */}
            {timelineItems.map((item, index) => {
              if (!item.isBedTime && !item.isWakeUp) return null;
              
              // Check if we need to offset the dot position
              let dotPosition = ((timeToMinutes(item.time) - startMinutes) / (endMinutes - startMinutes)) * 100;
              
              if (item.isBedTime) {
                const winddownTask = timelineItems
                  .flatMap(i => i.tasks)
                  .find(t => t.source === 'winddown' && t.endTime === item.time);
                if (winddownTask) {
                  dotPosition += 2; // Offset downward
                }
              }
              
              if (item.isWakeUp) {
                const startupTask = timelineItems
                  .flatMap(i => i.tasks)
                  .find(t => t.source === 'startup' && t.time === item.time);
                if (startupTask) {
                  dotPosition -= 2; // Offset upward
                }
              }
              
              // Draw an extended line from the original position to the dot position
              const originalPosition = ((timeToMinutes(item.time) - startMinutes) / (endMinutes - startMinutes)) * 100;
              
              return (
                <div
                  key={`timeline-extension-${item.time}`}
                  className="absolute left-0 w-full bg-primary/40"
                  style={{
                    top: `${Math.min(originalPosition, dotPosition)}%`,
                    height: `${Math.abs(dotPosition - originalPosition)}%`,
                    zIndex: 45,
                  }}
                />
              );
            })}
            {/* Liquid Fill - rounded at top and at current time endpoint */}
            <div 
              ref={currentTimeMarkerRef}
              className="absolute top-0 left-0 w-full bg-primary"
              style={{ 
                height: isToday 
                  ? (hasAnimated ? `${fillPercentage}%` : '0%')
                  : isPastDate ? '100%' : '0%',
                borderRadius: fillPercentage < 100 ? '9999px 9999px 9999px 9999px' : '9999px 9999px 0 0',
                animation: isToday && hasAnimated ? `liquidFillUp 2s ease-out forwards` : 'none',
                '--fill-target': `${fillPercentage}%`,
              } as React.CSSProperties}
            />
            
            {/* Candy Cane Stripes for Missed Tasks ONLY (not reminders) */}
            {timelineItems.map((item, index) => {
              // Check each task in this timeline item for missed status
              return item.tasks.map((task, taskIndex) => {
                // Skip reminders and completed tasks
                if (task.source === 'medication' || task.source === 'water' || task.source === 'steps' || task.completed) {
                  return null;
                }
                
                // Check if this specific task is missed
                const checkTaskMissed = () => {
                  // Future dates: nothing is missed
                  if (isFutureDate) return false;
                  
                  // Don't show candy cane for bedtime/wake up/sleep tasks
                  if (item.isBedTime || item.isWakeUp) return false;
                  
                  let timePassed = false;
                  if (isPastDate) {
                    // Past dates: all times have passed
                    timePassed = true;
                  } else {
                    // Today: check if task start time has passed (with at least 5 minute buffer)
                    const taskStartMinutes = timeToMinutes(task.time!);
                    const currentMinutes = timeToMinutes(currentTimeStr);
                    timePassed = taskStartMinutes < (currentMinutes - 5); // 5 minute buffer
                  }
                  
                  return timePassed;
                };
                
                const isTaskMissed = checkTaskMissed();
                
                if (!isTaskMissed) return null;
                
                // Calculate the full duration of this missed task
                const taskStartMinutes = timeToMinutes(task.time!);
                const taskEndMinutes = task.endTime ? timeToMinutes(task.endTime) : taskStartMinutes + 60; // Default 1 hour if no end time
                const totalHeight = endMinutes - startMinutes;
                
                const startPercent = ((taskStartMinutes - startMinutes) / totalHeight) * 100;
                // Cap the end position at sleep time (endMinutes) to prevent candy cane from extending past timeline
                const cappedEndMinutes = Math.min(taskEndMinutes, endMinutes);
                const endPercent = ((cappedEndMinutes - startMinutes) / totalHeight) * 100;
              
              // Check if this specific task was recently completed
              const hasRecentlyCompletedTask = task.completed;
              
              return (
                <div
                  key={`stripe-${task.id}`}
                  className="absolute left-0 w-full overflow-hidden z-5"
                  style={{
                    top: `${startPercent}%`,
                    height: `${endPercent - startPercent}%`,
                    position: 'relative',
                  }}
                >
                  {/* Candy cane stripe background - show only when task is NOT completed */}
                  {!task.completed && (
                    <div
                      key={`candy-${task.id}-${task.completed}`}
                      className="absolute inset-0"
                      style={{
                        background: 'repeating-linear-gradient(45deg, hsl(var(--primary)) 0px, hsl(var(--primary)) 6px, hsl(var(--background)) 6px, hsl(var(--background)) 12px)',
                        opacity: 0.8,
                      }}
                    />
                  )}
                  {/* Fill overlay when task is completed - smooth animation */}
                  {task.completed && (
                    <div
                      key={`fill-${task.id}-${task.completed}`}
                      className="absolute inset-0 bg-primary fill-animation"
                      style={{
                        zIndex: 1,
                      }}
                    />
                  )}
                </div>
              );
            }).filter(Boolean);
            }).flat()}
          </div>

          {/* Current Time Label - only show on today */}
          {isToday && (() => {
            // Check if current time matches any task time
            const hasTaskAtCurrentTime = timelineItems.some(item => item.time === currentTimeStr);
            if (hasTaskAtCurrentTime) return null;
            
            // Determine position based on current time relative to timeline range
            let positionStyle: any = {};
            
            // Calculate the position percentage based on current time
            const currentPosition = ((currentMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
            
            // If current time is before wake up (start time) - show ABOVE timeline
            if (currentMinutes < startMinutes) {
              positionStyle = {
                left: '-7rem',
                top: '-40px', // Above the timeline
              };
            }
            // If current time is after sleep (end time) - show BELOW timeline
            else if (currentMinutes > endMinutes) {
              positionStyle = {
                left: '-7rem',
                bottom: '-40px', // Below the timeline
              };
            }
            // During active hours - show at current position based on time, not fill
            else {
              positionStyle = {
                left: '-7rem',
                top: `${currentPosition}%`,
              };
            }
            
            return (
              <div 
                className="absolute z-50"
                style={positionStyle}
              >
                {/* Current time label */}
                <div 
                  className="text-sm sm:text-base font-mono font-bold text-foreground whitespace-nowrap text-right w-20 sm:w-24"
                  style={{
                    textShadow: '0 0 4px rgba(255, 255, 255, 0.9), 0 0 8px rgba(255, 255, 255, 0.7), 0 0 12px rgba(255, 255, 255, 0.5)',
                    filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))',
                  }}
                >
                  {currentTimeStr}
                </div>
              </div>
            );
          })()}

          {/* Drag Preview Time Indicator */}
          {draggingTask && dragPreviewTime && (() => {
            const previewMinutes = timeToMinutes(dragPreviewTime);
            const previewPosition = ((previewMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
            
            return (
              <div 
                className="absolute z-50"
                style={{
                  left: '-7rem',
                  top: `${previewPosition}%`,
                  transform: 'translateY(-50%)',
                }}
              >
                <div 
                  className="text-sm sm:text-base font-mono font-bold text-foreground whitespace-nowrap text-right w-20 sm:w-24"
                >
                  → {dragPreviewTime}
                </div>
              </div>
            );
          })()}

          {/* Start dot if no wake-up time */}
          {!timelineItems.some(item => item.isWakeUp) && timelineItems.length > 0 && (() => {
            // Check if all tasks at the first time slot are completed
            const firstItem = timelineItems[0];
            const allCompleted = firstItem.tasks.length > 0 && firstItem.tasks.every(t => t.completed);
            
            return (
              <>
                <div
                  className="absolute flex items-center z-40"
                  style={{ 
                    top: '0%',
                    left: '4px',
                    transform: 'translateY(-50%)',
                  }}
                >
                  <button className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 -translate-x-1/2 shadow-sm hover:shadow-md transition-shadow ${
                    allCompleted ? 'bg-primary border-primary shadow-lg' : 'bg-background border-primary'
                  }`} />
                </div>
                <div 
                  className="absolute z-40"
                  style={{ 
                    top: '0%',
                    left: '-7rem',
                    transform: 'translateY(-50%)',
                  }}
                >
                  <div className="text-sm sm:text-base font-mono text-muted-foreground whitespace-nowrap text-right w-20 sm:w-24">
                    {timelineItems[0].time}
                  </div>
                </div>
              </>
            );
          })()}

          {/* Timeline Items (Dots) */}
          {timelineItems.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === timelineItems.length - 1;
            const itemMinutes = timeToMinutes(item.time);
            // Position based on actual time within the day
            const position = ((itemMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
            
            // Calculate task duration and end position if endTime exists
            const taskWithEndTime = item.tasks.find(t => t.endTime);
            let taskDurationHeight = 0;
            let taskDurationPx = 0;
            let endPosition = position;
            const isWinddownTask = taskWithEndTime?.source === 'winddown';
            
            // Calculate actual start position for tasks (especially for winddown/startup)
            let taskStartPosition = position;
            if (taskWithEndTime && (isWinddownTask || taskWithEndTime.source === 'startup')) {
            const taskStartMinutes = taskWithEndTime.time ? timeToMinutes(taskWithEndTime.time) : 0;
            taskStartPosition = ((taskStartMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
            }
            
            if (taskWithEndTime?.endTime) {
              const endTaskMinutes = timeToMinutes(taskWithEndTime.endTime);
              endPosition = ((endTaskMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
              
              taskDurationHeight = endPosition - taskStartPosition;
              
              // Calculate actual pixel height with minimum 1 hour height for consistent spacing
              const oneHourInPx = (60 / (endMinutes - startMinutes)) * timelineHeight;
              taskDurationPx = Math.max((taskDurationHeight / 100) * timelineHeight, oneHourInPx);
            }
            
            // Calculate free time to next actual task (skip reminders)
            let nextTaskItem = null;
            for (let i = index + 1; i < timelineItems.length; i++) {
              if (timelineItems[i].tasks.length > 0) {
                nextTaskItem = timelineItems[i];
                break;
              }
            }
            const freeTimeText = calculateFreeTime(item, nextTaskItem);
            
            const allCompleted = item.tasks.length > 0 && item.tasks.every(t => t.completed);
            const hasIncompleteTasks = item.tasks.some(t => !t.completed);
            
            // Big dots for wake/sleep, regardless of position
            const isBigDot = item.isWakeUp || item.isBedTime;
            
            // Combined emoji dot - but not if it's wake/sleep
            const hasMultipleReminders = !isBigDot && [item.waterReminder, item.medicationReminder, item.stepReminder, item.meditationReminder, item.glucoseReminder].filter(Boolean).length > 1;
            const hasAnyReminder = !isBigDot && (item.waterReminder || item.medicationReminder || item.stepReminder || item.meditationReminder || item.glucoseReminder);
            
            // Size: Big dots (48px) for wake/bed, Medium (40px) for reminders (single or combined), Regular (32px) for tasks
            const dotSize = isBigDot ? 'w-12 h-12' : hasAnyReminder ? 'w-10 h-10' : 'w-8 h-8';
            
            // Check if water reminder is completed - use refreshKey to force re-check
            const isWaterCompleted = (item.waterReminder && refreshKey >= 0) ? (() => {
              const waterEntries = JSON.parse(localStorage.getItem('water_entries') || '[]');
              return waterEntries.some((entry: any) => 
                entry.date === viewingDate && entry.time === item.time
              );
            })() : false;

            // Check if medication reminder is completed - use refreshKey to force re-check
            const isMedicationCompleted = (item.medicationReminder && refreshKey >= 0) ? (() => {
              const medications = JSON.parse(localStorage.getItem('medications') || '[]');
              const takenEntry = `${viewingDate}_${item.time}`;
              return medications.some((med: any) => 
                med.times?.includes(item.time) && med.takenDates?.includes(takenEntry)
              );
            })() : false;

            // Check if step reminder is completed - use refreshKey to force re-check
            const isStepCompleted = (item.stepReminder && refreshKey >= 0) ? (() => {
              const stepLogs = JSON.parse(localStorage.getItem('step_logs') || '[]');
              return stepLogs.some((log: any) => 
                log.date === viewingDate && log.timestamp.includes(item.time.substring(0, 2)) // Check if logged around this hour
              );
            })() : false;

            // Check if meditation reminder is completed - use refreshKey to force re-check
            const isMeditationCompleted = (item.meditationReminder && refreshKey >= 0) ? (() => {
              const sessions = JSON.parse(localStorage.getItem('breathingSessions') || '[]');
              return sessions.some((session: any) => 
                session.date === viewingDate && session.reminderTime === item.time
              );
            })() : false;

            // Check if glucose reminder is completed - use refreshKey to force re-check
            const isGlucoseCompleted = (item.glucoseReminder && refreshKey >= 0) ? (() => {
              const readings = JSON.parse(localStorage.getItem('glucose_readings') || '[]');
              return readings.some((reading: any) => 
                reading.date === viewingDate && reading.reminderTime === item.time
              );
            })() : false;

            const isReminderCompleted = (item.waterReminder && isWaterCompleted) ||
                                       (item.medicationReminder && isMedicationCompleted) ||
                                       (item.stepReminder && isStepCompleted) ||
                                       (item.meditationReminder && isMeditationCompleted) ||
                                       (item.glucoseReminder && isGlucoseCompleted) ||
                                       (hasMultipleReminders && isWaterCompleted && isMedicationCompleted && isStepCompleted && isMeditationCompleted && isGlucoseCompleted);
            
            // Check if this is the first actual task (not just a reminder or sleep)
            const hasActualTask = item.tasks.length > 0 && item.tasks.some(t => 
              t.source !== 'medication' && 
              t.source !== 'water' && 
              t.source !== 'steps' && 
              t.source !== 'sleep'
            );
            
            // Determine where to show affirmation - ONLY ONCE per timeline
            let showAffirmation = false;
            let affirmationNextToWakeup = false;
            
            // Only check on first iteration to avoid duplicates
            if (index === 0) {
              // Check if there are ANY actual tasks in the entire timeline
              const hasAnyActualTasksInTimeline = timelineItems.some(item => 
                item.tasks.some(t => 
                  t.source !== 'medication' && 
                  t.source !== 'water' && 
                  t.source !== 'steps' && 
                  t.source !== 'sleep'
                )
              );
              
              if (hasAnyActualTasksInTimeline) {
                // There are actual tasks - show above first one
                if (hasActualTask) {
                  showAffirmation = true;
                }
              } else {
                // No actual tasks - show next to wake up
                if (item.isWakeUp) {
                  showAffirmation = true;
                  affirmationNextToWakeup = true;
                }
              }
            } else if (!timelineItems.slice(0, index).some(item => 
              item.tasks.some(t => 
                t.source !== 'medication' && 
                t.source !== 'water' && 
                t.source !== 'steps' && 
                t.source !== 'sleep'
              )
            )) {
              // This is the first actual task after wake up and reminders
              if (hasActualTask) {
                showAffirmation = true;
              }
            }
            
            return (
              <React.Fragment key={`timeline-${item.time}-${index}`}>
                {/* Daily Affirmation Banner - shown above first task or next to wake up (only on current day) */}
                {showAffirmation && isToday && affirmationSettings.enabled && affirmationSettings.showOnTimeline && (
                  <div
                    className="absolute z-50"
                    style={{
                      top: `${position}%`,
                      left: '2rem',
                      right: '0',
                      transform: affirmationNextToWakeup 
                        ? 'translateY(-50%)' // Align with wake up dot
                        : 'translateY(calc(-100% - 2rem))', // Above first task
                    }}
                  >
                    <div className={affirmationNextToWakeup ? "" : "mb-4"}>
                      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                          <p className="text-sm leading-relaxed text-foreground font-medium">
                            {getDailyAffirmationText()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Time Label - positioned separately */}
                {(() => {
                  // For tasks with duration, show time label at their start position
                  // Otherwise show at the item's position
                  const taskWithDuration = item.tasks.find(t => t.endTime && t.source !== 'medication' && t.source !== 'water' && t.source !== 'steps' && t.source !== 'sleep');
                  const labelPosition = taskWithDuration ? (() => {
                    const taskStartMinutes = timeToMinutes(taskWithDuration.time!);
                    return ((taskStartMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
                  })() : position;
                  
                  return (
                    <div 
                      className="absolute z-40"
                      style={{ 
                        top: `${labelPosition}%`,
                        left: '-7rem',
                        transform: 'translateY(-50%)',
                      }}
                    >
                      <div className="text-sm sm:text-base font-mono text-muted-foreground whitespace-nowrap text-right w-20 sm:w-24">
                        {item.time}
                      </div>
                    </div>
                  );
                })()}

                {/* Task Duration Bars on Timeline - Show for all tasks with endTime */}
                {/* Regular tasks (excluding startup/winddown) */}
                {item.tasks.filter(t => t.endTime && t.time && t.source !== 'medication' && t.source !== 'water' && t.source !== 'steps' && t.source !== 'sleep' && !t.parentId && t.source !== 'startup' && t.source !== 'winddown').map((task, idx) => {
                  const taskStartMinutes = timeToMinutes(task.time!);
                  const taskEndMinutes = timeToMinutes(task.endTime!);
                  const taskStartPos = ((taskStartMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
                  const taskEndPos = ((taskEndMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
                  
                  // Calculate minimum height equivalent to 1 hour
                  const oneHourHeight = (60 / (endMinutes - startMinutes)) * 100;
                  const taskDurHeight = Math.max(taskEndPos - taskStartPos, oneHourHeight);
                  
                  return (
                    <div key={`duration-${task.id}`}>
                      {/* Duration bar */}
                      <div
                        className="absolute left-0 z-30 bg-primary/30 border-l-2 border-r-2 border-primary/50"
                        style={{
                          top: `${taskStartPos}%`,
                          width: '8px',
                          height: `${taskDurHeight}%`,
                          minHeight: '20px',
                          borderRadius: '4px',
                        }}
                      />
                      
                      {/* Start time label - only if different from item time */}
                      {task.time !== item.time && (
                        <div 
                          className="absolute z-40"
                          style={{ 
                            top: `${taskStartPos}%`,
                            left: '-7rem',
                            transform: 'translateY(-50%)',
                          }}
                        >
                          <div className="text-sm sm:text-base font-mono text-muted-foreground whitespace-nowrap text-right w-20 sm:w-24">
                            {task.time}
                          </div>
                        </div>
                      )}
                      
                      {/* End time label - always show */}
                      <div 
                        className="absolute z-40"
                        style={{ 
                          top: `${taskDurHeight}%`,
                          left: '-7rem',
                          transform: 'translateY(-50%)',
                        }}
                      >
                        <div className="text-sm sm:text-base font-mono text-muted-foreground whitespace-nowrap text-right w-20 sm:w-24">
                          {task.endTime}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Startup and Winddown Duration Bars - Separate rendering */}
                {item.tasks.filter(t => t.endTime && t.time && (t.source === 'startup' || t.source === 'winddown')).map((task, idx) => {
                  const taskStartMinutes = timeToMinutes(task.time!);
                  const taskEndMinutes = timeToMinutes(task.endTime!);
                  const taskStartPos = ((taskStartMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
                  const taskEndPos = ((taskEndMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
                  
                  // Calculate minimum height equivalent to 1 hour
                  const oneHourHeight = (60 / (endMinutes - startMinutes)) * 100;
                  const taskDurHeight = Math.max(taskEndPos - taskStartPos, oneHourHeight);
                  
                  return (
                    <div key={`duration-${task.id}`}>
                      {/* Duration bar */}
                      <div
                        className="absolute left-0 z-30"
                        style={{
                          top: `${taskStartPos}%`,
                          width: '8px',
                          height: `${taskDurHeight}%`,
                          minHeight: '20px',
                          borderRadius: '4px',
                          backgroundColor: task.source === 'winddown' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                          borderLeft: '2px solid',
                          borderRight: '2px solid',
                          borderColor: task.source === 'winddown' ? 'rgba(139, 92, 246, 0.5)' : 'rgba(245, 158, 11, 0.5)',
                        }}
                      />
                      
                      {/* Start time label - always show for startup/winddown */}
                      <div 
                        className="absolute z-40"
                        style={{ 
                          top: `${taskStartPos}%`,
                          left: '-7rem',
                          transform: 'translateY(-50%)',
                        }}
                      >
                        <div className={`text-sm sm:text-base font-mono whitespace-nowrap text-right w-20 sm:w-24 ${
                          task.source === 'winddown' ? 'text-purple-600 font-medium' : 'text-amber-600 font-medium'
                        }`}>
                          {task.time}
                        </div>
                      </div>
                      
                      {/* End time label - always show */}
                      <div 
                        className="absolute z-40"
                        style={{ 
                          top: `${taskDurHeight}%`,
                          left: '-7rem',
                          transform: 'translateY(-50%)',
                        }}
                      >
                        <div className="text-sm sm:text-base font-mono text-muted-foreground whitespace-nowrap text-right w-20 sm:w-24">
                          {task.endTime}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Dot Container - Only show for: wake/sleep, reminders (NOT for tasks without end time) */}
                {/* Don't show dots for winddown/startup tasks - they already have their own container */}
                {(item.isWakeUp || item.isBedTime || hasAnyReminder) && !hasActualTask && (() => {
                  // For bedtime/wakeup, check if there are tasks that end/start at this time
                  let dotPosition = position;
                  if (item.isBedTime) {
                    // Check if there's a winddown task that ends at bedtime
                    const winddownTask = timelineItems
                      .flatMap(i => i.tasks)
                      .find(t => t.source === 'winddown' && t.endTime === item.time);
                    if (winddownTask) {
                      // Position dot significantly after the task (add larger offset)
                      dotPosition = position + 2; // Add 2% to position it clearly below
                    }
                  }
                  if (item.isWakeUp) {
                    // Check if there's a startup task that starts at wake time
                    const startupTask = timelineItems
                      .flatMap(i => i.tasks)
                      .find(t => t.source === 'startup' && t.time === item.time);
                    if (startupTask) {
                      // Position dot significantly before the task (subtract larger offset)
                      dotPosition = position - 2; // Subtract 2% to position it clearly above
                    }
                  }
                  
                  return (
                    <div
                      key={item.time}
                      className="absolute flex items-center"
                      style={{ 
                        top: `${dotPosition}%`,
                        left: '4px', // Center of 8px timeline (w-2 = 0.5rem = 8px, so center = 4px)
                        transform: 'translateY(-50%)', // Only vertical centering
                        zIndex: 50,
                      }}
                    >
                    {/* Dot */}
                    <button
                  onClick={() => {
                    // Check what's actually at this time slot
                    const hasActualTask = item.tasks.length > 0 && 
                                         item.tasks.some(t => t.source !== 'medication' && t.source !== 'water' && t.source !== 'steps');
                    
                    // Handle wake/sleep tasks first
                    if (item.isWakeUp || item.isBedTime) {
                      if (item.tasks && item.tasks.length > 0 && item.tasks[0]) {
                        handleTaskToggle(item.tasks[0].id);
                      }
                      return;
                    }
                    
                    // If there are reminders and NO actual tasks, handle reminders first
                    if (!hasActualTask && hasMultipleReminders) {
                      handleCombinedReminderClick(item.time);
                    } else if (!hasActualTask && item.stepReminder) {
                      handleStepReminderClick(item.time);
                    } else if (!hasActualTask && item.medicationReminder) {
                      handleMedicationReminderClick(item.time);
                    } else if (!hasActualTask && item.meditationReminder) {
                      handleMeditationReminderClick(item.time);
                    } else if (!hasActualTask && item.glucoseReminder) {
                      handleGlucoseReminderClick(item.time);
                    } else if (!hasActualTask && item.waterReminder && onWaterReminderClick) {
                      onWaterReminderClick(item.time);
                    } else if (item.tasks.length > 0) {
                      // Handle actual tasks (regular tasks)
                      handleTaskToggle(item.tasks[0].id);
                    }
                  }}
                  className={`${dotSize} rounded-full border-2 flex items-center justify-center flex-shrink-0 -translate-x-1/2
                    ${allCompleted || isReminderCompleted
                      ? 'bg-primary border-primary shadow-lg' 
                      : hasIncompleteTasks
                      ? 'bg-background border-primary'
                      : hasAnyReminder
                      ? 'bg-background border-primary'
                      : 'bg-background border-border'
                    }
                    ${allCompleted || isReminderCompleted ? 'shadow-primary/50' : ''}
                  `}
                  style={{
                    boxShadow: allCompleted || isReminderCompleted
                      ? '0 0 16px hsl(var(--primary) / 0.5)' 
                      : undefined,
                  }}
                >
                  {/* Show emojis for wake/sleep/reminders, checkmark when completed */}
                  {item.isWakeUp ? (
                    <span className="text-lg">☀️</span>
                  ) : item.isBedTime ? (
                    <span className="text-lg">🌙</span>
                  ) : hasAnyReminder ? (
                    isReminderCompleted ? (
                      <span className="text-lg text-primary-foreground font-bold">✓</span>
                    ) : (
                      <span className={hasMultipleReminders ? "text-base flex items-center gap-0.5" : "text-lg"}>
                        {hasMultipleReminders ? (
                          <>
                            {item.waterReminder && <span className="text-sm">💧</span>}
                            {item.medicationReminder && <span className="text-sm">{getMedicationEmojiForTime(item.time)}</span>}
                            {item.stepReminder && <span className="text-sm">👟</span>}
                            {item.meditationReminder && <span className="text-sm">🧘</span>}
                            {item.glucoseReminder && <span className="text-sm">🩸</span>}
                          </>
                        ) : item.waterReminder ? (
                          <span>💧</span>
                        ) : item.medicationReminder ? (
                          getMedicationEmojiForTime(item.time)
                        ) : item.stepReminder ? (
                          '👟'
                        ) : item.meditationReminder ? (
                          '🧘'
                        ) : item.glucoseReminder ? (
                          '🩸'
                        ) : null}
                      </span>
                    )
                  ) : allCompleted ? (
                    <span className="text-lg text-primary-foreground font-bold">✓</span>
                  ) : null}
                  </button>
                    </div>
                  );
                })()}

                {/* Wake up / Sleep text label with time */}
                {item.isWakeUp && (() => {
                  // Calculate dot position (same logic as in dot rendering)
                  let dotPosition = position;
                  const startupTask = timelineItems
                    .flatMap(i => i.tasks)
                    .find(t => t.source === 'startup' && t.time === item.time);
                  if (startupTask) {
                    dotPosition -= 2;
                  }
                  
                  return (
                    <div 
                      className="absolute z-40"
                      style={{ 
                        top: `${dotPosition}%`,
                        left: '0',
                        transform: 'translate(-50%, -250%)',
                      }}
                    >
                      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Wake up {item.time}
                      </span>
                    </div>
                  );
                })()}
                {item.isBedTime && (() => {
                  // Calculate dot position (same logic as in dot rendering)
                  let dotPosition = position;
                  const winddownTask = timelineItems
                    .flatMap(i => i.tasks)
                    .find(t => t.source === 'winddown' && t.endTime === item.time);
                  if (winddownTask) {
                    dotPosition += 2;
                  }
                  
                  return (
                    <div 
                      className="absolute z-40"
                      style={{ 
                        top: `${dotPosition}%`,
                        left: '0',
                        transform: 'translate(-50%, 150%)',
                      }}
                    >
                      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Go to bed {item.time}
                      </span>
                    </div>
                  );
                })()}

                {/* Task Info Container - Only show for actual tasks, not reminders/sleep */}
                {/* Regular tasks - includes winddown/startup */}
                {item.tasks.length > 0 && 
                 item.tasks.some(t => t.source !== 'medication' && t.source !== 'sleep' && t.source !== 'water' && t.source !== 'steps') && 
                 !item.isWakeUp && 
                 !item.isBedTime && (() => {
                   // Filter out system tasks and child tasks, but include winddown/startup
                   const actualTasks = item.tasks.filter(t => {
                     return t.source !== 'medication' && 
                            t.source !== 'sleep' && 
                            t.source !== 'water' && 
                            t.source !== 'steps' &&
                            !t.parentId;
                   });
                   
                   // Check if any of these tasks overlap with ANY other task in the timeline
                   const allTimelineTasks = tasks.filter(t => t.time && !t.allDay && t.endTime && 
                     t.source !== 'medication' && 
                     t.source !== 'sleep' && 
                     t.source !== 'water' && 
                     t.source !== 'steps' &&
                     !t.parentId);
                   
                   // Find overlapping group for the current task
                   let overlappingGroup: Task[] = [];
                   if (actualTasks.length > 0 && actualTasks[0].endTime && actualTasks[0].time) {
                     const currentTask = actualTasks[0];
                     const currentStart = timeToMinutes(currentTask.time as string);
                     const currentEnd = timeToMinutes(currentTask.endTime as string);
                     
                     // Find all tasks that overlap with this task
                     // But don't group startup and winddown tasks together even if they overlap
                     overlappingGroup = allTimelineTasks.filter(t => {
                       const tStart = timeToMinutes(t.time!);
                       const tEnd = timeToMinutes(t.endTime!);
                       const overlaps = (currentStart < tEnd && currentEnd > tStart);
                       
                       // Don't group startup with winddown
                       if (currentTask.source === 'startup' && t.source === 'winddown') return false;
                       if (currentTask.source === 'winddown' && t.source === 'startup') return false;
                       
                       return overlaps;
                     });
                   }
                   
                   const hasOverlap = overlappingGroup.length > 1;
                   const sameTimeNoEnd = actualTasks.length > 1 && actualTasks.every(t => !t.endTime);
                   
                   // Don't show overlap warning for startup/winddown tasks themselves
                   const isStartupWinddown = actualTasks.some(t => t.source === 'winddown' || t.source === 'startup');
                   
                   // For winddown/startup tasks, use the actual task start time for positioning instead of the item time
                   // This ensures they render at their actual start time (e.g., 22:40 for winddown, 06:00 for startup) not at the sleep/wake time
                   let actualPosition = position;
                   const isStartupOrWinddown = actualTasks.some(t => t.source === 'winddown' || t.source === 'startup');
                   if ((isWinddownTask || isStartupOrWinddown) && actualTasks[0]?.time) {
                     const taskStartMinutes = timeToMinutes(actualTasks[0].time);
                     actualPosition = ((taskStartMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
                   }
                   
                   // Skip rendering if this task is not the earliest in its overlapping group
                   if (hasOverlap && overlappingGroup.length > 1) {
                     const sortedGroup = [...overlappingGroup].sort((a, b) => 
                       timeToMinutes(a.time!) - timeToMinutes(b.time!)
                     );
                     // Only render at the earliest task's time
                     // But if any task in the group is winddown or startup, always render
                     const hasWinddownStartup = actualTasks.some(t => t.source === 'winddown' || t.source === 'startup');
                     if (!hasWinddownStartup && sortedGroup[0].id !== actualTasks[0]?.id) {
                       return null;
                     }
                   }
                   
                   // Calculate merged height for overlapping tasks FIRST
                   let mergedContainerHeight = taskDurationHeight;
                   let mergedContainerPx = taskDurationPx;
                   
                   // For ALL tasks with endTime, enforce minimum 1 hour height for consistent spacing
                   if (actualTasks[0]?.endTime) {
                     const taskStartMinutes = timeToMinutes(actualTasks[0].time!);
                     const taskEndMinutes = timeToMinutes(actualTasks[0].endTime);
                     const taskStartPos = ((taskStartMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
                     const taskEndPos = ((taskEndMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
                     
                     // Calculate exact pixel height based on timeline
                     const startPx = (taskStartPos / 100) * timelineHeight;
                     const endPx = (taskEndPos / 100) * timelineHeight;
                     let calculatedPx = endPx - startPx;
                     
                     // Enforce minimum height equivalent to 1 hour for consistent spacing
                     const oneHourInPx = (60 / (endMinutes - startMinutes)) * timelineHeight;
                     mergedContainerPx = Math.max(calculatedPx, oneHourInPx);
                     mergedContainerHeight = taskEndPos - actualPosition;
                   } else if (hasOverlap && overlappingGroup.length > 1 && !isStartupWinddown) {
                     // Find the latest end time among all overlapping tasks
                     const latestEndTime = Math.max(...overlappingGroup.map(t => timeToMinutes(t.endTime!)));
                     const latestEndPosition = ((latestEndTime - startMinutes) / (endMinutes - startMinutes)) * 100;
                     mergedContainerHeight = latestEndPosition - actualPosition;
                     mergedContainerPx = (mergedContainerHeight / 100) * timelineHeight;
                   }
                   
                                   // If overlapping, render all tasks in the group
                   const tasksToRender = hasOverlap ? overlappingGroup : actualTasks;
                   
                                      // Create border styling
                   const taskColor = actualTasks[0]?.color || 'hsl(var(--primary))';
                   const isMergedOverlap = hasOverlap && overlappingGroup.length >= 2 && mergedContainerHeight > 0;
                   
                   return (
                  <>
                    <div 
                      className="absolute"
                      style={{
                        top: `${actualPosition}%`,
                        // Don't center winddown/startup tasks - they start at their start time
                        transform: mergedContainerHeight > 0 || isWinddownTask || isStartupOrWinddown ? undefined : 'translateY(-50%)',
                        left: '3rem',
                        right: '0',
                        height: mergedContainerHeight > 0 ? `${mergedContainerPx}px` : 'auto',
                        minHeight: mergedContainerHeight > 0 ? '100px' : 'auto',
                      }}
                    >
                    
                    {/* Gradient border for merged tasks - simple overlay */}
                    {isMergedOverlap && (
                      <div
                        className="absolute left-0 top-0 bottom-0 pointer-events-none z-10"
                        style={{
                          width: '4px',
                          background: `linear-gradient(to bottom, ${overlappingGroup[0].color || '#8b5cf6'}, ${overlappingGroup[1].color || '#8b5cf6'})`,
                          borderRadius: '16px 0 0 16px',
                        }}
                      />
                    )}
                    
                    <div 
                      className={`bg-card border border-border shadow-md relative ${
                        sameTimeNoEnd ? 'flex flex-row gap-2' : 'flex flex-col'
                      } overflow-hidden cursor-pointer hover:bg-muted/30 transition-colors ${
                        taskDurationHeight > 0 ? 'h-full w-full' : 'w-full min-h-[80px]'
                      }`}
                      style={{
                        borderRadius: hasOverlap ? '16px' : '8px',
                        borderLeft: isMergedOverlap ? '4px solid transparent' : `4px solid ${taskColor}`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (tasksToRender.length > 0) {
                          handleTaskToggle(tasksToRender[0].id);
                        }
                      }}
                    >
                        {tasksToRender.map((task, taskIndex) => {
                        const badge = getSourceBadge?.(task.source || "manual");
                        
                        // Check if this is a container task (winddown/startup)
                        const isContainer = task.isContainer && (task.source === 'winddown' || task.source === 'startup');
                        
                        // If container, find child tasks
                        const childTasks = isContainer 
                          ? tasks.filter(t => t.parentId === task.id).sort((a, b) => (a.order || 0) - (b.order || 0))
                          : [];
                        
                        const subtasks = task.subtasks || [];
                        const completedSubtasks = subtasks.filter((st: any) => st.completed).length;
                        const isExpanded = expandedTasks.has(task.id);
                        const hasMoreThan3Subtasks = subtasks.length > 3;
                        const displayedSubtasks = isExpanded ? subtasks : subtasks.slice(0, 3);
                        
                        return (
                          <div 
                            key={task.id}
                            className={`p-2 sm:p-3 md:p-4 relative ${taskIndex > 0 && !sameTimeNoEnd ? 'border-t' : ''} ${sameTimeNoEnd ? 'flex-1' : ''}`}
                          >
                            <div 
                              className="flex items-center gap-1.5 sm:gap-2 w-full"
                              onMouseDown={(e) => {
                                if (!task.allDay && task.time) {
                                  handleDragStart(task, e);
                                }
                              }}
                              style={{
                                cursor: !task.allDay && task.time && 
                                  task.source !== 'water' && 
                                  task.source !== 'medication' && 
                                  task.source !== 'steps' && 
                                  task.source !== 'sleep' &&
                                  task.source !== 'work' &&
                                  task.source !== 'school' &&
                                  task.source !== 'workout' &&
                                  task.source !== 'food' &&
                                  task.source !== 'winddown' &&
                                  task.source !== 'startup' &&
                                  !task.isContainer 
                                  ? (draggingTask?.id === task.id ? 'grabbing' : 'grab') 
                                  : 'default',
                                opacity: draggingTask?.id === task.id ? 0.7 : 1,
                              }}
                            >
                              {/* Drag Indicator - visible on left for draggable tasks only */}
                              {!task.allDay && task.time && 
                               task.source !== 'water' && 
                               task.source !== 'medication' && 
                               task.source !== 'steps' && 
                               task.source !== 'sleep' &&
                               task.source !== 'work' &&
                               task.source !== 'school' &&
                               task.source !== 'workout' &&
                               task.source !== 'food' &&
                               task.source !== 'winddown' &&
                               task.source !== 'startup' &&
                               !task.isContainer && (
                                <div className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                                  <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                              )}
                              
                              {/* Emoji on the left - big and rounded, centered vertically */}
                              <div className="flex-shrink-0">
                                <div 
                                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all"
                                  style={{
                                    backgroundColor: task.completed ? (task.color || 'hsl(var(--primary))') : 'transparent',
                                    borderWidth: '2px',
                                    borderStyle: 'solid',
                                    borderColor: task.color ? `${task.color}${task.completed ? '' : '50'}` : (task.completed ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.3)'),
                                  }}
                                >
                                  <span className="text-2xl sm:text-3xl md:text-4xl">{task.emoji || '📝'}</span>
                                </div>
                              </div>
                              
                              {/* Content on the right */}
                              <div 
                                className="flex-1 min-w-0 flex items-center gap-2"
                              >
                              <div className="flex-1 min-w-0"
                              >
                                {/* Task Title and Badge */}
                                <div className="mb-1 sm:mb-2">
                                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                    <div className={`text-sm sm:text-base font-semibold break-words ${
                                      task.completed ? 'line-through opacity-60' : ''
                                    }`}>
                                      {task.title}
                                    </div>
                                    {task.repeat && (
                                      <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-muted-foreground">
                                        {task.repeat === 'daily' && <Repeat className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                                        {task.repeat === 'weekly' && <Repeat1 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                                        {task.repeat === 'monthly' && <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                                        {task.repeat === 'yearly' && <Repeat2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                                        {task.repeat === 'weekdays' && <Repeat className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                                        {task.repeat === 'custom' && <Repeat className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                                        <span className="capitalize">{task.repeat}</span>
                                      </div>
                                    )}
                                  </div>
                                  {showTaskTags && badge && (
                                    <Badge variant="secondary" className={`${badge.className} text-xs mt-1`}>
                                      {badge.label}
                                    </Badge>
                                  )}
                                </div>
                                
                                {/* Time display for winddown and startup tasks */}
                                {(task.source === 'winddown' || task.source === 'startup') && task.time && task.endTime && (
                                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    <span>{task.time} - {task.endTime}</span>
                                  </div>
                                )}
                                
                                {/* Break times for work tasks */}
                                {task.source === 'work' && (task as any).breakTimes && (task as any).breakTimes.length > 0 && (
                                  <div className="text-xs text-muted-foreground mb-2">
                                    <span className="font-medium">Breaks: </span>
                                    {(task as any).breakTimes.map((breakTime: { start: string; end: string }, idx: number) => (
                                      <span key={idx}>
                                        {breakTime.start}-{breakTime.end}
                                        {idx < (task as any).breakTimes.length - 1 && ', '}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Notes below title */}
                                {task.notes && (
                                  <div className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 italic break-words">
                                    {task.notes}
                                  </div>
                                )}
                                
                                {/* Subtasks */}
                                {subtasks.length > 0 && (
                                  <div className="w-full">
                                    <div className="text-xs text-muted-foreground mb-2">
                                      {completedSubtasks}/{subtasks.length} completed
                                    </div>
                                    <div className="space-y-1.5">
                                      {displayedSubtasks.map((subtask: any) => (
                                        <div 
                                          key={subtask.id}
                                          className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-muted/50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleSubtaskInContainer(task.id, subtask.id, e);
                                          }}
                                        >
                                          <button
                                            className={`w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 ${
                                              subtask.completed 
                                                ? 'bg-primary/20 border-primary' 
                                                : 'border-muted-foreground'
                                            }`}
                                          >
                                            {subtask.completed && (
                                              <span className="text-xs text-primary">✓</span>
                                            )}
                                          </button>
                                          <span className={`cursor-pointer hover:text-primary flex-1 break-words ${subtask.completed ? 'line-through opacity-60' : ''}`}>
                                            {subtask.title}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                    {hasMoreThan3Subtasks && (
                                      <button
                                        onClick={(e) => toggleTaskExpanded(task.id, e)}
                                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
                                      >
                                        {isExpanded ? (
                                          <>
                                            <ChevronUp className="w-3 h-3" />
                                            Show less
                                          </>
                                        ) : (
                                          <>
                                            <ChevronDown className="w-3 h-3" />
                                            Show {subtasks.length - 3} more
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                )}
                                
                                {/* Child Tasks for Containers (Winddown/Startup) */}
                                {isContainer && childTasks.length > 0 && (
                                  <div className="w-full mt-3 space-y-2">
                                    <div className="text-xs text-muted-foreground mb-2">
                                      {childTasks.filter(ct => ct.completed).length}/{childTasks.length} tasks completed
                                    </div>
                                    {childTasks.map((childTask) => (
                                      <div 
                                        key={childTask.id}
                                        className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTaskToggle(childTask.id);
                                        }}
                                      >
                                        <button
                                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                            childTask.completed 
                                              ? 'bg-success border-success' 
                                              : 'border-muted-foreground'
                                          }`}
                                        >
                                          {childTask.completed && (
                                            <span className="text-xs text-white">✓</span>
                                          )}
                                        </button>
                                        <span className={`flex-1 break-words ${childTask.completed ? 'line-through opacity-60' : ''}`}>
                                          {childTask.title}
                                        </span>
                                        {childTask.journalPrompt && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              // Open journal dialog
                                              window.dispatchEvent(new CustomEvent('openJournal', { 
                                                detail: { prompt: childTask.journalPrompt } 
                                              }));
                                            }}
                                            className="h-6 text-xs"
                                          >
                                            📖 Open
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              {/* External source shortcut icon - shown for tasks from other pages */}
                              {!isContainer && task.source !== 'winddown' && task.source !== 'startup' && task.source && getSourcePage(task.source) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSourceShortcut(task.source);
                                  }}
                                  className="flex-shrink-0 p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors text-primary"
                                  title={
                                    task.source === 'work' ? 'Open Work Settings' :
                                    task.source === 'school' ? 'Open Student Settings' :
                                    task.source === 'water' || task.source === 'medication' || task.source === 'sleep' ? 'Go to Health' : 
                                    task.source === 'food' ? 'Go to Food' : 'Go to Sport'
                                  }
                                >
                                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                              )}
                              
                              {/* Photo button - only visible when task has attachments */}
                              {!isContainer && task.source !== 'winddown' && task.source !== 'startup' && task.attachments && task.attachments.length > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImageViewerTask(task);
                                    setImageViewerOpen(true);
                                  }}
                                  className="flex-shrink-0 p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors relative text-primary"
                                  title={`${task.attachments.length} photo(s)`}
                                >
                                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                    {task.attachments.length}
                                  </span>
                                </button>
                              )}
                              
                              {/* Edit button - inline with emoji in middle right */}
                              {onUpdateTask && !isContainer && task.source !== 'winddown' && task.source !== 'startup' && task.source !== 'work' && task.source !== 'school' && task.source !== 'workout' && task.source !== 'food' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTask(task);
                                  }}
                                  className="flex-shrink-0 p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                  <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                                </button>
                              )}
                              </div>
                            </div>
                          </div>
                        );
                        })}
                    </div>
                    </div>
                    
                    {/* Overlap warning - positioned below container */}
                    {hasOverlap && mergedContainerHeight > 0 && !isStartupWinddown && (() => {
                      const basePositionPx = (position / 100) * timelineHeight;
                      const warningTopPx = basePositionPx + mergedContainerPx + 16;
                      
                      return (
                        <div 
                          className="absolute z-30"
                          style={{
                            top: `${warningTopPx}px`,
                            left: '3rem',
                            right: '0.5rem',
                          }}
                        >
                          <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 px-2 py-1.5">
                            <span className="flex-1 font-medium">⚠️ Tasks overlapping</span>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-6 text-[10px] px-2 border-red-400 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (overlappingGroup[0]) handleEditTask(overlappingGroup[0]);
                              }}
                            >
                              Reschedule
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                   );
                 })()}
              </React.Fragment>
            );
          })}

          {/* End dot if no sleep time - positioned at last task's end time */}
          {!timelineItems.some(item => item.isBedTime) && timelineItems.length > 0 && (() => {
            // Find the last task with an end time
            const lastTaskWithEndTime = [...timelineItems].reverse().find(item => 
              item.tasks.some(t => t.endTime)
            );
            
            if (!lastTaskWithEndTime) return null;
            
            const taskWithEndTime = lastTaskWithEndTime.tasks.find(t => t.endTime);
            if (!taskWithEndTime || !taskWithEndTime.endTime) return null;
            
            const endTaskMinutes = timeToMinutes(taskWithEndTime.endTime);
            const endPosition = ((endTaskMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
            
            // Check if the task with end time is completed
            const allCompleted = taskWithEndTime.completed || false;
            
            return (
              <>
                <div
                  className="absolute flex items-center z-40"
                  style={{ 
                    top: `${endPosition}%`,
                    left: '4px',
                    transform: 'translateY(-50%)',
                  }}
                >
                  <button className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 -translate-x-1/2 shadow-sm hover:shadow-md transition-shadow ${
                    allCompleted ? 'bg-primary border-primary shadow-lg' : 'bg-background border-primary'
                  }`} />
                </div>
                <div 
                  className="absolute z-40"
                  style={{ 
                    top: `${endPosition}%`,
                    left: '-7rem',
                    transform: 'translateY(-50%)',
                  }}
                >
                  <div className="text-sm sm:text-base font-mono text-muted-foreground whitespace-nowrap text-right w-20 sm:w-24">
                    {taskWithEndTime.endTime}
                  </div>
                </div>
              </>
            );
          })()}

          {/* Free Time Indicators - Rendered separately to avoid overlapping */}
          {timelineItems.map((item, index) => {
            // Only show free time for actual tasks (not reminders)
            if (item.tasks.length === 0) return null;
            if (item.tasks.every(t => t.source === 'medication' || t.source === 'water' || t.source === 'sleep')) return null;
            
            // Calculate position and free time
            const itemMinutes = timeToMinutes(item.time);
            const position = ((itemMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
            
            const taskWithEndTime = item.tasks.find(t => t.endTime);
            let endPosition = position;
            let taskDurationPx = 0;
            
            if (taskWithEndTime?.endTime) {
              const endTaskMinutes = timeToMinutes(taskWithEndTime.endTime);
              endPosition = ((endTaskMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
              const taskDurationHeight = endPosition - position;
              taskDurationPx = (taskDurationHeight / 100) * timelineHeight;
            }
            
            // Find next actual task
            let nextTaskItem = null;
            for (let i = index + 1; i < timelineItems.length; i++) {
              if (timelineItems[i].tasks.length > 0) {
                nextTaskItem = timelineItems[i];
                break;
              }
            }
            const freeTimeText = calculateFreeTime(item, nextTaskItem);
            
            if (!freeTimeText) return null;
            
            // Calculate pixel position - use end position if task has end time, otherwise use start position
            const endPositionPx = taskWithEndTime?.endTime 
              ? ((timeToMinutes(taskWithEndTime.endTime) - startMinutes) / (endMinutes - startMinutes)) * timelineHeight
              : (position / 100) * timelineHeight;
            
            // Filter to get actual tasks for this time slot (excluding system tasks and child tasks)
            const actualTasksAtTime = item.tasks.filter(t => 
              t.source !== 'medication' && 
              t.source !== 'sleep' && 
              t.source !== 'water' && 
              t.source !== 'steps' && 
              !t.parentId // Exclude child tasks
            );
            
            // Check for overlapping and calculate merged height
            let finalContainerHeight = taskDurationPx;
            if (actualTasksAtTime.length > 0 && actualTasksAtTime[0].endTime && actualTasksAtTime[0].time) {
              const allTimelineTasks = tasks.filter(t => t.time && !t.allDay && t.endTime && 
                t.source !== 'medication' && 
                t.source !== 'sleep' && 
                t.source !== 'water' && 
                t.source !== 'steps' &&
                !t.parentId);
              
              const currentTask = actualTasksAtTime[0];
              const currentStart = timeToMinutes(currentTask.time as string);
              const currentEnd = timeToMinutes(currentTask.endTime as string);
              
              const overlappingGroup = allTimelineTasks.filter(t => {
                const tStart = timeToMinutes(t.time!);
                const tEnd = timeToMinutes(t.endTime!);
                return (currentStart < tEnd && currentEnd > tStart);
              });
              
              if (overlappingGroup.length > 1) {
                // Use merged height
                const latestEndTime = Math.max(...overlappingGroup.map(t => timeToMinutes(t.endTime!)));
                const latestEndPosition = ((latestEndTime - startMinutes) / (endMinutes - startMinutes)) * 100;
                const mergedHeight = ((latestEndPosition - position) / 100) * timelineHeight;
                finalContainerHeight = mergedHeight;
              }
            }
            
            const hasOverlapWarning = finalContainerHeight !== taskDurationPx;
            const extraBufferForWarning = hasOverlapWarning ? 60 : 0; // Extra space if overlap warning is present
            
            // Calculate the actual rendered height of the container
            // For tasks with end time, use calculated height
            // For tasks without end time, we need to estimate based on content
            let estimatedContainerHeight = 0;
            if (finalContainerHeight > 0) {
              estimatedContainerHeight = finalContainerHeight + extraBufferForWarning;
            } else {
              // For tasks without end time, estimate based on number of tasks and their content
              const numTasks = actualTasksAtTime.length;
              const baseTaskHeight = 120; // Base height per task
              const subtaskHeight = actualTasksAtTime.reduce((sum, t) => {
                const subtaskCount = (t.subtasks?.length || 0);
                const childTaskCount = tasks.filter(ct => ct.parentId === t.id).length;
                return sum + (subtaskCount * 30) + (childTaskCount * 40);
              }, 0);
              estimatedContainerHeight = (baseTaskHeight * numTasks) + subtaskHeight + 40; // Add padding
            }
            
            // Use end position as base, then add container height plus spacing
            const containerEndPx = endPositionPx + estimatedContainerHeight + 32; // 32px total spacing (16px container padding + 16px margin)
            
            return (
              <div 
                key={`free-${item.time}`}
                className="absolute"
                style={{ 
                  top: `${containerEndPx + 16}px`, // 16px margin below container
                  left: '3rem',
                  right: '0.5rem',
                }}
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                      {freeTimeText.hours > 0 && `${freeTimeText.hours}h`}
                      {freeTimeText.hours > 0 && freeTimeText.minutes > 0 && ' '}
                      {freeTimeText.minutes > 0 && `${freeTimeText.minutes}m`} Free time
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 sm:h-7 text-[10px] sm:text-xs flex-shrink-0"
                    onClick={() => {
                      if (onAddTaskClick) {
                        // Use end time if available, otherwise use start time
                        const prefillTime = taskWithEndTime?.endTime || item.time;
                        onAddTaskClick(prefillTime);
                      }
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Task
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Free Time: Wake up to First Task */}
          {(() => {
            const wakeUpItem = timelineItems.find(item => item.isWakeUp);
            const firstNonSleepTask = timelineItems.find(item => 
              item.tasks.length > 0 && 
              !item.isWakeUp && 
              !item.isBedTime &&
              item.tasks.some(t => 
                t.source !== 'medication' && 
                t.source !== 'water' && 
                t.source !== 'steps' && 
                t.source !== 'sleep' &&
                t.source !== 'winddown' && 
                t.source !== 'startup' && 
                t.source !== 'menstrual'
              )
            );
            
            if (!wakeUpItem || !firstNonSleepTask) return null;
            
            const wakeUpMinutes = timeToMinutes(wakeUpItem.time);
            const firstTaskMinutes = timeToMinutes(firstNonSleepTask.time);
            const diffMinutes = firstTaskMinutes - wakeUpMinutes;
            
            if (diffMinutes < 30) return null;
            
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;
            
            const wakeUpPosition = ((wakeUpMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
            const wakeUpPx = (wakeUpPosition / 100) * timelineHeight;
            
            return (
              <div 
                key="free-wakeup"
                className="absolute"
                style={{ 
                  top: `${wakeUpPx + 60}px`,
                  left: '3rem',
                  right: '0.5rem',
                }}
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                      {hours > 0 && `${hours}h`}
                      {hours > 0 && minutes > 0 && ' '}
                      {minutes > 0 && `${minutes}m`} Free time
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 sm:h-7 text-[10px] sm:text-xs flex-shrink-0"
                    onClick={() => {
                      if (onAddTaskClick) {
                        onAddTaskClick(wakeUpItem.time);
                      }
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Task
                  </Button>
                </div>
              </div>
            );
          })()}

          {/* Free Time: Last Task to Sleep */}
          {(() => {
            const sleepItem = timelineItems.find(item => item.isBedTime);
            const lastNonSleepTask = [...timelineItems].reverse().find(item => 
              item.tasks.length > 0 && 
              !item.isWakeUp && 
              !item.isBedTime &&
              item.tasks.some(t => 
                t.source !== 'medication' && 
                t.source !== 'water' && 
                t.source !== 'steps' && 
                t.source !== 'sleep' &&
                t.source !== 'winddown' && 
                t.source !== 'startup' && 
                t.source !== 'menstrual'
              )
            );
            
            if (!sleepItem || !lastNonSleepTask) return null;
            
            const sleepMinutes = timeToMinutes(sleepItem.time);
            
            // Get end time of last task if it has one, otherwise use start time
            const lastTaskWithEndTime = lastNonSleepTask.tasks.find(t => t.endTime);
            const lastTaskEndTime = lastTaskWithEndTime?.endTime || lastNonSleepTask.time;
            const lastTaskMinutes = timeToMinutes(lastTaskEndTime);
            
            const diffMinutes = sleepMinutes - lastTaskMinutes;
            
            if (diffMinutes < 30) return null;
            
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;
            
            const lastTaskPosition = ((lastTaskMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
            const lastTaskPx = (lastTaskPosition / 100) * timelineHeight;
            
            // Calculate the actual rendered height of the last task container
            let lastTaskDurationPx = 0;
            if (lastTaskWithEndTime?.endTime) {
              const endTaskMinutes = timeToMinutes(lastTaskWithEndTime.endTime);
              const endPosition = ((endTaskMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
              const startPosition = ((timeToMinutes(lastNonSleepTask.time) - startMinutes) / (endMinutes - startMinutes)) * 100;
              const taskDurationHeight = endPosition - startPosition;
              lastTaskDurationPx = (taskDurationHeight / 100) * timelineHeight;
            } else {
              // Estimate based on task content
              const lastTasks = lastNonSleepTask.tasks.filter(t => 
                t.source !== 'medication' && 
                t.source !== 'water' && 
                t.source !== 'steps' && 
                t.source !== 'sleep' &&
                !t.parentId
              );
              const numTasks = lastTasks.length;
              const baseTaskHeight = 120;
              const subtaskHeight = lastTasks.reduce((sum, t) => {
                const subtaskCount = (t.subtasks?.length || 0);
                const childTaskCount = tasks.filter(ct => ct.parentId === t.id).length;
                return sum + (subtaskCount * 30) + (childTaskCount * 40);
              }, 0);
              lastTaskDurationPx = (baseTaskHeight * numTasks) + subtaskHeight + 40;
            }
            
            const containerEndPx = lastTaskPx + lastTaskDurationPx;
            
            return (
              <div 
                key="free-sleep"
                className="absolute"
                style={{ 
                  top: `${containerEndPx + 16}px`,
                  left: '3rem',
                  right: '0.5rem',
                }}
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                      {hours > 0 && `${hours}h`}
                      {hours > 0 && minutes > 0 && ' '}
                      {minutes > 0 && `${minutes}m`} Free time
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 sm:h-7 text-[10px] sm:text-xs flex-shrink-0"
                    onClick={() => {
                      if (onAddTaskClick) {
                        onAddTaskClick(lastTaskEndTime);
                      }
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Task
                  </Button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Combined Reminder Dialog */}
      <Dialog open={combinedReminderOpen} onOpenChange={setCombinedReminderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 justify-between">
              <span>Water & Medication Reminder</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCombinedReminderOpen(false);
                  setLocation('/health');
                }}
                className="text-xs gap-1"
              >
                Go to Health
                <ExternalLink className="w-3 h-3" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div>
              <Label htmlFor="water-amount">Water Amount ({getWaterUnit()})</Label>
              <div className="flex gap-2 mb-3">
                {[250, 350, 500, 750, 1000].map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={waterAmount === String(amount) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWaterAmount(String(amount))}
                    className="flex-1"
                  >
                    {amount}
                  </Button>
                ))}
              </div>
              <Input
                id="water-amount"
                type="number"
                value={waterAmount}
                onChange={(e) => setWaterAmount(e.target.value)}
                placeholder="Custom amount"
              />
            </div>
            
            <div>
              <Label className="mb-3 block">Medications</Label>
              {getMedicationsForTime(selectedReminderTime).map((med: any) => (
                <div key={med.id} className="flex items-center space-x-2 p-3 rounded-lg border bg-muted/50 mb-2">
                  <Checkbox
                    id={`med-${med.id}`}
                    checked={medicationTaken}
                    onCheckedChange={(checked) => setMedicationTaken(checked as boolean)}
                  />
                  <Label htmlFor={`med-${med.id}`} className="cursor-pointer flex-1">
                    <div className="font-medium">{med.name}</div>
                    <div className="text-xs text-muted-foreground">{med.dosage}</div>
                  </Label>
                </div>
              ))}
            </div>

            <Button onClick={handleCombinedReminderSubmit} className="w-full">
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Medication Only Dialog */}
      <Dialog open={medicationDialogOpen} onOpenChange={setMedicationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💊</span>
                Medication Reminder
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMedicationDialogOpen(false);
                  setLocation('/health');
                }}
                className="text-xs gap-1"
              >
                Go to Health
                <ExternalLink className="w-3 h-3" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{selectedMedicationTime}</span>
            </div>
            
            {getMedicationsForTime(selectedMedicationTime).map((med: any) => {
              const today = new Date().toISOString().split('T')[0];
              const takenEntry = `${today}_${selectedMedicationTime}`;
              const isTaken = med.takenDates?.includes(takenEntry);
              
              return (
                <div key={med.id} className="p-4 rounded-lg border-2 bg-card space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="font-semibold text-lg">{med.name}</div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isTaken ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}>
                        {isTaken ? '✓ Taken' : '⏱ Pending'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">Dosage:</span>
                      <span className="text-foreground font-semibold">{med.dosage}</span>
                    </div>
                    {med.notes && (
                      <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                        <span className="font-medium">Note:</span> {med.notes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <Button onClick={handleMedicationSubmit} className="w-full">
              Mark as Taken
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step Counter Dialog */}
      <Dialog open={stepDialogOpen} onOpenChange={setStepDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👟</span>
                Log Steps
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStepDialogOpen(false);
                  setLocation('/sport');
                }}
                className="text-xs gap-1"
              >
                Go to Sport
                <ExternalLink className="w-3 h-3" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{selectedStepTime}</span>
            </div>
            
            <div>
              <Label htmlFor="step-count">Number of Steps</Label>
              <Input
                id="step-count"
                type="number"
                min="0"
                value={stepCount}
                onChange={(e) => setStepCount(e.target.value)}
                placeholder="e.g., 5000"
                className="mt-2"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2">
                Enter the total steps you've taken so far today
              </p>
            </div>

            <Button 
              onClick={handleStepSubmit} 
              className="w-full"
              disabled={!stepCount || parseInt(stepCount) <= 0}
            >
              Save Steps
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Meditation Dialog */}
      <Dialog open={meditationDialogOpen} onOpenChange={setMeditationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧘</span>
                Complete Meditation
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMeditationDialogOpen(false);
                  setLocation('/health');
                }}
                className="text-xs gap-1"
              >
                Go to Health
                <ExternalLink className="w-3 h-3" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{selectedMeditationTime}</span>
            </div>
            
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">
                Take a moment to breathe and center yourself.
              </p>
              <div className="text-6xl mb-4">🧘‍♀️</div>
              <p className="text-xs text-muted-foreground">
                Mark this meditation session as complete
              </p>
            </div>

            <Button 
              onClick={handleMeditationSubmit} 
              className="w-full"
            >
              Complete Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Glucose Check Dialog */}
      <Dialog open={glucoseDialogOpen} onOpenChange={setGlucoseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🩸</span>
                Log Blood Glucose
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setGlucoseDialogOpen(false);
                  setLocation('/health');
                }}
                className="text-xs gap-1"
              >
                Go to Health
                <ExternalLink className="w-3 h-3" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{selectedGlucoseTime}</span>
            </div>
            
            <div>
              <Label htmlFor="glucose-value">Blood Glucose Reading</Label>
              <Input
                id="glucose-value"
                type="number"
                min="0"
                step="0.1"
                value={glucoseValue}
                onChange={(e) => setGlucoseValue(e.target.value)}
                placeholder="e.g., 120"
                className="mt-2"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2">
                Enter your blood glucose reading (mg/dL or mmol/L)
              </p>
            </div>

            <Button 
              onClick={handleGlucoseSubmit} 
              className="w-full"
              disabled={!glucoseValue || parseFloat(glucoseValue) <= 0}
            >
              Save Reading
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="edit-title">Task Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Task title"
              />
            </div>

            <div>
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>

            <div>
              <Label>Emoji</Label>
              <EmojiPicker 
                value={editEmoji}
                onChange={setEditEmoji}
                category="common"
              />
            </div>

            <div>
              <Label htmlFor="edit-time">Start Time</Label>
              <Input
                id="edit-time"
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="edit-end-time">End Time (optional)</Label>
              <Input
                id="edit-end-time"
                type="time"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                placeholder="Leave empty for no end time"
              />
            </div>

            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add notes..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-color">Task Color (optional)</Label>
              <div className="flex items-center gap-3 mt-2">
                <Input
                  id="edit-color"
                  type="color"
                  value={editColor || "#8b5cf6"}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground flex-1">
                  {editColor || "Using theme color"}
                </span>
                {editColor && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditColor("")}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="edit-repeat">Repeat</Label>
              <Select value={editRepeat} onValueChange={(value: any) => setEditRepeat(value)}>
                <SelectTrigger id="edit-repeat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Does not repeat</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="weekdays">Every weekday (Mon-Fri)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Subtasks</Label>
              <div className="mt-2 space-y-2">
                {editingTask?.subtasks?.map((subtask: any) => (
                  <div key={subtask.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => handleToggleSubtask(subtask.id)}
                    />
                    <span className={`flex-1 text-sm ${subtask.completed ? 'line-through opacity-60' : ''}`}>
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="p-1 hover:bg-destructive/10 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Add subtask..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={handleAddSubtask}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Photos / Screenshots */}
            <div>
              <Label>Photos / Screenshots</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Add Image
              </Button>
              
              {editingTask?.attachments && editingTask.attachments.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {editingTask.attachments.map((attachment: string, index: number) => (
                    <div key={index} className="relative group">
                      <img
                        src={attachment}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteAttachment(index)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveEdit} className="flex-1">
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingTask(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
            
            {/* Delete button at bottom */}
            {onDeleteTask && editingTask && (
              <div className="pt-2 border-t">
                <Button
                  variant="destructive"
                  onClick={() => editingTask && handleDeleteClick(editingTask)}
                  className="w-full"
                >
                  Delete Task
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete "{taskToDelete?.title}"?
            </p>
            
            {taskToDelete && hasFutureInstances(taskToDelete) && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
                  {taskToDelete.repeat ? (
                    <>🔁 Recurring {taskToDelete.repeat} task</>
                  ) : (
                    <>This task has future instances</>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {taskToDelete.repeat 
                    ? `This ${taskToDelete.repeat} task will repeat in the future. Delete just today's instance or all future occurrences?`
                    : 'Choose whether to delete only today\'s task or all future occurrences.'
                  }
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Button
                variant="destructive"
                onClick={() => handleDeleteConfirm(false)}
                className="w-full"
              >
                Delete Today Only
              </Button>
              
              {taskToDelete && hasFutureInstances(taskToDelete) && (
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteConfirm(true)}
                  className="w-full"
                >
                  Delete Today & All Future
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      {imageViewerTask && imageViewerTask.attachments && imageViewerTask.attachments.length > 0 && (
        <ImageViewerDialog
          images={imageViewerTask.attachments}
          open={imageViewerOpen}
          onOpenChange={(open) => {
            setImageViewerOpen(open);
            if (!open) setImageViewerTask(null);
          }}
          initialIndex={0}
        />
      )}

      {/* Work Dialog */}
      <Dialog open={workDialogOpen} onOpenChange={setWorkDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>💼 Work</DialogTitle>
          </DialogHeader>
          <Work />
        </DialogContent>
      </Dialog>
    </div>
  );
}

