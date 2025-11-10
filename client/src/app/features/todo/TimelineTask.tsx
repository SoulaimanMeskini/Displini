import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { ImageViewerDialog } from "@/app/components/shared";
import type { Task, Subtask } from "@/app/types/types";
import { format } from "date-fns";
import { useState, useRef } from "react";
import { Edit2, Calendar, Clock, Plus, X, ChevronDown, ChevronUp, Image as ImageIcon, Trash2, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import { Dialog as WorkDialog, DialogContent as WorkDialogContent, DialogHeader as WorkDialogHeader, DialogTitle as WorkDialogTitle } from "@/app/components/ui/dialog";
import Work from "@/app/features/todo/Work";

interface Props {
  task: Task;
  onToggleTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  getSourceBadge: (source: Task["source"]) => { label: string; className: string } | null;
  showTime?: boolean;
}

export default function TimelineTask({ task, onToggleTask, onUpdateTask, getSourceBadge, showTime = false }: Props) {
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editEmoji, setEditEmoji] = useState(task.emoji || "");
  const [editTime, setEditTime] = useState(task.time || "");
  const [editEndTime, setEditEndTime] = useState(task.endTime || "");
  const [editDate, setEditDate] = useState(task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : "");
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [workDialogOpen, setWorkDialogOpen] = useState(false);
  
  // Helper to get source page for navigation
  const getSourcePage = (source: Task["source"]) => {
    switch (source) {
      case 'water':
      case 'medication':
      case 'sleep':
        return '/health';
      case 'food':
        return '/food';
      case 'workout':
      case 'steps':
        return '/sport';
      case 'work':
        return 'work-dialog'; // Special case: opens dialog
      default:
        return null;
    }
  };
  
  // Handle shortcut click for external source
  const handleSourceShortcut = (source: Task["source"]) => {
    const destination = getSourcePage(source);
    if (!destination) return;
    
    if (destination === 'work-dialog') {
      setWorkDialogOpen(true);
    } else {
      setLocation(destination);
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const badge = getSourceBadge(task.source || "manual");
  
  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).map((st: Subtask) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdateTask(task.id, { subtasks: updatedSubtasks });
  };
  
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSubtask: Subtask = {
      id: Date.now().toString(),
      text: newSubtaskTitle.trim(),
      completed: false
    };
    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    onUpdateTask(task.id, { subtasks: updatedSubtasks });
    setNewSubtaskTitle("");
  };
  
  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).filter((st: Subtask) => st.id !== subtaskId);
    onUpdateTask(task.id, { subtasks: updatedSubtasks });
  };

  const formatCompletionTime = (completedAt: string | Date) => {
    const date = completedAt instanceof Date ? completedAt : new Date(completedAt);
    return format(date, "HH:mm");
  };

  const handleSave = () => {
    onUpdateTask(task.id, {
      title: editTitle,
      emoji: editEmoji,
      time: editTime || undefined,
      endTime: editEndTime || undefined,
      dueDate: editDate ? new Date(editDate) : task.dueDate
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditEmoji(task.emoji || "");
    setEditTime(task.time || "");
    setEditEndTime(task.endTime || "");
    setEditDate(task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : "");
    setIsEditing(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          const currentAttachments = task.attachments || [];
          onUpdateTask(task.id, {
            attachments: [...currentAttachments, dataUrl]
          });
        };
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = (index: number) => {
    const currentAttachments = task.attachments || [];
    onUpdateTask(task.id, {
      attachments: currentAttachments.filter((_attachment: string, i: number) => i !== index)
    });
  };

  return (
    <Card 
      className={`relative flex items-start gap-3 rounded-2xl p-4 my-2 transition-all hover-elevate cursor-pointer ${task.completed ? "opacity-70" : ""} w-full`}
      onClick={() => onToggleTask(task.id)}
    >
      {/* Emoji on the left */}
      <div className="text-2xl flex-shrink-0 mt-0.5">{task.emoji || ""}</div>
      
      {/* Content in the middle */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-medium ${task.completed ? "line-through" : ""}`}>{task.title}</p>
          {showTime && task.time && (
            <Badge variant="outline" className="text-xs">
              {task.time}
            </Badge>
          )}
          {task.completed && task.completedAt && (
            <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
              ✓ {formatCompletionTime(task.completedAt)}
            </Badge>
          )}
        </div>
        {task.notes && <p className="text-sm text-muted-foreground mt-1">{task.notes}</p>}
        <div className="flex items-center gap-2 flex-wrap mt-1.5">
          {badge && <Badge variant="secondary" className={badge.className}>{badge.label}</Badge>}
          {task.subtasks && task.subtasks.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {task.subtasks.filter((st: Subtask) => st.completed).length}/{task.subtasks.length} subtasks
            </Badge>
          )}
        </div>
        
        {/* Subtasks Section */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setShowSubtasks(!showSubtasks);
              }}
            >
              {showSubtasks ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
              {showSubtasks ? 'Hide' : 'Show'} Subtasks
            </Button>
            
            {showSubtasks && (
              <div className="mt-2 space-y-1 pl-2 border-l-2 border-muted">
                {task.subtasks.map((subtask: Subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleSubtask(subtask.id);
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <span className={subtask.completed ? 'line-through text-muted-foreground' : ''}>
                      {subtask.text}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubtask(subtask.id);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Actions on the right */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <div className="h-8 w-8 flex items-center justify-center text-lg">
          {task.completed ? "✓" : "○"}
        </div>
        
        {/* External source shortcut icon - shown for tasks from other pages */}
        {task.source && getSourcePage(task.source) && (
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 px-2 text-primary"
            onClick={(e) => {
              e.stopPropagation();
              handleSourceShortcut(task.source);
            }}
            title={
              task.source === 'work' ? 'Open Work Settings' :
              task.source === 'water' || task.source === 'medication' || task.source === 'sleep' ? 'Go to Health' : 
              task.source === 'food' ? 'Go to Food' : 'Go to Sport'
            }
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
        
        {/* Photo icon button - always visible */}
        <Button 
          size="sm" 
          variant="ghost" 
          className={`h-8 px-2 relative ${task.attachments && task.attachments.length > 0 ? 'text-primary' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (task.attachments && task.attachments.length > 0) {
              setShowImageViewer(true);
            } else {
              setIsEditing(true);
            }
          }}
          title={task.attachments && task.attachments.length > 0 ? `${task.attachments.length} photo(s)` : 'Add photos'}
        >
          <ImageIcon className="w-4 h-4" />
          {task.attachments && task.attachments.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {task.attachments.length}
            </span>
          )}
        </Button>
        
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 px-2"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Task title"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Emoji</label>
                <Input
                  value={editEmoji}
                  onChange={(e) => setEditEmoji(e.target.value)}
                  placeholder="😊"
                  maxLength={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <Input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>
              
              {/* Attachments Management */}
              <div>
                <label className="text-sm font-medium mb-2 block">Photos / Screenshots</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Add Image
                </Button>
                
                {task.attachments && task.attachments.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {task.attachments.map((attachment: any, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={attachment}
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteAttachment(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Subtasks Management */}
              <div>
                <label className="text-sm font-medium mb-2 block">Subtasks</label>
                <div className="space-y-2">
                  {(task.subtasks || []).map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => handleToggleSubtask(subtask.id)}
                        className="w-4 h-4 rounded"
                      />
                      <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {subtask.text}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDeleteSubtask(subtask.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add subtask..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubtask();
                        }
                      }}
                      className="text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddSubtask}
                      disabled={!newSubtaskTitle.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Image Viewer Dialog */}
      {task.attachments && task.attachments.length > 0 && (
        <ImageViewerDialog
          images={task.attachments}
          open={showImageViewer}
          onOpenChange={setShowImageViewer}
          initialIndex={0}
        />
      )}

      {/* Work Dialog */}
      <WorkDialog open={workDialogOpen} onOpenChange={setWorkDialogOpen}>
        <WorkDialogContent className="max-w-2xl">
          <WorkDialogHeader>
            <WorkDialogTitle>💼 Work</WorkDialogTitle>
          </WorkDialogHeader>
          <Work />
        </WorkDialogContent>
      </WorkDialog>
    </Card>
  );
}