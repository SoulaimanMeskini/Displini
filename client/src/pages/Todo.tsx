import { useState, useEffect } from "react";
import TaskList, { Task } from "@/components/TaskList";
import PageHeader from "@/components/PageHeader";
import MonthlyStatsModal from "@/components/MonthlyStatsModal";
import AIChatBubble from "@/components/AIChatBubble";

export default function Todo() {
  const [showStats, setShowStats] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('todos');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((t: any) => ({
        ...t,
        dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
      }));
    }
    return [
      {
        id: "1",
        title: "Take morning vitamins",
        completed: false,
        source: "food" as const,
        dueDate: new Date(),
      },
      {
        id: "2",
        title: "Eat grilled chicken salad at 12:30",
        completed: false,
        source: "food" as const,
        dueDate: new Date(),
      },
      {
        id: "3",
        title: "Team meeting prep",
        completed: false,
        source: "calendar" as const,
      },
      {
        id: "4",
        title: "Review project docs",
        completed: true,
        source: "manual" as const,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(tasks));
    window.dispatchEvent(new Event('todosUpdated'));
  }, [tasks]);

  const handleToggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    
    if (task && task.source === 'medication' && !task.completed) {
      const medications = JSON.parse(localStorage.getItem("medications") || "[]");
      const medicationIndex = medications.findIndex((m: any) => m.id === task.medicationId);
      if (medicationIndex !== -1) {
        medications[medicationIndex].lastTaken = new Date().toISOString();
        localStorage.setItem("medications", JSON.stringify(medications));
        
        window.dispatchEvent(new CustomEvent('medication-completed', { 
          detail: { medicationId: task.medicationId } 
        }));
      }
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleAddTask = (task: Omit<Task, "id">) => {
    setTasks([...tasks, { ...task, id: Date.now().toString() }]);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="To Do" onStatsClick={() => setShowStats(true)} />

      <main className="max-w-md mx-auto px-4 py-6">
        <TaskList
          tasks={tasks}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onAddTask={handleAddTask}
        />
      </main>
      
      <MonthlyStatsModal open={showStats} onOpenChange={setShowStats} />
      <AIChatBubble onTaskAdded={handleAddTask} />
    </div>
  );
}
