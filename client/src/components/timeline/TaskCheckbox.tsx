import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@/components/types";

interface TaskCheckboxProps {
  task: Task;
  onToggle: (id: string) => void;
  isPrediction?: boolean;
}

export function TaskCheckbox({ task, onToggle, isPrediction }: TaskCheckboxProps) {
  return (
    <Checkbox
      id={`task-${task.id}`}
      checked={task.completed}
      onCheckedChange={() => onToggle(task.id)}
      disabled={isPrediction}
      className={`flex-shrink-0 w-5 h-5 ${isPrediction ? 'opacity-50 cursor-not-allowed' : ''}`}
      data-testid={`checkbox-task-${task.id}`}
    />
  );
}

