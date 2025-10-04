import { useState, useEffect } from "react";
import CalendarView from "@/components/CalendarView";
import EventList from "@/components/EventList";
import PageHeader from "@/components/PageHeader";
import MonthlyStatsModal from "@/components/MonthlyStatsModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { addDays, isSameDay, isWithinInterval } from "date-fns";
import type { CalendarEvent } from "@/types/calendar";

interface CyclePeriod {
  id: string;
  startDate: string;
  cycleLength: number;
}

export default function Calendar() {
  const [showStats, setShowStats] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventStartTime, setNewEventStartTime] = useState("");
  const [newEventEndTime, setNewEventEndTime] = useState("");
  const [newEventAllDay, setNewEventAllDay] = useState(false);
  const [newEventEmoji, setNewEventEmoji] = useState("📅");

  useEffect(() => {
    const savedEvents = localStorage.getItem("calendarEvents");
    if (savedEvents) {
      const parsed = JSON.parse(savedEvents);
      setEvents(parsed.map((e: any) => ({ ...e, date: new Date(e.date) })));
    }

    generateCycleEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      const eventsToSave = events
        .filter(e => e.type !== 'period')
        .map(e => ({ ...e, date: e.date.toISOString() }));
      localStorage.setItem("calendarEvents", JSON.stringify(eventsToSave));
    }
  }, [events]);

  const generateCycleEvents = () => {
    const savedCycles = localStorage.getItem("menstrualCycles");
    if (!savedCycles) return;

    const cycles: CyclePeriod[] = JSON.parse(savedCycles);
    if (cycles.length === 0) return;

    const periodEvents: CalendarEvent[] = [];
    const avgLength = cycles.reduce((sum, c) => sum + c.cycleLength, 0) / cycles.length;
    
    cycles.forEach(cycle => {
      const startDate = new Date(cycle.startDate);
      for (let i = 0; i < 5; i++) {
        periodEvents.push({
          id: `period-${cycle.id}-${i}`,
          date: addDays(startDate, i),
          title: i === 0 ? "🩸 Period Start" : "🩸 Period",
          time: "",
          type: 'period',
        });
      }
    });

    const lastCycle = cycles[0];
    const nextPeriodStart = addDays(new Date(lastCycle.startDate), Math.round(avgLength));
    for (let i = 0; i < 5; i++) {
      periodEvents.push({
        id: `period-predicted-${i}`,
        date: addDays(nextPeriodStart, i),
        title: i === 0 ? "🩸 Period (predicted)" : "🩸 Period (predicted)",
        time: "",
        type: 'period',
      });
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
      };
      setEvents([...events, newEvent]);
      setNewEventTitle("");
      setNewEventStartTime("");
      setNewEventEndTime("");
      setNewEventAllDay(false);
      setNewEventEmoji("📅");
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Calendar" onStatsClick={() => setShowStats(true)} />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
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
