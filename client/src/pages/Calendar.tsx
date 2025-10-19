import { useState, useEffect } from "react";
import CalendarView from "@/components/calendar/CalendarView";
import EventList from "@/components/calendar/EventList";
import PageHeader from "@/components/PageHeader";
import MonthlyStatsModal from "@/components/MonthlyStatsModal";
import { DateCarousel } from "@/components/DateCarousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { addDays, isSameDay, isWithinInterval, format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { Calendar as CalendarIcon, List, Clock, LayoutGrid, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import type { CalendarEvent } from "@/types/calendar";

interface CyclePeriod {
  id: string;
  startDate: string;
  cycleLength: number;
}

type ViewMode = "month" | "week" | "day" | "list";

export default function Calendar() {
  const [showStats, setShowStats] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showTodosInCalendar, setShowTodosInCalendar] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventStartTime, setNewEventStartTime] = useState("");
  const [newEventEndTime, setNewEventEndTime] = useState("");
  const [newEventAllDay, setNewEventAllDay] = useState(false);
  const [newEventEmoji, setNewEventEmoji] = useState("📅");
  const [newEventLocation, setNewEventLocation] = useState("");

  useEffect(() => {
    const savedEvents = localStorage.getItem("calendarEvents");
    if (savedEvents) {
      const parsed = JSON.parse(savedEvents);
      setEvents(parsed.map((e: any) => ({ ...e, date: new Date(e.date) })));
    }

    // Load setting
    const savedSetting = localStorage.getItem("showTodosInCalendar") === "true";
    setShowTodosInCalendar(savedSetting);

    generateCycleEvents();
  }, []);

  // Listen for menstrual data updates
  useEffect(() => {
    const handleMenstrualUpdate = () => {
      generateCycleEvents();
    };

    window.addEventListener('menstrualDataUpdated', handleMenstrualUpdate);
    return () => window.removeEventListener('menstrualDataUpdated', handleMenstrualUpdate);
  }, []);

  // Listen for setting changes
  useEffect(() => {
    const handleSettingChange = () => {
      const savedSetting = localStorage.getItem("showTodosInCalendar") === "true";
      setShowTodosInCalendar(savedSetting);
      loadTodoTasks();
    };

    window.addEventListener('calendarTodosSettingChanged', handleSettingChange);
    window.addEventListener('todosUpdated', handleSettingChange);

    return () => {
      window.removeEventListener('calendarTodosSettingChanged', handleSettingChange);
      window.removeEventListener('todosUpdated', handleSettingChange);
    };
  }, []);

  // Load todo tasks when setting is enabled
  useEffect(() => {
    loadTodoTasks();
  }, [showTodosInCalendar]);

  const loadTodoTasks = () => {
    if (!showTodosInCalendar) {
      // Remove todo-based events
      setEvents(prev => prev.filter(e => e.type !== 'todo'));
      return;
    }

    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    const todoEvents: CalendarEvent[] = todos
      .filter((t: any) => t.dueDate && !t.completed) // Only show uncompleted todos with a date
      .map((t: any) => ({
        id: `todo-${t.id}`,
        date: new Date(t.dueDate),
        title: t.title,
        time: t.time,
        startTime: t.time,
        endTime: t.endTime,
        allDay: t.isAllDay || !t.time,
        emoji: t.emoji || '✓',
        type: 'todo' as const,
        addToTodo: false,
      }));

    // Merge with existing non-todo events
    setEvents(prev => {
      const nonTodoEvents = prev.filter(e => e.type !== 'todo');
      return [...nonTodoEvents, ...todoEvents];
    });
  };

  useEffect(() => {
    if (events.length > 0) {
      const eventsToSave = events
        .filter(e => e.type !== 'period' && e.type !== 'todo') // Don't save auto-generated events
        .map(e => ({ ...e, date: e.date.toISOString() }));
      localStorage.setItem("calendarEvents", JSON.stringify(eventsToSave));
    }
  }, [events]);

  const generateCycleEvents = () => {
    const savedCycles = localStorage.getItem("menstrualCycles");
    const savedSettings = localStorage.getItem("menstrualSettings");
    
    if (!savedCycles && !savedSettings) return;

    const cycles: CyclePeriod[] = savedCycles ? JSON.parse(savedCycles) : [];
    const settings = savedSettings ? JSON.parse(savedSettings) : { averageCycleLength: 28, averagePeriodDuration: 5 };
    
    if (cycles.length === 0 && !settings.isSetup) return;

    const periodEvents: CalendarEvent[] = [];
    
    // Generate events for actual logged periods
    cycles.forEach(cycle => {
      const startDate = new Date(cycle.startDate);
      const duration = cycle.periodDuration || settings.averagePeriodDuration;
      
      for (let i = 0; i < duration; i++) {
        periodEvents.push({
          id: `period-${cycle.id}-${i}`,
          date: addDays(startDate, i),
          title: i === 0 ? "Period Start" : "Period",
          emoji: '🌸',
          time: "",
          type: 'period',
          allDay: true,
        });
      }
    });

    // Generate predicted events
    if (cycles.length > 0) {
      const lastCycle = cycles[0];
      const avgLength = cycles.reduce((sum, c) => sum + (c.cycleLength || settings.averageCycleLength), 0) / cycles.length;
      const nextPeriodStart = addDays(new Date(lastCycle.startDate), Math.round(avgLength));
      
      for (let i = 0; i < settings.averagePeriodDuration; i++) {
        periodEvents.push({
          id: `period-predicted-${i}`,
          date: addDays(nextPeriodStart, i),
          title: i === 0 ? "Period (predicted)" : "Period (predicted)",
          emoji: '🌸',
          time: "",
          type: 'period',
          allDay: true,
        });
      }
    } else if (settings.isSetup) {
      // Generate initial prediction if no cycles logged yet
      const today = new Date();
      const predictedStart = addDays(today, settings.averageCycleLength);
      
      for (let i = 0; i < settings.averagePeriodDuration; i++) {
        periodEvents.push({
          id: `period-initial-prediction-${i}`,
          date: addDays(predictedStart, i),
          title: i === 0 ? "Period (predicted)" : "Period (predicted)",
          emoji: '🌸',
          time: "",
          type: 'period',
          allDay: true,
        });
      }
    }

    setEvents(prev => {
      const nonPeriodEvents = prev.filter(e => e.type !== 'period');
      return [...nonPeriodEvents, ...periodEvents];
    });
  };

  const handleAddEvent = () => {
    setIsAddDialogOpen(true);
  };

  const handleSubmitEvent = () => {
    if (newEventTitle && (newEventStartTime || newEventAllDay)) {
      const newEvent = {
        id: Date.now().toString(),
        date: selectedDate,
        title: newEventTitle,
        startTime: newEventAllDay ? undefined : newEventStartTime,
        endTime: newEventAllDay ? undefined : newEventEndTime,
        allDay: newEventAllDay,
        emoji: newEventEmoji,
        addToTodo: false,
        type: 'event' as const,
        location: newEventLocation || undefined,
      };
      setEvents([...events, newEvent]);
      setNewEventTitle("");
      setNewEventStartTime("");
      setNewEventEndTime("");
      setNewEventAllDay(false);
      setNewEventEmoji("📅");
      setNewEventLocation("");
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const handleToggleTodo = (id: string, addToTodo: boolean) => {
    setEvents(events.map((e) => (e.id === id ? { ...e, addToTodo } : e)));
    
    if (addToTodo) {
      const event = events.find(e => e.id === id);
      if (event) {
        const todos = JSON.parse(localStorage.getItem("todos") || "[]");
        const newTodo = {
          id: `cal-${event.id}`,
          title: event.title,
          emoji: event.emoji || '📅',
          completed: false,
          dueDate: event.date.toISOString(),
          time: event.allDay ? undefined : (event.startTime || event.time),
          allDay: event.allDay,
          source: 'calendar',
        };
        todos.push(newTodo);
        localStorage.setItem("todos", JSON.stringify(todos));
      }
    } else {
      const todos = JSON.parse(localStorage.getItem("todos") || "[]");
      const filteredTodos = todos.filter((t: any) => t.id !== `cal-${id}`);
      localStorage.setItem("todos", JSON.stringify(filteredTodos));
    }
  };

  // Get reminders from localStorage
  const getReminders = () => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : [];
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-16">
      <PageHeader title="Calendar" icon={CalendarIcon} onStatsClick={() => setShowStats(true)} />

      <main className="w-full max-w-md lg:max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Date Carousel */}
        <DateCarousel 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        
        {/* View Mode Selector */}
        <Card className="p-3">
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("month")}
              className="flex flex-col gap-1 h-auto py-2"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-xs">Month</span>
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("week")}
              className="flex flex-col gap-1 h-auto py-2"
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="text-xs">Week</span>
            </Button>
            <Button
              variant={viewMode === "day" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("day")}
              className="flex flex-col gap-1 h-auto py-2"
            >
              <Clock className="w-4 h-4" />
              <span className="text-xs">Day</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="flex flex-col gap-1 h-auto py-2"
            >
              <List className="w-4 h-4" />
              <span className="text-xs">List</span>
            </Button>
          </div>
        </Card>

        {/* Month View */}
        {viewMode === "month" && (
          <>
            <CalendarView
              events={events}
              onDateSelect={setSelectedDate}
              onAddEvent={handleAddEvent}
              selectedDate={selectedDate}
            />
            <EventList
              events={events}
              selectedDate={selectedDate}
              onDeleteEvent={handleDeleteEvent}
              onToggleTodo={handleToggleTodo}
            />
          </>
        )}

        {/* Week View */}
        {viewMode === "week" && (
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Week of {format(startOfWeek(selectedDate), "MMM d")}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {eachDayOfInterval({
                start: startOfWeek(selectedDate),
                end: endOfWeek(selectedDate)
              }).map(day => {
                const dayEvents = events.filter(e => isSameDay(e.date, day));
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div key={day.toString()} className={`p-3 rounded-lg border ${isToday ? 'border-primary bg-primary/5' : 'border-muted'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{format(day, "EEE")}</span>
                        <span className="text-sm text-muted-foreground">{format(day, "MMM d")}</span>
                        {isToday && <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">Today</span>}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedDate(day);
                          handleAddEvent();
                        }}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    {dayEvents.length > 0 ? (
                      <div className="space-y-1">
                        {dayEvents.map(event => (
                          <div key={event.id} className="text-sm p-2 rounded bg-muted/50 flex items-center gap-2">
                            <span>{event.emoji || '📅'}</span>
                            <span className="flex-1 truncate">{event.title}</span>
                            {!event.allDay && (event.startTime || event.time) && (
                              <span className="text-xs text-muted-foreground">{event.startTime || event.time}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No events</p>
                    )}
                  </div>
                );
              })}
            </div>
            
            <Button onClick={handleAddEvent} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </Card>
        )}

        {/* Day View */}
        {viewMode === "day" && (
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {format(selectedDate, "EEEE, MMM d, yyyy")}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <EventList
              events={events}
              selectedDate={selectedDate}
              onDeleteEvent={handleDeleteEvent}
              onToggleTodo={handleToggleTodo}
            />

            <Button onClick={handleAddEvent} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </Card>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">All Events</h3>
                <div className="text-sm text-muted-foreground">
                  {events.filter(e => e.type !== 'period' && e.type !== 'todo').length} events
                </div>
              </div>
              
              <div className="space-y-3">
                {events
                  .filter(e => e.type !== 'period' && e.type !== 'todo')
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .map(event => (
                    <div key={event.id} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{event.emoji || '📅'}</span>
                            <span className="font-medium">{event.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CalendarIcon className="w-3 h-3" />
                            <span>{format(event.date, "EEE, MMM d, yyyy")}</span>
                            {!event.allDay && (event.startTime || event.time) && (
                              <>
                                <Clock className="w-3 h-3 ml-2" />
                                <span>{event.startTime || event.time}</span>
                                {event.endTime && <span>- {event.endTime}</span>}
                              </>
                            )}
                          </div>
                          {event.location && (
                            <p className="text-xs text-muted-foreground mt-1">
                              📍 {event.location}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                
                {events.filter(e => e.type !== 'period' && e.type !== 'todo').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No events scheduled</p>
                )}
              </div>
            </Card>

            {/* Reminders Section */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">📋 Reminders</h3>
              <div className="space-y-2">
                {getReminders().map((reminder: any) => (
                  <div key={reminder.id} className="p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{reminder.emoji || '🔔'}</span>
                      <span className="font-medium">{reminder.title}</span>
                    </div>
                    {reminder.subtasks && reminder.subtasks.length > 0 && (
                      <p className="text-xs text-muted-foreground pl-7">
                        {reminder.subtasks.length} subtask{reminder.subtasks.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                ))}
                
                {getReminders().length === 0 && (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    No unscheduled reminders
                  </p>
                )}
              </div>
            </Card>

            <Button onClick={handleAddEvent} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        )}
      </main>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Choose Emoji</Label>
              <div className="flex gap-2 mt-2">
                {['📅', '🎉', '🎯', '💼', '🏋️', '🎓', '✈️', '🎂'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewEventEmoji(emoji)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                      newEventEmoji === emoji
                        ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                        : "bg-muted hover-elevate"
                    }`}
                    data-testid={`button-event-emoji-${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="event-title">Event Title</Label>
              <Input
                id="event-title"
                placeholder="Team meeting"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                data-testid="input-event-title"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="event-all-day">All Day Event</Label>
              <Switch
                id="event-all-day"
                checked={newEventAllDay}
                onCheckedChange={setNewEventAllDay}
                data-testid="switch-event-all-day"
              />
            </div>
            {!newEventAllDay && (
              <>
                <div>
                  <Label htmlFor="event-start-time">Start Time</Label>
                  <Input
                    id="event-start-time"
                    type="time"
                    value={newEventStartTime}
                    onChange={(e) => setNewEventStartTime(e.target.value)}
                    data-testid="input-event-start-time"
                  />
                </div>
                <div>
                  <Label htmlFor="event-end-time">End Time (optional)</Label>
                  <Input
                    id="event-end-time"
                    type="time"
                    value={newEventEndTime}
                    onChange={(e) => setNewEventEndTime(e.target.value)}
                    data-testid="input-event-end-time"
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="event-location">Location (optional)</Label>
              <Input
                id="event-location"
                placeholder="e.g., Office, Home, Gym"
                value={newEventLocation}
                onChange={(e) => setNewEventLocation(e.target.value)}
                data-testid="input-event-location"
              />
            </div>
            <Button onClick={handleSubmitEvent} className="w-full" data-testid="button-submit-event">
              Add Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MonthlyStatsModal open={showStats} onOpenChange={setShowStats} />
    </div>
  );
}
