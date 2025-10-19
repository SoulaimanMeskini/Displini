import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import { Task } from "./types";
import { format } from "date-fns";

interface Props {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  getSourceBadge: (source: Task["source"]) => { label: string; className: string } | null;
}

export default function AllDayTasks({ tasks, onToggleTask, onEditTask, onDeleteTask, getSourceBadge }: Props) {
  const formatCompletionTime = (completedAt: string | Date) => {
    const date = completedAt instanceof Date ? completedAt : new Date(completedAt);
    return format(date, "HH:mm");
  };

  return (
    <div className="space-y-3 w-full max-w-lg mx-auto">
      <h3 className="text-sm font-medium text-muted-foreground text-center">All Day / Anytime</h3>
      <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
        {tasks.map(task => {
          const badge = getSourceBadge(task.source || "manual");
          return (
            <div key={task.id} className="flex flex-col items-center gap-2 min-w-fit">
              <button
                onClick={() => onToggleTask(task.id)}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all ${
                  task.completed 
                    ? "opacity-80" 
                    : "bg-primary/10 hover-elevate active:scale-95"
                }`}
                style={task.completed && task.color ? { backgroundColor: task.color + '33' } : task.completed ? { backgroundColor: 'hsl(var(--primary) / 0.2)' } : undefined}
              >
                {task.emoji || ""}
              </button>
              <p className={`text-xs font-medium text-center max-w-24 truncate ${task.completed ? "line-through opacity-60" : ""}`}>
                {task.title}
              </p>
              {task.completed && task.completedAt && (
                <p 
                  className="text-xs font-medium"
                  style={task.color ? { color: task.color } : { color: 'hsl(var(--primary))' }}
                >
                  {formatCompletionTime(task.completedAt)}
                </p>
              )}
              {badge && <Badge variant="secondary" className={badge.className}>{badge.label}</Badge>}
              <div className="flex items-center gap-1">
                {onEditTask && (
                  <Button variant="ghost" className="h-6 w-6 p-0" onClick={() => onEditTask(task)}>
                    <Edit2 className="w-3 h-3" />
                  </Button>
                )}
                <Button variant="ghost" className="h-6 w-6 p-0" onClick={() => onDeleteTask(task.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}