import React, { useState, useEffect, useMemo, useRef } from "react";
import { Task } from "./types";
import { getCurrentTime, formatTimeString } from "@/lib/timeUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, X, Plus, ChevronDown, ChevronUp, Clock, Repeat, Repeat1, Repeat2, Calendar, GripVertical } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { EmojiPicker } from "@/components/EmojiPicker";

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
  isWakeUp?: boolean;
  isBedTime?: boolean;
}

export default function LiquidTimeline({ tasks, date, onToggleTask, onUpdateTask, onDeleteTask, onWaterReminderClick, onAddTaskClick, getSourceBadge }: Props) {
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [combinedReminderOpen, setCombinedReminderOpen] = useState(false);
  const [selectedReminderTime, setSelectedReminderTime] = useState<string>("");
  const [waterAmount, setWaterAmount] = useState("250");
  const [medicationTaken, setMedicationTaken] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
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
  
  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  
  // Show task tags setting
  const [showTaskTags, setShowTaskTags] = useState(() => {
    return localStorage.getItem("showTaskTags") !== "false";
  });

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
    if (!waterSettings.remindersEnabled || !waterSettings.addToTodo) return [];
    
    // Get sleep schedule to avoid wake/sleep times
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
    
    const reminderTimes: string[] = [];
    const startTime = waterSettings.reminderStartTime || wakeTime;
    const endTime = waterSettings.reminderEndTime || sleepTime;
    const interval = waterSettings.reminderInterval || 2;
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
    const [sleepHour, sleepMin] = sleepTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    // Start water reminders AFTER wake time (add 30 minutes buffer)
    const startMinutes = startHour * 60 + startMin;
    const wakeMinutes = wakeHour * 60 + wakeMin + 30; // 30 min buffer after wake
    let currentMinutes = Math.max(startMinutes, wakeMinutes);
    
    // End water reminders BEFORE sleep time (subtract 30 minutes buffer)
    const endMinutes = endHour * 60 + endMin;
    const sleepMinutes = sleepHour * 60 + sleepMin - 30; // 30 min buffer before sleep
    const finalEndMinutes = Math.min(endMinutes, sleepMinutes);
    
    while (currentMinutes < finalEndMinutes) {
      currentHour = Math.floor(currentMinutes / 60);
      currentMin = currentMinutes % 60;
      
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      
      // Don't add if it's exactly wake or sleep time
      if (timeStr !== wakeTime && timeStr !== sleepTime) {
        reminderTimes.push(timeStr);
      }
      
      currentMinutes += interval * 60;
    }
    
    return reminderTimes;
  };

  const getMedicationReminderTimes = () => {
    const medications = JSON.parse(localStorage.getItem('medications') || '[]');
    const times: string[] = [];
    medications.forEach((med: any) => {
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

  // Build timeline items - refreshKey ensures re-calculation when reminders are completed
  const timelineItems: TimelineItem[] = useMemo(() => {
    const waterReminderTimes = getWaterReminderTimes();
    const medicationReminderTimes = getMedicationReminderTimes();
    const stepReminderTimes = getStepReminderTimes();
    
    const itemsMap: Record<string, TimelineItem> = {};

    // Add tasks
    timeBasedTasks.forEach(task => {
      const time = task.time!;
      if (!itemsMap[time]) {
        itemsMap[time] = { time, tasks: [], isWakeUp: false, isBedTime: false };
      }
      itemsMap[time].tasks.push(task);
      
      if (task.source === 'sleep' && task.sleepAction === 'wake') {
        itemsMap[time].isWakeUp = true;
      }
      if (task.source === 'sleep' && task.sleepAction === 'sleep') {
        itemsMap[time].isBedTime = true;
      }
    });

    // Add water reminders
    waterReminderTimes.forEach(time => {
      if (!itemsMap[time]) {
        itemsMap[time] = { time, tasks: [] };
      }
      itemsMap[time].waterReminder = true;
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

    // Sort by time
    const sortedItems = Object.values(itemsMap).sort((a, b) => {
      const [aH, aM] = a.time.split(':').map(Number);
      const [bH, bM] = b.time.split(':').map(Number);
      return (aH * 60 + aM) - (bH * 60 + bM);
    });

    return sortedItems;
  }, [timeBasedTasks, refreshKey]);

  if (timelineItems.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No scheduled tasks for today</p>
        <p className="text-sm mt-2">Add tasks with specific times to see your timeline</p>
      </div>
    );
  }

  const currentTimeStr = formatTimeString(currentTime);
  const startTime = timelineItems[0].time;
  const endTime = timelineItems[timelineItems.length - 1].time;

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
  
  // Calculate fill percentage based on viewing date
  let fillPercentage = 0;
  
  if (isPastDate) {
    // Past dates: Always 100% filled
    fillPercentage = 100;
  } else if (isFutureDate) {
    // Future dates: Never filled
    fillPercentage = 0;
  } else {
    // Today: Calculate based on current time
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
    setSelectedMedicationTime(time);
    setMedicationDialogOpen(true);
  };

  const handleStepReminderClick = (time: string) => {
    setSelectedStepTime(time);
    setStepCount("");
    setStepDialogOpen(true);
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
    
    const updatedSubtasks = (editingTask.subtasks || []).map(st =>
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
    
    const updatedSubtasks = (editingTask.subtasks || []).filter(st => st.id !== subtaskId);
    onUpdateTask(editingTask.id, { subtasks: updatedSubtasks });
    setEditingTask({ ...editingTask, subtasks: updatedSubtasks });
  };

  const handleToggleSubtaskInContainer = (taskId: string, subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateTask) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const updatedSubtasks = (task.subtasks || []).map(st =>
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

  // Drag-to-reschedule handlers
  const handleDragStart = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent text selection
    
    // Only allow dragging tasks with time (not all-day tasks)
    if (!task.time || task.allDay) return;
    
    // Don't allow dragging water/medication/step reminders or sleep tasks
    if (task.source === 'water' || task.source === 'medication' || task.source === 'steps' || task.source === 'sleep') return;
    
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
    // Skip if next item is medication, water, steps, or sleep
    if (nextItem.tasks.every(t => t.source === 'medication' || t.source === 'water' || t.source === 'steps' || t.source === 'sleep')) return null;
    
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
    <div className="w-full mx-auto pl-2 pr-0 sm:px-2 md:px-4">
      <div className="py-8 pl-24 sm:pl-28 md:pl-32 pr-1 sm:pr-2 overflow-visible">
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
            {/* Liquid Fill - rounded at top and at current time endpoint */}
            <div 
              className="absolute top-0 left-0 w-full bg-primary"
              style={{ 
                height: `${fillPercentage}%`,
                borderRadius: fillPercentage < 100 ? '9999px 9999px 9999px 9999px' : '9999px 9999px 0 0',
              }}
            />
            
            {/* Candy Cane Stripes for Missed Tasks and Reminders */}
            {timelineItems.map((item, index) => {
              // Force re-evaluation by using refreshKey in the check
              const checkMissed = () => {
                // Future dates: nothing is missed
                if (isFutureDate) return false;
                
                let timePassed = false;
                if (isPastDate) {
                  // Past dates: all times have passed
                  timePassed = true;
                } else {
                  // Today: check if time has passed
                  timePassed = item.time < currentTimeStr;
                }
                
                if (!timePassed) return false;
                
                // Check if this specific item has missed tasks
                const hasMissedTasks = item.tasks.length > 0 && item.tasks.some(t => !t.completed);
                
                // Check if water reminder is missed
                const isWaterMissed = item.waterReminder && (() => {
                  const waterEntries = JSON.parse(localStorage.getItem('water_entries') || '[]');
                  return !waterEntries.some((entry: any) => 
                    entry.date === viewingDate && entry.time === item.time
                  );
                })();
                
                // Check if medication reminder is missed
                const isMedicationMissed = item.medicationReminder && (() => {
                  const medications = JSON.parse(localStorage.getItem('medications') || '[]');
                  const takenEntry = `${viewingDate}_${item.time}`;
                  return !medications.some((med: any) => 
                    med.times?.includes(item.time) && med.takenDates?.includes(takenEntry)
                  );
                })();
                
                // Check if step reminder is missed
                const isStepMissed = item.stepReminder && (() => {
                  const stepLogs = JSON.parse(localStorage.getItem('step_logs') || '[]');
                  return !stepLogs.some((log: any) => 
                    log.date === viewingDate && log.timestamp.includes(item.time.substring(0, 2))
                  );
                })();
                
                return hasMissedTasks || isWaterMissed || isMedicationMissed || isStepMissed;
              };
              
              const isMissed = checkMissed();
              
              if (!isMissed || index === 0) return null;
              
              const prevItem = timelineItems[index - 1];
              const prevMinutes = timeToMinutes(prevItem.time);
              const itemMinutes = timeToMinutes(item.time);
              const totalHeight = endMinutes - startMinutes;
              const startPercent = ((prevMinutes - startMinutes) / totalHeight) * 100;
              const endPercent = ((itemMinutes - startMinutes) / totalHeight) * 100;
              
              return (
                <div
                  key={`stripe-${index}`}
                  className="absolute left-0 w-full overflow-hidden z-5"
                  style={{
                    top: `${startPercent}%`,
                    height: `${endPercent - startPercent}%`,
                    background: 'repeating-linear-gradient(45deg, hsl(var(--primary)) 0px, hsl(var(--primary)) 6px, hsl(var(--background)) 6px, hsl(var(--background)) 12px)',
                    opacity: 0.8,
                  }}
                />
              );
            })}
          </div>

          {/* Current Time Label - only show on today */}
          {isToday && (() => {
            // Check if current time matches any task time
            const hasTaskAtCurrentTime = timelineItems.some(item => item.time === currentTimeStr);
            if (hasTaskAtCurrentTime) return null;
            
            // Determine position based on current time relative to sleep hours
            let positionStyle: any = {};
            
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
            // During active hours - show at current position
            else {
              positionStyle = {
                left: '-7rem',
                top: `${fillPercentage}%`,
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
            if (taskWithEndTime?.endTime) {
              const endTaskMinutes = timeToMinutes(taskWithEndTime.endTime);
              endPosition = ((endTaskMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
              taskDurationHeight = endPosition - position;
              // Calculate actual pixel height for better control
              taskDurationPx = (taskDurationHeight / 100) * timelineHeight;
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
            const hasMultipleReminders = !isBigDot && [item.waterReminder, item.medicationReminder, item.stepReminder].filter(Boolean).length > 1;
            const hasAnyReminder = !isBigDot && (item.waterReminder || item.medicationReminder || item.stepReminder);
            
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

            const isReminderCompleted = (item.waterReminder && isWaterCompleted) ||
                                       (item.medicationReminder && isMedicationCompleted) ||
                                       (item.stepReminder && isStepCompleted) ||
                                       (hasMultipleReminders && isWaterCompleted && isMedicationCompleted && isStepCompleted);
            
            return (
              <>
                {/* Time Label - positioned separately */}
                <div 
                  className="absolute z-40"
                  style={{ 
                    top: `${position}%`,
                    left: '-7rem',
                    transform: 'translateY(-50%)',
                  }}
                >
                  <div className="text-sm sm:text-base font-mono text-muted-foreground whitespace-nowrap text-right w-20 sm:w-24">
                    {item.time}
                  </div>
                </div>

                {/* Task Duration Bars on Timeline - Show for all tasks with endTime */}
                {item.tasks.filter(t => t.endTime && t.time && t.source !== 'medication' && t.source !== 'water' && t.source !== 'steps' && t.source !== 'sleep').map((task, idx) => {
                  const taskStartMinutes = timeToMinutes(task.time!);
                  const taskEndMinutes = timeToMinutes(task.endTime!);
                  const taskStartPos = ((taskStartMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
                  const taskEndPos = ((taskEndMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
                  const taskDurHeight = taskEndPos - taskStartPos;
                  
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
                      
                      {/* Start time label (only if not the main time already shown) */}
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
                      
                      {/* End time label */}
                      <div 
                        className="absolute z-40"
                        style={{ 
                          top: `${taskEndPos}%`,
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
                {(item.isWakeUp || item.isBedTime || hasAnyReminder) && (
                  <div
                    key={item.time}
                    className="absolute flex items-center z-40"
                    style={{ 
                      top: `${position}%`,
                      left: '4px', // Center of 8px timeline (w-2 = 0.5rem = 8px, so center = 4px)
                      transform: 'translateY(-50%)', // Only vertical centering
                    }}
                  >
                    {/* Dot */}
                    <button
                  onClick={() => {
                    // Check what's actually at this time slot
                    const hasActualTask = item.tasks.length > 0 && 
                                         item.tasks.some(t => t.source !== 'medication' && t.source !== 'water' && t.source !== 'steps');
                    
                    // If there are reminders and NO actual tasks, handle reminders first
                    if (!hasActualTask && hasMultipleReminders) {
                      handleCombinedReminderClick(item.time);
                    } else if (!hasActualTask && item.stepReminder) {
                      handleStepReminderClick(item.time);
                    } else if (!hasActualTask && item.medicationReminder) {
                      handleMedicationReminderClick(item.time);
                    } else if (!hasActualTask && item.waterReminder && onWaterReminderClick) {
                      onWaterReminderClick(item.time);
                    } else if (item.tasks.length > 0) {
                      // Handle actual tasks (wake/sleep or regular tasks)
                      onToggleTask(item.tasks[0].id);
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
                  {/* Show emojis only for wake/sleep/reminders, regular tasks show as filled dots */}
                  {item.isWakeUp ? (
                    <span className="text-lg">☀️</span>
                  ) : item.isBedTime ? (
                    <span className="text-lg">🌙</span>
                  ) : hasAnyReminder ? (
                    <span className={hasMultipleReminders ? "text-base flex items-center gap-0.5" : "text-lg"}>
                      {hasMultipleReminders ? (
                        <>
                          {item.waterReminder && <span className="text-sm">💧</span>}
                          {item.medicationReminder && <span className="text-sm">{getMedicationEmojiForTime(item.time)}</span>}
                          {item.stepReminder && <span className="text-sm">👟</span>}
                        </>
                      ) : item.waterReminder ? (
                        '💧'
                      ) : item.medicationReminder ? (
                        getMedicationEmojiForTime(item.time)
                      ) : item.stepReminder ? (
                        '👟'
                      ) : null}
                    </span>
                  ) : null}
                </button>
              </div>
            )}

                {/* Wake up / Sleep text label */}
                {item.isWakeUp && (
                  <div 
                    className="absolute z-40"
                    style={{ 
                      top: `${position}%`,
                      left: '0',
                      transform: 'translate(-50%, -250%)',
                    }}
                  >
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Wake up</span>
                  </div>
                )}
                {item.isBedTime && (
                  <div 
                    className="absolute z-40"
                    style={{ 
                      top: `${position}%`,
                      left: '0',
                      transform: 'translate(-50%, 150%)',
                    }}
                  >
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Go to bed</span>
                  </div>
                )}

                {/* Task Info Container - Only show for actual tasks, not reminders/sleep */}
                {item.tasks.length > 0 && 
                 item.tasks.some(t => t.source !== 'medication' && t.source !== 'sleep' && t.source !== 'water' && t.source !== 'steps') && 
                 !item.isWakeUp && 
                 !item.isBedTime && (() => {
                   // Filter out system tasks and child tasks (parentId), but keep winddown/startup containers
                   const actualTasks = item.tasks.filter(t => 
                     t.source !== 'medication' && 
                     t.source !== 'sleep' && 
                     t.source !== 'water' && 
                     t.source !== 'steps' &&
                     !t.parentId // Don't show child tasks separately - they'll be shown inside their container
                   );
                   
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
                     overlappingGroup = allTimelineTasks.filter(t => {
                       const tStart = timeToMinutes(t.time!);
                       const tEnd = timeToMinutes(t.endTime!);
                       return (currentStart < tEnd && currentEnd > tStart);
                     });
                   }
                   
                   const hasOverlap = overlappingGroup.length > 1;
                   const sameTimeNoEnd = actualTasks.length > 1 && actualTasks.every(t => !t.endTime);
                   
                   // Skip rendering if this task is not the earliest in its overlapping group
                   if (hasOverlap && overlappingGroup.length > 1) {
                     const sortedGroup = [...overlappingGroup].sort((a, b) => 
                       timeToMinutes(a.time!) - timeToMinutes(b.time!)
                     );
                     // Only render at the earliest task's time
                     if (sortedGroup[0].id !== actualTasks[0]?.id) {
                       return null;
                     }
                   }
                   
                   // Calculate merged height for overlapping tasks FIRST
                   let mergedContainerHeight = taskDurationHeight;
                   let mergedContainerPx = taskDurationPx;
                   
                   if (hasOverlap && overlappingGroup.length > 1) {
                     // Find the latest end time among all overlapping tasks
                     const latestEndTime = Math.max(...overlappingGroup.map(t => timeToMinutes(t.endTime!)));
                     const latestEndPosition = ((latestEndTime - startMinutes) / (endMinutes - startMinutes)) * 100;
                     mergedContainerHeight = latestEndPosition - position;
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
                        top: `${position}%`,
                        transform: mergedContainerHeight > 0 ? undefined : 'translateY(-50%)',
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
                      } overflow-hidden ${
                        taskDurationHeight > 0 ? 'h-full w-full' : 'w-full min-h-[80px]'
                      }`}
                      style={{
                        borderRadius: hasOverlap ? '16px' : '8px',
                        borderLeft: isMergedOverlap ? '4px solid transparent' : `4px solid ${taskColor}`,
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
                        const completedSubtasks = subtasks.filter(st => st.completed).length;
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
                                cursor: !task.allDay && task.time ? (draggingTask?.id === task.id ? 'grabbing' : 'grab') : 'default',
                                opacity: draggingTask?.id === task.id ? 0.7 : 1,
                              }}
                            >
                              {/* Drag Indicator - visible on left */}
                              {!task.allDay && task.time && (
                                <div className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                                  <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                              )}
                              
                              {/* Emoji on the left - big and rounded, centered vertically */}
                              <div 
                                className="flex-shrink-0 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleTask(task.id);
                                }}
                              >
                                <div 
                                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all"
                                  style={{
                                    backgroundColor: task.completed
                                      ? (task.color || 'hsl(var(--primary))')
                                      : (task.color ? `${task.color}15` : 'hsl(var(--primary) / 0.1)'),
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
                                          onToggleTask(childTask.id);
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
                              
                              {/* Edit button - inline with emoji in middle right */}
                              {onUpdateTask && !isContainer && task.source !== 'winddown' && task.source !== 'startup' && (
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
                    {hasOverlap && mergedContainerHeight > 0 && (() => {
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
              </>
            );
          })}

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
            
            // Calculate pixel position - position below the task container
            const basePositionPx = (position / 100) * timelineHeight;
            
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
            
            const containerEndPx = basePositionPx + estimatedContainerHeight + 16; // 16px spacing
            
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
            <DialogTitle>Water & Medication Reminder</DialogTitle>
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
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">💊</span>
              Medication Reminder
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
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">👟</span>
              Log Steps
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
    </div>
  );
}

