import { useState } from 'react'
import TaskList from '../TaskList'

export default function TaskListExample() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Take morning vitamins', completed: false, source: 'food' as const, dueDate: new Date() },
    { id: '2', title: 'Team meeting prep', completed: false, source: 'calendar' as const },
    { id: '3', title: 'Review project docs', completed: true, source: 'manual' as const },
  ])

  return (
    <TaskList
      tasks={tasks}
      onToggleTask={(id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
      }}
      onDeleteTask={(id) => {
        setTasks(tasks.filter(t => t.id !== id))
      }}
      onAddTask={(task) => {
        setTasks([...tasks, { ...task, id: Date.now().toString() }] as typeof tasks)
      }}
    />
  )
}
