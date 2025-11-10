// import ProgressAndAddTask from "./ProgressAndAddTask"; // Component not found
import AllDayTasks from "./AllDayTasks";
import Timeline from "./Timeline";
import { Task } from "@/app/types/types";

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
    
    const config: Record<string, { label: string; className: string }> = {
      food: { label: "Food", className: "bg-chart-2/20 text-chart-2" },
      calendar: { label: "Calendar", className: "bg-chart-1/20 text-chart-1" },
      medication: { label: "Health", className: "bg-destructive/20 text-destructive" },
      workout: { label: "Sport", className: "bg-success/20 text-success" },
      sleep: { label: "Sleep", className: "bg-primary/20 text-primary" },
      water: { label: "Water", className: "bg-blue-500/20 text-blue-500" },
      breathing: { label: "Breathing", className: "bg-teal-500/20 text-teal-500" },
      reminder: { label: "Reminder", className: "bg-yellow-500/20 text-yellow-500" },
      steps: { label: "Steps", className: "bg-green-500/20 text-green-500" },
      work: { label: "Work", className: "bg-orange-500/20 text-orange-500" },
      school: { label: "School", className: "bg-indigo-500/20 text-indigo-500" },
      salary: { label: "Salary", className: "bg-emerald-500/20 text-emerald-500" },
      winddown: { label: "Wind Down", className: "bg-purple-500/20 text-purple-500" },
      startup: { label: "Start Up", className: "bg-amber-500/20 text-amber-500" },
      menstrual: { label: "Menstrual", className: "bg-pink-500/20 text-pink-500" },
    };
    return config[source] || null;
  };

  return (
    <div className="space-y-6 w-full flex flex-col items-center">
      {/* ProgressAndAddTask component not found - would go here */}
      {allDayTasks.length > 0 && <AllDayTasks tasks={allDayTasks} onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} getSourceBadge={getSourceBadge} />}
      {timelineTasks.length > 0 && <Timeline tasks={timelineTasks} onToggleTask={onToggleTask} onUpdateTask={onUpdateTask} getSourceBadge={getSourceBadge} onWaterReminderClick={onWaterReminderClick} />}
    </div>
  );
}