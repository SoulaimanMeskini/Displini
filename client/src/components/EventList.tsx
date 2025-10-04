import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  time: string;
  addToTodo?: boolean;
}

interface EventListProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onDeleteEvent: (id: string) => void;
  onToggleTodo: (id: string, addToTodo: boolean) => void;
}

export default function EventList({ events, selectedDate, onDeleteEvent, onToggleTodo }: EventListProps) {
  const dayEvents = events.filter(
    (event) => format(event.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Events for {format(selectedDate, "MMM d, yyyy")}
      </h3>

      {dayEvents.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No events for this day</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {dayEvents.map((event) => (
            <Card key={event.id} className="p-4 hover-elevate" data-testid={`card-event-${event.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-mono text-muted-foreground">{event.time}</span>
                  </div>
                  <p className="font-medium mb-3" data-testid={`text-event-title-${event.id}`}>{event.title}</p>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`todo-${event.id}`}
                      checked={event.addToTodo}
                      onCheckedChange={(checked) => onToggleTodo(event.id, !!checked)}
                      data-testid={`checkbox-add-to-todo-${event.id}`}
                    />
                    <label
                      htmlFor={`todo-${event.id}`}
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      Add to To Do list
                    </label>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteEvent(event.id)}
                  data-testid={`button-delete-event-${event.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
