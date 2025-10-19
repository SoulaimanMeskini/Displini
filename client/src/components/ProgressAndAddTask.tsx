import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Task } from "./types";
import CircularProgress from "./CircularProgress";
import { EmojiPicker } from "./EmojiPicker";

interface Props {
  completed: number;
  total: number;
  onAddTask: (task: Omit<Task, "id">) => void;
}

export default function ProgressAndAddTask({ completed, total, onAddTask }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("📝");
  const [isAllDayMode, setIsAllDayMode] = useState(true);
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState("");
  const [scheduleType, setScheduleType] = useState<"once" | "daily" | "weekly" | "biweekly" | "monthly">("once");
  const [scheduleInterval, setScheduleInterval] = useState(1);
  const [selectedDays, setSelectedDays] = useState<number[]>([1]); // 0=Sunday, 1=Monday, etc.

  const weekDays = [
    { value: 1, label: 'Mon', fullLabel: 'Monday' },
    { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
    { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
    { value: 4, label: 'Thu', fullLabel: 'Thursday' },
    { value: 5, label: 'Fri', fullLabel: 'Friday' },
    { value: 6, label: 'Sat', fullLabel: 'Saturday' },
    { value: 0, label: 'Sun', fullLabel: 'Sunday' },
  ];

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // Validate weekly tasks have at least one day selected
    if (scheduleType === "weekly" && selectedDays.length === 0) {
      alert("Please select at least one day for weekly tasks");
      return;
    }

    const tasksToAdd: Omit<Task, "id">[] = [];
    const startDate = new Date(dueDate);
    
    // Map scheduleType to repeat field
    const repeatValue = scheduleType === "once" ? undefined : 
                       scheduleType === "daily" ? "daily" as const :
                       scheduleType === "weekly" ? "weekly" as const :
                       scheduleType === "biweekly" ? "weekly" as const :
                       scheduleType === "monthly" ? "monthly" as const :
                       undefined;
    
    if (scheduleType === "once") {
      // Single task
      tasksToAdd.push({
        title: title.trim(),
        completed: false,
        source: "manual",
        emoji,
        allDay: isAllDayMode,
        time: !isAllDayMode ? time : undefined,
        endTime: !isAllDayMode ? endTime : undefined,
        dueDate: startDate,
        notes: notes.trim() || undefined,
        color: color || undefined,
        repeat: repeatValue,
      });
    } else {
      // Recurring tasks - create multiple instances
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3); // Create tasks for next 3 months
      
      let currentDate = new Date(startDate);
      let taskCount = 0;
      const maxTasks = 100; // Limit to prevent too many tasks
      
      while (currentDate <= endDate && taskCount < maxTasks) {
        // For weekly tasks with selected days, only create tasks on those days
        const shouldCreateTask = scheduleType !== "weekly" || selectedDays.includes(currentDate.getDay());
        
        if (shouldCreateTask) {
          tasksToAdd.push({
            title: title.trim(),
            completed: false,
            source: "manual" as const,
            emoji,
            allDay: isAllDayMode,
            time: !isAllDayMode ? time : undefined,
            endTime: !isAllDayMode ? endTime : undefined,
            dueDate: new Date(currentDate),
            notes: notes.trim() || undefined,
            color: color || undefined,
            repeat: repeatValue,
          });
          taskCount++;
        }
        
        // Calculate next occurrence
        switch (scheduleType) {
          case "daily":
            currentDate.setDate(currentDate.getDate() + scheduleInterval);
            break;
          case "weekly":
            // For weekly, advance by 1 day to check next day
            currentDate.setDate(currentDate.getDate() + 1);
            break;
          case "biweekly":
            currentDate.setDate(currentDate.getDate() + 1);
            break;
          case "monthly":
            currentDate.setMonth(currentDate.getMonth() + scheduleInterval);
            break;
        }
      }
    }

    // Add all tasks
    tasksToAdd.forEach(task => onAddTask(task));
    
    // Reset form
    setTitle("");
    setEmoji("📝");
    setIsAllDayMode(true);
    setTime("");
    setEndTime("");
    setDueDate(new Date().toISOString().split('T')[0]);
    setNotes("");
    setColor("");
    setScheduleType("once");
    setScheduleInterval(1);
    setSelectedDays([1]);
    setIsOpen(false);
  };

  return (
    <Card className="p-4 rounded-2xl max-w-lg mx-auto text-center">
      <div className="flex flex-col items-center gap-4">
        <CircularProgress completed={completed} total={total} size={100} />
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Add Task
            </Button>
          </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <Label>Emoji</Label>
              <EmojiPicker 
                value={emoji}
                onChange={setEmoji}
                category="food"
              />
            </div>

            <div>
              <Label>Task Type</Label>
              <div className="flex items-center justify-center gap-3 mt-3">
                <span className="text-sm font-medium">
                  {isAllDayMode ? 'All Day / Anytime' : 'Timed Task'}
                </span>
                <Switch
                  checked={!isAllDayMode}
                  onCheckedChange={(checked) => setIsAllDayMode(!checked)}
                />
              </div>
            </div>

            {!isAllDayMode && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="time">Start Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required={!isAllDayMode}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required={!isAllDayMode}
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes"
              />
            </div>

            <div>
              <Label htmlFor="task-color">Task Color (optional)</Label>
              <div className="flex items-center gap-3 mt-2">
                <Input
                  id="task-color"
                  type="color"
                  value={color || "#8b5cf6"}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground flex-1">
                  {color || "Using theme color"}
                </span>
                {color && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setColor("")}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label>Schedule</Label>
              <div className="flex gap-2 mt-2">
                <Select value={scheduleType} onValueChange={(value: any) => setScheduleType(value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                
                {scheduleType !== "once" && scheduleType !== "weekly" && (
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={scheduleInterval}
                    onChange={(e) => setScheduleInterval(parseInt(e.target.value) || 1)}
                    className="w-20"
                    placeholder="1"
                  />
                )}
              </div>
              
              {/* Day selector for weekly tasks */}
              {scheduleType === "weekly" && (
                <div className="mt-3">
                  <Label className="text-xs text-muted-foreground">Select days</Label>
                  <div className="flex gap-1 mt-2">
                    {weekDays.map(day => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`flex-1 py-2 px-1 text-xs rounded-lg border-2 transition-all ${
                          selectedDays.includes(day.value)
                            ? 'bg-primary text-primary-foreground border-primary font-semibold'
                            : 'bg-background border-muted hover:border-primary/50'
                        }`}
                        title={day.fullLabel}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedDays.length === 0 && 'Select at least one day'}
                    {selectedDays.length > 0 && `Repeats every ${selectedDays.map(d => weekDays.find(wd => wd.value === d)?.fullLabel).join(', ')}`}
                  </p>
                </div>
              )}
              
              {scheduleType !== "once" && scheduleType !== "weekly" && (
                <p className="text-xs text-muted-foreground mt-1">
                  {scheduleType === "daily" && `Every ${scheduleInterval} day${scheduleInterval > 1 ? 's' : ''}`}
                  {scheduleType === "biweekly" && `Every ${scheduleInterval * 2} weeks`}
                  {scheduleType === "monthly" && `Every ${scheduleInterval} month${scheduleInterval > 1 ? 's' : ''}`}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add Task
              </Button>
            </div>
          </form>
        </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}