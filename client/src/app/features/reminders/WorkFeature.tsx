import { useState, useEffect } from "react";
import { Briefcase, Clock, DollarSign, Settings, Plus, Edit, Trash2, CheckCircle } from "lucide-react";
import { colors } from "@/lib/designSystem";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";

interface WorkSchedule {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  days: string[];
  salaryDate: string;
  isActive: boolean;
}

interface WorkFeatureProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkFeature({ isOpen, onClose }: WorkFeatureProps) {
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showEditSchedule, setShowEditSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);

  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);

  // Load work schedules from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('work_schedules');
    if (saved) {
      setSchedules(JSON.parse(saved));
    }
  }, [isOpen]);

  const [newSchedule, setNewSchedule] = useState({
    name: '',
    startTime: '09:00',
    endTime: '17:00',
    days: [] as string[],
    salaryDate: '1',
    isActive: true
  });

  const addSchedule = () => {
    if (newSchedule.name.trim()) {
      const schedule: WorkSchedule = {
        id: Date.now().toString(),
        ...newSchedule,
        isActive: true
      };
      
      const updated = [...schedules, schedule];
      setSchedules(updated);
      localStorage.setItem('work_schedules', JSON.stringify(updated));
      
      setNewSchedule({
        name: '',
        startTime: '09:00',
        endTime: '17:00',
        days: [],
        salaryDate: '1',
        isActive: true
      });
      setShowAddSchedule(false);
    }
  };

  const editSchedule = (schedule: WorkSchedule) => {
    setEditingSchedule(schedule);
    setNewSchedule({
      name: schedule.name,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      days: schedule.days,
      salaryDate: schedule.salaryDate,
      isActive: schedule.isActive
    });
    setShowEditSchedule(true);
  };

  const updateSchedule = () => {
    if (editingSchedule && newSchedule.name.trim()) {
      const updated = schedules.map(schedule => 
        schedule.id === editingSchedule.id 
          ? { ...schedule, ...newSchedule }
          : schedule
      );
      setSchedules(updated);
      localStorage.setItem('work_schedules', JSON.stringify(updated));
      setShowEditSchedule(false);
      setEditingSchedule(null);
    }
  };

  const deleteSchedule = (id: string) => {
    const updated = schedules.filter(schedule => schedule.id !== id);
    setSchedules(updated);
    localStorage.setItem('work_schedules', JSON.stringify(updated));
  };

  const toggleSchedule = (id: string) => {
    const updated = schedules.map(schedule => 
      schedule.id === id ? { ...schedule, isActive: !schedule.isActive } : schedule
    );
    setSchedules(updated);
    localStorage.setItem('work_schedules', JSON.stringify(updated));
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-green-600" />
            Work & Productivity
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{schedules.length}</p>
                <p className="text-sm text-muted-foreground">Work Schedules</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {schedules.filter(s => s.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
            <Button onClick={() => setShowAddSchedule(true)} className="rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              New Schedule
            </Button>
          </div>

          {/* Work Schedules */}
          <div className="space-y-4">
            {schedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No work schedules added yet</p>
                <p className="text-sm">Add your first work schedule to get started</p>
              </div>
            ) : (
              schedules.map((schedule) => (
                <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{schedule.name}</h3>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            schedule.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {schedule.isActive ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            <span>Salary: {schedule.salaryDate}st</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">
                            Days: {schedule.days.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => editSchedule(schedule)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSchedule(schedule.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleSchedule(schedule.id)}
                        >
                          <CheckCircle className={`w-4 h-4 ${schedule.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Add/Edit Schedule Dialog */}
          <Dialog open={showAddSchedule || showEditSchedule} onOpenChange={(open) => {
            if (!open) {
              setShowAddSchedule(false);
              setShowEditSchedule(false);
              setEditingSchedule(null);
            }
          }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {showAddSchedule ? 'Add Work Schedule' : 'Edit Work Schedule'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                  <div>
                    <Label htmlFor="schedule-name">Schedule Name</Label>
                    <Input
                      id="schedule-name"
                      value={newSchedule.name}
                      onChange={(e) => setNewSchedule({...newSchedule, name: e.target.value})}
                      placeholder="e.g., Full-time Job"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={newSchedule.startTime}
                        onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={newSchedule.endTime}
                        onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Work Days</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {days.map((day) => (
                        <label key={day} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newSchedule.days.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewSchedule({
                                  ...newSchedule,
                                  days: [...newSchedule.days, day]
                                });
                              } else {
                                setNewSchedule({
                                  ...newSchedule,
                                  days: newSchedule.days.filter(d => d !== day)
                                });
                              }
                            }}
                          />
                          <span className="text-sm">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="salary-date">Salary Date</Label>
                    <Select
                      value={newSchedule.salaryDate}
                      onValueChange={(value) => setNewSchedule({...newSchedule, salaryDate: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}st
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={showAddSchedule ? addSchedule : updateSchedule} 
                      className="flex-1"
                      disabled={!newSchedule.name.trim() || newSchedule.days.length === 0}
                    >
                      {showAddSchedule ? 'Add' : 'Update'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowAddSchedule(false);
                        setShowEditSchedule(false);
                        setEditingSchedule(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
            </DialogContent>
          </Dialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}
