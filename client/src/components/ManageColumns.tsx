import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Columns, GripVertical, ChevronUp, ChevronDown, Minimize2, Maximize2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ColumnItem {
  id: string;
  name: string;
  required?: boolean;
}

interface ManageColumnsProps {
  title: string;
  columns: ColumnItem[];
  order: string[];
  visibility: Record<string, boolean>;
  minimized?: Record<string, boolean>;
  onOrderChange: (newOrder: string[]) => void;
  onVisibilityChange: (newVisibility: Record<string, boolean>) => void;
  onMinimizeChange?: (newMinimized: Record<string, boolean>) => void;
  testId?: string;
}

interface SortableColumnItemProps {
  column: ColumnItem;
  index: number;
  visibility: Record<string, boolean>;
  minimized: Record<string, boolean>;
  onVisibilityChange: (newVisibility: Record<string, boolean>) => void;
  onMinimizeChange?: (newMinimized: Record<string, boolean>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function SortableColumnItem({
  column,
  index,
  visibility,
  minimized,
  onVisibilityChange,
  onMinimizeChange,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown
}: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const toggleVisibility = () => {
    if (column.required) return;
    onVisibilityChange({ ...visibility, [column.id]: !visibility[column.id] });
  };

  const toggleMinimize = () => {
    if (!onMinimizeChange) return;
    onMinimizeChange({ ...minimized, [column.id]: !minimized[column.id] });
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="flex items-center justify-between gap-3 p-3 bg-muted rounded-md"
    >
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            data-testid={`button-move-up-${column.id}`}
          >
            <ChevronUp className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            data-testid={`button-move-down-${column.id}`}
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className="font-medium">{column.name}</span>
        {column.required && (
          <span className="text-xs text-muted-foreground">(Required)</span>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={visibility[column.id] || false}
            onCheckedChange={toggleVisibility}
            disabled={column.required}
            data-testid={`switch-visibility-${column.id}`}
          />
          <span className="text-sm text-muted-foreground">Visible</span>
        </div>
      </div>
    </div>
  );
}

export default function ManageColumns({
  title,
  columns,
  order,
  visibility,
  minimized = {},
  onOrderChange,
  onVisibilityChange,
  onMinimizeChange,
  testId = "button-column-settings"
}: ManageColumnsProps) {
  // Filter columns based on user profile
  const userProfile = localStorage.getItem('userProfile');
  const gender = userProfile ? JSON.parse(userProfile).gender : null;
  
  // Hide pregnancy and menstrual cycle for male users
  const filteredColumns = columns.filter(col => {
    if (gender === 'male' && (col.id === 'pregnancy' || col.id === 'cycle')) {
      return false;
    }
    return true;
  });
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const moveColumn = (fromIndex: number, toIndex: number) => {
    const newOrder = [...order];
    const [movedColumn] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedColumn);
    onOrderChange(newOrder);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = order.findIndex((id) => id === active.id);
      const newIndex = order.findIndex((id) => id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(order, oldIndex, newIndex);
        onOrderChange(newOrder);
      }
    }
  };

  const toggleVisibility = (columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    if (column?.required) return;
    onVisibilityChange({ ...visibility, [columnId]: !visibility[columnId] });
  };

  const toggleMinimize = (columnId: string) => {
    if (!onMinimizeChange) return;
    onMinimizeChange({ ...minimized, [columnId]: !minimized[columnId] });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" data-testid={testId}>
          <Columns className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={order}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {order.map((columnId, index) => {
                  const column = filteredColumns.find(c => c.id === columnId);
                  if (!column) return null;
                  
                  return (
                    <SortableColumnItem
                      key={columnId}
                      column={column}
                      index={index}
                      visibility={visibility}
                      minimized={minimized}
                      onVisibilityChange={onVisibilityChange}
                      onMinimizeChange={onMinimizeChange}
                      onMoveUp={() => moveColumn(index, Math.max(0, index - 1))}
                      onMoveDown={() => moveColumn(index, Math.min(order.length - 1, index + 1))}
                      canMoveUp={index > 0}
                      canMoveDown={index < order.length - 1}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </DialogContent>
    </Dialog>
  );
}
