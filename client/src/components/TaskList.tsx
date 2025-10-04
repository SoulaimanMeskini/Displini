import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  source: "manual" | "food" | "calendar";
}

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (task: Omit<Task, "id">) => void;
}

export default function TaskList({ tasks, onToggleTask, onDeleteTask, onAddTask }: TaskListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  const handleSubmit = () => {
    if (title) {
      onAddTask({
        title,
        completed: false,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        source: "manual",
      });
      setTitle("");
      setDueDate("");
      setIsOpen(false);
    }
  };

  const getSourceBadge = (source: Task["source"]) => {
    const config = {
      manual: { label: "Manual", className: "bg-muted text-muted-foreground" },
      food: { label: "Food", className: "bg-chart-2/20 text-chart-2" },
      calendar: { label: "Calendar", className: "bg-chart-1/20 text-chart-1" },
    };
    return config[source];
  };

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
            {tasks.filter((t) => !t.completed).length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Active</h3>
                {tasks
                  .filter((t) => !t.completed)
                  .map((task) => {
                    const badge = getSourceBadge(task.source);
                    return (
                      <Card key={task.id} className="p-4 hover-elevate" data-testid={`card-task-${task.id}`}>
                        <div className="flex items-start gap-3">
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
                              {task.dueDate && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <CalendarIcon className="w-3 h-3" />
                                  {format(task.dueDate, "MMM d")}
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

            {tasks.filter((t) => t.completed).length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
                {tasks
                  .filter((t) => t.completed)
                  .map((task) => {
                    const badge = getSourceBadge(task.source);
                    return (
                      <Card key={task.id} className="p-4 hover-elevate opacity-60" data-testid={`card-task-${task.id}`}>
                        <div className="flex items-start gap-3">
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
