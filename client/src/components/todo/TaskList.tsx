import ProgressAndAddTask from "./ProgressAndAddTask";
import AllDayTasks from "./AllDayTasks";
import Timeline from "./Timeline";
import { Task } from "./types";

interface Props {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (task: Omit<Task, "id">) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onWaterReminderClick?: (time: string) => void;
}

export default function TaskList({ tasks, onToggleTask, onDeleteTask, onAddTask, onUpdateTask, onWaterReminderClick }: Props) {
  const completedCount = tasks.filter(t => t.completed).length;

  const allDayTasks = tasks.filter(t => t.allDay || (!t.allDay && !t.time));
  const timelineTasks = tasks.filter(t => t.time && !t.allDay);

  const getSourceBadge = (source: Task["source"]) => {
    if (!source || source === "manual") {
      return null; // Don't show badge for manual tasks
    }
    
    const config = {
      food: { label: "Food", className: "bg-chart-2/20 text-chart-2" },
      calendar: { label: "Calendar", className: "bg-chart-1/20 text-chart-1" },
      medication: { label: "Health", className: "bg-destructive/20 text-destructive" },
      workout: { label: "Sport", className: "bg-success/20 text-success" },
      sleep: { label: "Sleep", className: "bg-primary/20 text-primary" },
      water: { label: "Water", className: "bg-blue-500/20 text-blue-500" },
    } as const;
    return config[source] || null;
  };

  return (
    <div className="space-y-6 w-full flex flex-col items-center">
      <ProgressAndAddTask completed={completedCount} total={tasks.length} onAddTask={onAddTask} />
      {allDayTasks.length > 0 && <AllDayTasks tasks={allDayTasks} onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} getSourceBadge={getSourceBadge} />}
      {timelineTasks.length > 0 && <Timeline tasks={timelineTasks} onToggleTask={onToggleTask} onUpdateTask={onUpdateTask} getSourceBadge={getSourceBadge} onWaterReminderClick={onWaterReminderClick} />}
    </div>
  );
}