import { useState } from "react";
import TaskList, { Task } from "@/components/TaskList";
import ThemeToggle from "@/components/ThemeToggle";
import Settings from "@/components/Settings";

export default function Todo() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Take morning vitamins",
      completed: false,
      source: "food",
      dueDate: new Date(),
    },
    {
      id: "2",
      title: "Team meeting prep",
      completed: false,
      source: "calendar",
    },
    {
      id: "3",
      title: "Review project docs",
      completed: true,
      source: "manual",
    },
  ]);

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleAddTask = (task: Omit<Task, "id">) => {
    setTasks([...tasks, { ...task, id: Date.now().toString() }]);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">To Do</h1>
        <div className="flex gap-2">
          <Settings />
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <TaskList
          tasks={tasks}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onAddTask={handleAddTask}
        />
      </main>
    </div>
  );
}
