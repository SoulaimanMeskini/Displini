import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, parseISO } from "date-fns";

export interface Task {
  id: string;
  title: string;
  emoji?: string;
  completed: boolean;
  dueDate?: Date | string;
  time?: string;
  allDay?: boolean;
  source: "manual" | "food" | "calendar" | "medication" | "workout" | "sleep";
  medicationId?: string;
  sleepAction?: string;
}

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (task: Omit<Task, "id">) => void;
}

const taskEmojis = ["✅", "📝", "🎯", "💡", "🚀", "⭐", "🔥", "💪", "📱", "💼", "🏠", "🛒", "📚", "✉️", "📞"];

export default function TaskList({ tasks, onToggleTask, onDeleteTask, onAddTask }: TaskListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [time, setTime] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("✅");

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  const handleSubmit = () => {
    if (title) {
      onAddTask({
        title,
        emoji: selectedEmoji,
        completed: false,
        dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
        time: allDay ? undefined : (time || undefined),
        allDay,
        source: "manual",
      });
      setTitle("");
      setDueDate("");
      setTime("");
      setAllDay(false);
      setSelectedEmoji("✅");
      setIsOpen(false);
    }
  };

  const getSourceBadge = (source: Task["source"]) => {
    const config = {
      manual: { label: "Manual", className: "bg-muted text-muted-foreground" },
      food: { label: "Food", className: "bg-chart-2/20 text-chart-2" },
      calendar: { label: "Calendar", className: "bg-chart-1/20 text-chart-1" },
      medication: { label: "Health", className: "bg-destructive/20 text-destructive" },
      workout: { label: "Sport", className: "bg-success/20 text-success" },
      sleep: { label: "Sleep", className: "bg-primary/20 text-primary" },
    };
    return config[source];
  };

  const parseDate = (date: Date | string | undefined) => {
    if (!date) return undefined;
    if (typeof date === 'string') {
      try {
        return parseISO(date);
      } catch {
        return undefined;
      }
    }
    return date;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.allDay && !b.allDay) return -1;
    if (!a.allDay && b.allDay) return 1;
    if (a.allDay && b.allDay) return 0;
    
    if (!a.time && b.time) return 1;
    if (a.time && !b.time) return -1;
    if (a.time && b.time) {
      return a.time.localeCompare(b.time);
    }
    return 0;
  });

  const allDayTasks = sortedTasks.filter(t => t.allDay && !t.completed);
  const timedTasks = sortedTasks.filter(t => !t.allDay && !t.completed);
  const completedTasks = sortedTasks.filter(t => t.completed);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-2xl font-bold font-mono" data-testid="text-task-progress">
              {completedCount}/{totalCount}
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-task">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Choose Emoji</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {taskEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setSelectedEmoji(emoji)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                          selectedEmoji === emoji
                            ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                            : "bg-muted hover-elevate"
                        }`}
                        data-testid={`button-emoji-${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="task-title">Task Title</Label>
                  <Input
                    id="task-title"
                    placeholder="What needs to be done?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    data-testid="input-task-title"
                  />
                </div>
                <div>
                  <Label htmlFor="task-due-date">Due Date (Optional)</Label>
                  <Input
                    id="task-due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    data-testid="input-task-due-date"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="all-day">All Day Task</Label>
                  <Switch
                    id="all-day"
                    checked={allDay}
                    onCheckedChange={setAllDay}
                    data-testid="switch-all-day"
                  />
                </div>
                {!allDay && (
                  <div>
                    <Label htmlFor="task-time">Time (Optional)</Label>
                    <Input
                      id="task-time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      data-testid="input-task-time"
                    />
                  </div>
                )}
                <Button onClick={handleSubmit} className="w-full" data-testid="button-submit-task">
                  Add Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No tasks yet. Add your first task!</p>
          </Card>
        ) : (
          <>
            {allDayTasks.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">All Day</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allDayTasks.map((task) => {
                    const badge = getSourceBadge(task.source);
                    return (
                      <div key={task.id} className="flex flex-col items-center gap-2 min-w-fit" data-testid={`card-task-${task.id}`}>
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="w-20 h-20 rounded-full bg-primary/10 hover-elevate flex items-center justify-center text-3xl transition-transform active:scale-95"
                          data-testid={`checkbox-task-${task.id}`}
                        >
                          {task.emoji || '✅'}
                        </button>
                        <p className="text-xs font-medium text-center max-w-20 truncate" data-testid={`text-task-title-${task.id}`}>
                          {task.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onDeleteTask(task.id)}
                          data-testid={`button-delete-task-${task.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {timedTasks.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Timeline</h3>
                {timedTasks.map((task) => {
                  const badge = getSourceBadge(task.source);
                  const taskDate = parseDate(task.dueDate);
                  return (
                    <Card key={task.id} className="p-4 hover-elevate" data-testid={`card-task-${task.id}`}>
                      <div className="flex items-start gap-3">
                        {task.time && (
                          <div className="flex flex-col items-center min-w-fit">
                            <Clock className="w-4 h-4 text-muted-foreground mb-1" />
                            <p className="text-sm font-mono font-semibold">{task.time}</p>
                          </div>
                        )}
                        {task.emoji && (
                          <div className="text-2xl mt-1">{task.emoji}</div>
                        )}
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => onToggleTask(task.id)}
                          className="mt-1"
                          data-testid={`checkbox-task-${task.id}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium mb-2" data-testid={`text-task-title-${task.id}`}>{task.title}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className={badge.className}>
                              {badge.label}
                            </Badge>
                            {taskDate && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <CalendarIcon className="w-3 h-3" />
                                {format(taskDate, "MMM d")}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteTask(task.id)}
                          data-testid={`button-delete-task-${task.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {completedTasks.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
                {completedTasks.map((task) => {
                  const badge = getSourceBadge(task.source);
                  return (
                    <Card key={task.id} className="p-4 hover-elevate opacity-60" data-testid={`card-task-${task.id}`}>
                      <div className="flex items-start gap-3">
                        {task.emoji && (
                          <div className="text-2xl mt-1">{task.emoji}</div>
                        )}
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => onToggleTask(task.id)}
                          className="mt-1"
                          data-testid={`checkbox-task-${task.id}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-through mb-2" data-testid={`text-task-title-${task.id}`}>
                            {task.title}
                          </p>
                          <Badge variant="secondary" className={badge.className}>
                            {badge.label}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteTask(task.id)}
                          data-testid={`button-delete-task-${task.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
