import { useState, useEffect } from "react";
import TimelineTask from "./TimelineTask";
import { Task } from "@/app/types/types";
import { Badge } from "@/app/components/ui/badge";
import { format } from "date-fns";
import { getCurrentTime, formatTimeString } from "@/lib/timeUtils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  getSourceBadge: (source: Task["source"]) => { label: string; className: string } | null;
  onWaterReminderClick?: (time: string) => void;
}

interface SortableTimelineItemProps {
  group: any;
  index: number;
  onToggleTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  getSourceBadge: (source: Task["source"]) => { label: string; className: string } | null;
  onWaterReminderClick?: (time: string) => void;
  taskOnlyGroups: any[];
  calculateTimeGap: (currentTime: string, nextTime: string) => string | null;
}

function SortableTimelineItem({ 
  group, 
  index, 
  onToggleTask, 
  onUpdateTask, 
  getSourceBadge, 
  onWaterReminderClick,
  taskOnlyGroups,
  calculateTimeGap
}: SortableTimelineItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.time });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  let timeLabel = group.time;
  
  // Handle water reminders
  if (group.isWaterReminder) {
    timeLabel = group.time; // Just show the time, no extra emoji
  }
  // Handle water tasks
  else if (group.tasks.some((task: Task) => task.source === "water")) {
    timeLabel = group.time; // Just show the time for water tasks
  }
  // For tasks with end time, show start time, duration, and end time with line breaks
  else if (group.time !== 'no-time' && group.tasks.length > 0) {
    const taskWithEndTime = group.tasks.find((task: Task) => task.endTime);
    if (taskWithEndTime) {
      const startParts = taskWithEndTime.time?.split(":").map(Number) || group.time.split(":").map(Number);
      const endParts = taskWithEndTime.endTime.split(":").map(Number);
      const duration = (endParts[0]*60 + endParts[1]) - (startParts[0]*60 + startParts[1]);
      
      // For winddown and startup tasks, always show the time
      if (taskWithEndTime.source === 'winddown' || taskWithEndTime.source === 'startup') {
        timeLabel = `${taskWithEndTime.time}\n${duration} min\n${taskWithEndTime.endTime}`;
      } else {
        timeLabel = `${group.time}\n${duration} min\n${taskWithEndTime.endTime}`;
      }
    } else {
      // Just show the time if no end time
      timeLabel = group.time;
    }
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="relative flex items-center py-4"
      {...attributes}
      {...listeners}
    >
      {/* Time column - positioned to the left of timeline */}
      <div className="w-20 flex-shrink-0 text-right pr-3">
        <div className={`text-xs font-mono whitespace-pre-line leading-tight ${
          group.isWaterReminder || group.tasks.some((task: Task) => task.source === "water")
            ? "text-blue-600 font-medium" 
            : "text-muted-foreground"
        }`}>
          {timeLabel}
        </div>
      </div>
      
      {/* Timeline dot column - centered on the timeline line */}
      <div className="relative flex-shrink-0 w-4 flex items-center justify-center">
        {/* Dot positioned exactly on the timeline line */}
        <div 
          className={`w-3 h-3 rounded-full border-2 ${
            group.isWaterReminder || group.tasks.some((task: Task) => task.source === "water")
              ? 'bg-blue-100 border-blue-500' 
              : 'bg-background border-primary'
          }`}
          style={{
            position: 'absolute',
            left: '8px', // Center within the w-4 container
            transform: 'translateX(-50%)',
            zIndex: 1
          }}
        ></div>
        
        {/* Water emoji for water reminders and water tasks */}
        {(group.isWaterReminder || group.tasks.some((task: Task) => task.source === "water")) && (
          <button
            onClick={() => {
              if (group.isWaterReminder) {
                onWaterReminderClick?.(group.time);
              } else {
                const waterTask = group.tasks.find((task: Task) => task.source === "water");
                if (waterTask) {
                  onToggleTask(waterTask.id);
                }
              }
            }}
            className="absolute w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all hover-elevate bg-blue-100 text-blue-600 hover:bg-blue-200"
            title={`Drink water at ${group.time} - Click to log intake`}
            style={{
              left: '8px',
              transform: 'translateX(-50%)',
              zIndex: 2
            }}
          >
            💧
          </button>
        )}
      </div>
      
      {/* Content column */}
      <div className="flex-1 pl-4">
        {/* Show tasks if there are any and it's not a water reminder */}
        {!group.isWaterReminder && group.tasks && group.tasks.length > 0 && (
          <div className={`flex gap-2 ${group.tasks.length > 1 ? 'flex-wrap' : ''}`}>
            {group.tasks.map((task: Task) => (
              <div key={task.id} className={group.tasks.length > 1 ? 'flex-1 min-w-0' : 'w-full'}>
                <TimelineTask
                  task={task}
                  onToggleTask={onToggleTask}
                  onUpdateTask={onUpdateTask}
                  getSourceBadge={getSourceBadge}
                  showTime={false}
                />
              </div>
            ))}
          </div>
        )}
        
        {/* Show free time between tasks */}
        {(() => {
          const nextGroup = taskOnlyGroups[index + 1];
          const shouldShowFreeTime = nextGroup && 
            !group.isWaterReminder && 
            !nextGroup.isWaterReminder &&
            index < taskOnlyGroups.length - 1;
          
          const timeGap = shouldShowFreeTime ? calculateTimeGap(group.time, nextGroup.time) : null;
          
          return timeGap && (
            <div className="flex items-center justify-center py-2">
              <div className="bg-muted/50 rounded-full px-3 py-1 text-xs text-muted-foreground">
                {timeGap} free time
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default function Timeline({ tasks, onToggleTask, onUpdateTask, getSourceBadge, onWaterReminderClick }: Props) {
  const [timezoneUpdate, setTimezoneUpdate] = useState(0);

  useEffect(() => {
    const handleTimezoneChange = () => {
      setTimezoneUpdate(prev => prev + 1);
    };
    window.addEventListener('timezoneChanged', handleTimezoneChange);
    return () => window.removeEventListener('timezoneChanged', handleTimezoneChange);
  }, []);

  // Separate all day tasks and timed tasks
  const allDayTasks = tasks.filter(task => task.allDay);
  const timeBasedTasks = tasks.filter(task => task.time && !task.allDay);
  
  // Find wake up and go to bed tasks
  const wakeUpTask = timeBasedTasks.find(task => task.source === 'sleep' && task.sleepAction === 'wake');
  const bedTask = timeBasedTasks.find(task => task.source === 'sleep' && task.sleepAction === 'sleep');
  
  // Get water reminder times from localStorage
  const getWaterReminderTimes = () => {
    const waterSettings = JSON.parse(localStorage.getItem('water_settings') || '{}');
    if (!waterSettings.remindersEnabled || !waterSettings.addToTodo) return [];
    
    // Generate reminder times based on interval and start/end times
    const reminderTimes: string[] = [];
    const startTime = waterSettings.reminderStartTime || '08:00';
    const endTime = waterSettings.reminderEndTime || '22:00';
    const interval = waterSettings.reminderInterval || 2; // hours
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin <= endMin)) {
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      reminderTimes.push(timeStr);
      
      currentHour += interval;
      if (currentHour > endHour) break;
    }
    
    // Get wake and sleep times to exclude
    const wakeTime = wakeUpTask?.time;
    const sleepTime = bedTask?.time;
    
    // Filter out times that conflict with water tasks, wake up, or bedtime
    return reminderTimes.filter((time: string) => 
      !tasks.some(task => task.source === "water" && task.time === time) &&
      time !== wakeTime &&
      time !== sleepTime
    );
  };

  const waterReminderTimes = getWaterReminderTimes();
  
  // Combine tasks and water reminders, then group by time
  const timeGroups: Record<string, { tasks: Task[], hasWater: boolean, isSleepTask: boolean, waterTimes?: string[] }> = {};
  
  timeBasedTasks.forEach(task => {
    if (!timeGroups[task.time!]) {
      timeGroups[task.time!] = { tasks: [], hasWater: false, isSleepTask: false };
    }
    timeGroups[task.time!].tasks.push(task);
    if (task.source === 'sleep') {
      timeGroups[task.time!].isSleepTask = true;
    }
  });
  
  waterReminderTimes.forEach(time => {
    if (!timeGroups[time]) {
      timeGroups[time] = { tasks: [], hasWater: true, isSleepTask: false };
    } else {
      timeGroups[time].hasWater = true;
    }
  });
  
  // Sort time groups - ensure wake up is first, bed is last
  let sortedTimes = Object.keys(timeGroups).sort((a, b) => {
    const [aHour, aMin] = a.split(':').map(Number);
    const [bHour, bMin] = b.split(':').map(Number);
    return (aHour * 60 + aMin) - (bHour * 60 + bMin);
  });
  
  // Ensure wake up task is first
  if (wakeUpTask && wakeUpTask.time) {
    sortedTimes = sortedTimes.filter(t => t !== wakeUpTask.time);
    sortedTimes.unshift(wakeUpTask.time);
  }
  
  // Ensure bed task is last
  if (bedTask && bedTask.time) {
    sortedTimes = sortedTimes.filter(t => t !== bedTask.time);
    sortedTimes.push(bedTask.time);
  }

  // Consolidate consecutive water-only reminders
  const consolidatedTimes: string[] = [];
  let i = 0;
  while (i < sortedTimes.length) {
    const time = sortedTimes[i];
    const group = timeGroups[time];
    
    // Check if this is a water-only group
    if (group.hasWater && group.tasks.length === 0 && !group.isSleepTask) {
      // Look ahead for consecutive water-only groups
      const consecutiveWaterTimes = [time];
      let j = i + 1;
      while (j < sortedTimes.length) {
        const nextTime = sortedTimes[j];
        const nextGroup = timeGroups[nextTime];
        if (nextGroup.hasWater && nextGroup.tasks.length === 0 && !nextGroup.isSleepTask) {
          consecutiveWaterTimes.push(nextTime);
          j++;
        } else {
          break;
        }
      }
      
      // If we found consecutive water-only times, consolidate them
      if (consecutiveWaterTimes.length > 1) {
        // Use the first time as the key
        consolidatedTimes.push(time);
        timeGroups[time].waterTimes = consecutiveWaterTimes;
        i = j; // Skip the consolidated times
      } else {
        consolidatedTimes.push(time);
        i++;
      }
    } else {
      consolidatedTimes.push(time);
      i++;
    }
  }

  const hasTimeItems = consolidatedTimes.length > 0;
  const startTime = hasTimeItems ? consolidatedTimes[0] : "00:00";
  const endTime = hasTimeItems ? consolidatedTimes[consolidatedTimes.length - 1] : "23:59";

  // Calculate time gap between two times
  const calculateTimeGap = (time1: string, time2: string): string | null => {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    const minutes1 = h1 * 60 + m1;
    const minutes2 = h2 * 60 + m2;
    const diff = minutes2 - minutes1;
    if (diff <= 0) return null;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };

  return (
    <div className="w-full space-y-6">
      {/* All Day Tasks Section - Circular Design */}
      {allDayTasks.length > 0 && (
        <div className="w-full">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center">All Day / Anytime</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 justify-start">
            {allDayTasks.map(task => {
              const badge = getSourceBadge(task.source || "manual");
              const formatCompletionTime = (completedAt: string | Date) => {
                const date = completedAt instanceof Date ? completedAt : new Date(completedAt);
                return format(date, "HH:mm");
              };
              
              return (
                <div key={task.id} className="flex flex-col items-center gap-2 min-w-fit">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all ${
                      task.completed ? "bg-success/20 opacity-80" : "bg-primary/10 hover-elevate active:scale-95"
                    }`}
                  >
                    {task.emoji || "📝"}
                  </button>
                  <p className={`text-xs font-medium text-center max-w-24 truncate ${task.completed ? "line-through opacity-60" : ""}`}>
                    {task.title}
                  </p>
                  {task.completed && task.completedAt && (
                    <p className="text-xs text-green-600 font-medium">
                      ✓ {formatCompletionTime(task.completedAt)}
                    </p>
                  )}
                  {task.notes && (
                    <p className="text-xs text-muted-foreground text-center max-w-24 truncate">
                      {task.notes}
                    </p>
                  )}
                  {badge && <Badge variant="secondary" className={`${badge.className} text-xs`}>{badge.label}</Badge>}
                </div>
              );
          })}
        </div>
        </div>
      )}

      {/* Timed Tasks Timeline */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          {hasTimeItems ? `Timeline (${startTime} - ${endTime})` : 'Timeline'}
        </h3>

        {!hasTimeItems ? (
          <div className="text-center py-8 text-muted-foreground">
            No scheduled tasks for today
          </div>
        ) : (
          <div>
            {consolidatedTimes.map((time, index) => {
              const group = timeGroups[time];
              const isFirst = index === 0;
              const isLast = index === consolidatedTimes.length - 1;
              const nextTime = index < consolidatedTimes.length - 1 ? consolidatedTimes[index + 1] : null;
              const timeGap = nextTime ? calculateTimeGap(time, nextTime) : null;
              
              // Check if this is a sleep task (wake up or go to bed)
              const isSleepBoundary = group.isSleepTask && (isFirst || isLast);
              
              // Check if this is water-only (no tasks, just water reminder)
              const isWaterOnly = group.hasWater && group.tasks.length === 0;
              
              // Separate sleep tasks and regular tasks
              const sleepTasks = group.tasks.filter(task => task.source === 'sleep');
              const medicationTasks = group.tasks.filter(task => task.source === 'medication');
              const breathingTasks = group.tasks.filter(task => task.source === 'breathing');
              const officeReminderTasks = group.tasks.filter(task => 
                ['sit-stand', 'eye-break', 'posture', 'glucose', 'steps'].includes(task.source || '')
              );
              const regularTasks = group.tasks.filter(task => 
                task.source !== 'sleep' && 
                task.source !== 'medication' && 
                task.source !== 'breathing' &&
                !['sit-stand', 'eye-break', 'posture', 'glucose', 'steps'].includes(task.source || '')
              );
              
              // Check if we should align at top (first item, regardless of sleep tasks)
              const shouldAlignTop = isFirst;
              
              // Check if previous item has sleep tasks (for incoming line)
                    const prevGroup = index > 0 ? timeGroups[consolidatedTimes[index - 1]] : null;
                    const prevHasSleep = prevGroup?.tasks.some(t => t.source === 'sleep') || false;
                    
                    const nextGroup = index < consolidatedTimes.length - 1 ? timeGroups[consolidatedTimes[index + 1]] : null;
                    const nextHasSleep = nextGroup?.tasks.some(t => t.source === 'sleep') || false;
              
              return (
                <div key={time} className="relative flex items-center gap-4 min-h-[80px]">
                  {/* Time on the LEFT - centered */}
                  <div className="w-16 text-right flex-shrink-0 flex justify-end items-center">
                    {group.waterTimes && group.waterTimes.length > 1 ? (
                      // Show multiple water times stacked
                      <div className="flex flex-col items-end gap-0.5">
                        {group.waterTimes.map(wt => (
                          <span key={wt} className="text-sm font-mono text-blue-600 font-medium">
                            {wt}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className={`text-sm font-mono ${
                        group.hasWater ? 'text-blue-600 font-medium' : 
                        isSleepBoundary ? 'text-primary font-medium' : 
                        'text-muted-foreground'
                      }`}>
                        {time}
                      </span>
                    )}
                  </div>
                  
                  {/* Timeline DOT/BUTTON column - fixed width with continuous line */}
                  <div className="w-12 flex-shrink-0 flex justify-center items-center relative" style={{ minHeight: '80px' }}>
                    {/* Continuous vertical line - stops at sleep tasks */}
                    {(() => {
                      const currentTime = getCurrentTime();
                      const currentTimeStr = formatTimeString(currentTime);
                      const isPast = time < currentTimeStr;
                      const lineWidth = isPast ? 'w-1' : 'w-0.5';
                      const lineColor = isPast ? 'bg-primary' : 'bg-border';
                      
                      return (
                        <>
                          {index > 0 && (
                            <div 
                              className={`absolute ${lineWidth} ${lineColor}`}
                              style={{ 
                                left: '50%', 
                                transform: 'translateX(-50%)',
                                bottom: sleepTasks.length > 0 ? 'calc(50% + 30px)' : '50%',
                                top: prevHasSleep ? 'calc(50% - 30px)' : '-150%',
                                zIndex: 0
                              }}
                            ></div>
                          )}
                          {index < consolidatedTimes.length - 1 && (
                            <div 
                              className={`absolute ${lineWidth} ${lineColor}`}
                              style={{ 
                                left: '50%', 
                                transform: 'translateX(-50%)',
                                top: sleepTasks.length > 0 ? 'calc(50% + 30px)' : '50%',
                                bottom: nextHasSleep ? 'calc(50% + 30px)' : '-150%',
                                zIndex: 0
                              }}
                            ></div>
                          )}
                        </>
                      );
                    })()}
                    
                    {/* DOT or Button - perfectly centered */}
                    {isWaterOnly ? (
                      // Water-only: just show water button, no dot
                      <button
                        onClick={() => {
                          // If multiple water times, click the first one
                          const waterTime = group.waterTimes?.[0] || time;
                          onWaterReminderClick?.(waterTime);
                        }}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all hover-elevate bg-blue-100 text-blue-600 hover:bg-blue-200 border-2 border-blue-500 relative"
                        title={group.waterTimes ? `Drink water (${group.waterTimes.join(', ')})` : `Drink water at ${time} - Click to log intake`}
                        style={{ zIndex: 10 }}
                      >
                        💧
                      </button>
                    ) : sleepTasks.length > 0 ? (
                      // Sleep task dot with emoji inside
                      sleepTasks.map((task: Task) => (
                        <button
                          key={task.id}
                          onClick={() => onToggleTask(task.id)}
                          className={`relative w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all border-[3px] ${
                            task.completed ? "bg-success/20 border-success opacity-80" : "bg-background border-primary hover-elevate active:scale-95"
                          }`}
                          style={{ zIndex: 10 }}
                        >
                          {task.emoji || (task.sleepAction === 'wake' ? '⏰' : '🌙')}
                        </button>
                      ))
                    ) : (
                      <>
                        {/* Show regular dot for non-sleep tasks */}
                        <div className="w-3 h-3 rounded-full border-2 bg-background border-primary relative" style={{ zIndex: 10 }}></div>
                        
                        {/* Stack all reminder buttons vertically if multiple exist */}
                        {(group.hasWater || medicationTasks.length > 0 || breathingTasks.length > 0 || officeReminderTasks.length > 0) && (
                          <div className="absolute flex flex-col gap-1" style={{ zIndex: 11, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                            {/* Water button */}
                            {group.hasWater && (
                              <button
                                onClick={() => onWaterReminderClick?.(time)}
                                className="w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all hover-elevate bg-blue-100 text-blue-600 hover:bg-blue-200 border-2 border-blue-500"
                                title={`Drink water at ${time} - Click to log intake`}
                              >
                                💧
                              </button>
                            )}
                            
                            {/* Medication button */}
                            {medicationTasks.length > 0 && (
                              <button
                                onClick={() => {
                                  if (medicationTasks[0]) {
                                    onToggleTask(medicationTasks[0].id);
                                  }
                                }}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all hover-elevate border-2 ${
                                  medicationTasks[0]?.completed 
                                    ? 'bg-success/20 border-success opacity-80' 
                                    : 'bg-orange-100 text-orange-600 hover:bg-orange-200 border-orange-500'
                                }`}
                                title={medicationTasks[0]?.title}
                              >
                                💊
                              </button>
                            )}
                            
                            {/* Breathing button */}
                            {breathingTasks.length > 0 && (
                              <button
                                onClick={() => {
                                  if (breathingTasks[0]) {
                                    onToggleTask(breathingTasks[0].id);
                                  }
                                }}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all hover-elevate border-2 ${
                                  breathingTasks[0]?.completed 
                                    ? 'bg-success/20 border-success opacity-80' 
                                    : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 border-indigo-500'
                                }`}
                                title={breathingTasks[0]?.title}
                              >
                                🧘
                              </button>
                            )}
                            
                            {/* Office reminder buttons */}
                            {officeReminderTasks.map((task: Task) => {
                              const getButtonStyle = (source: string) => {
                                if (source === 'glucose') return 'bg-red-100 text-red-600 hover:bg-red-200 border-red-500';
                                if (source === 'sit-stand') return 'bg-purple-100 text-purple-600 hover:bg-purple-200 border-purple-500';
                                if (source === 'eye-break') return 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200 border-cyan-500';
                                if (source === 'posture') return 'bg-amber-100 text-amber-600 hover:bg-amber-200 border-amber-500';
                                if (source === 'steps') return 'bg-green-100 text-green-600 hover:bg-green-200 border-green-500';
                                return 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-500';
                              };
                              
                              return (
                                <button
                                  key={task.id}
                                  onClick={() => onToggleTask(task.id)}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all hover-elevate border-2 ${
                                    task.completed ? 'bg-success/20 border-success opacity-80' : getButtonStyle(task.source || '')
                                  }`}
                                  title={task.title}
                                >
                                  {task.emoji}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Regular task container(s) on the RIGHT - aligned with dot */}
                  <div className="flex-1 flex items-center">
                    {/* Show medication tasks as text on the right */}
                    {medicationTasks.length > 0 && (
                      <div className="flex-1 pl-3">
                        {medicationTasks.map((medTask: Task) => (
                          <p key={medTask.id} className={`text-sm ${medTask.completed ? 'line-through opacity-60' : ''}`}>
                            {medTask.title}
                          </p>
                        ))}
                      </div>
                    )}
                    
                    {regularTasks.length > 0 && (
                      <div className={`flex gap-2 w-full ${regularTasks.length > 1 ? 'flex-row' : ''}`}>
                        {/* Sort tasks: tasks with end time first, then tasks without */}
                        {[...regularTasks]
                          .sort((a, b) => {
                            const aHasEndTime = !!a.endTime;
                            const bHasEndTime = !!b.endTime;
                            if (aHasEndTime && !bHasEndTime) return -1;
                            if (!aHasEndTime && bHasEndTime) return 1;
                            return 0;
                          })
                          .map((task: Task) => {
                            const hasNoEndTime = !task.endTime && !task.allDay;
                            const badge = getSourceBadge(task.source || "manual");
                            
                            if (hasNoEndTime) {
                              // Show as round button with title below - only emoji aligned with dot
                              return (
                                <div key={task.id} className="flex flex-col items-center">
                                  <button
                                    onClick={() => onToggleTask(task.id)}
                                    className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
                                      task.completed ? "bg-success/20 opacity-80" : "bg-primary/10 hover-elevate active:scale-95"
                                    }`}
                                  >
                                    {task.emoji || "📝"}
                                  </button>
                                  <p className={`text-xs font-medium text-center max-w-24 truncate mt-1 ${task.completed ? "line-through opacity-60" : ""}`}>
                                    {task.title}
                                  </p>
                                  {badge && <Badge variant="secondary" className={`${badge.className} text-xs mt-1`}>{badge.label}</Badge>}
                                </div>
                              );
                            }
                            
                            // Show as regular card for tasks with end time
                            return (
                              <div key={task.id} className={regularTasks.length > 1 ? 'flex-1' : 'w-full'}>
            <TimelineTask
              task={task}
              onToggleTask={onToggleTask}
                                  onUpdateTask={onUpdateTask}
              getSourceBadge={getSourceBadge}
                                  showTime={false}
                                />
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
        )}
      </div>
    </div>
  );
}