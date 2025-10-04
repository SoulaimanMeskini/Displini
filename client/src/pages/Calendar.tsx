import { useState, useEffect } from "react";
import CalendarView from "@/components/CalendarView";
import EventList from "@/components/EventList";
import ThemeToggle from "@/components/ThemeToggle";
import Settings from "@/components/Settings";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addDays, isSameDay, isWithinInterval } from "date-fns";

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  time: string;
  addToTodo?: boolean;
  type?: 'event' | 'period';
}

interface CyclePeriod {
  id: string;
  startDate: string;
  cycleLength: number;
}

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");

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
    if (newEventTitle && newEventTime) {
      setEvents([
        ...events,
        {
          id: Date.now().toString(),
          date: selectedDate,
          title: newEventTitle,
          time: newEventTime,
          addToTodo: false,
          type: 'event',
        },
      ]);
      setNewEventTitle("");
      setNewEventTime("");
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const handleToggleTodo = (id: string, addToTodo: boolean) => {
    setEvents(events.map((e) => (e.id === id ? { ...e, addToTodo } : e)));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Calendar</h1>
        <div className="flex gap-2">
          <Settings />
          <ThemeToggle />
        </div>
      </header>

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
              <Label htmlFor="event-title">Event Title</Label>
              <Input
                id="event-title"
                placeholder="Team meeting"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                data-testid="input-event-title"
              />
            </div>
            <div>
              <Label htmlFor="event-time">Time</Label>
              <Input
                id="event-time"
                type="time"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
                data-testid="input-event-time"
              />
            </div>
            <Button onClick={handleSubmitEvent} className="w-full" data-testid="button-submit-event">
              Add Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
