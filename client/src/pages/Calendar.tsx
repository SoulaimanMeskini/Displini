import { useState } from "react";
import CalendarView from "@/components/CalendarView";
import EventList from "@/components/EventList";
import ThemeToggle from "@/components/ThemeToggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  time: string;
  addToTodo?: boolean;
}

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: "1", date: new Date(), title: "Team Meeting", time: "10:00", addToTodo: false },
    { id: "2", date: new Date(), title: "Gym Session", time: "18:00", addToTodo: true },
  ]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");

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
        <ThemeToggle />
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
