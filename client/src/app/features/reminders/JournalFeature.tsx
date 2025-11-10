import { useState, useEffect } from "react";
import { BookOpen, Plus, Calendar, Clock, Edit3, Trash2, Bell, X } from "lucide-react";
import { colors } from "@/lib/designSystem";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  time: string;
  mood?: string;
  tags: string[];
}

interface JournalFeatureProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JournalFeature({ isOpen, onClose }: JournalFeatureProps) {
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showEditEntry, setShowEditEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [reminderTimes, setReminderTimes] = useState<string[]>([]);
  const [newReminderTime, setNewReminderTime] = useState('20:00');
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [filterDate, setFilterDate] = useState<string>('');

  // Load journal entries from localStorage
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('journal_entries');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  // Save journal entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('journal_entries', JSON.stringify(entries));
  }, [entries]);

  // Load journal reminder settings
  useEffect(() => {
    if (!isOpen) return;
    
    const journalSettings = JSON.parse(localStorage.getItem('journal_settings') || '{}');
    setReminderTimes(journalSettings.reminderTimes || []);
    setRemindersEnabled(journalSettings.remindersEnabled || false);
  }, [isOpen]);

  const createJournalReminders = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tasks: any[] = [];
    const existingTasks = JSON.parse(localStorage.getItem('todos') || '[]');
    
    // Remove existing journal reminders for today
    const filteredTasks = existingTasks.filter((t: any) => 
      !(t.dueDate === todayStr && t.source === 'journal')
    );
    
    reminderTimes.forEach((time) => {
      tasks.push({
        id: `journal_${todayStr}_${time.replace(':', '')}`,
        title: '📔 Write Journal',
        notes: 'Take a moment to reflect and write in your journal',
        time: time,
        dueDate: todayStr,
        completed: false,
        allDay: false,
        source: 'journal',
        emoji: '📔',
        color: '#8B5CF6'
      });
    });
    
    localStorage.setItem('todos', JSON.stringify([...filteredTasks, ...tasks]));
    window.dispatchEvent(new Event('todosUpdated'));
    
    return tasks.length;
  };

  const toggleJournalReminders = (enabled: boolean) => {
    const journalSettings = JSON.parse(localStorage.getItem('journal_settings') || '{}');
    journalSettings.remindersEnabled = enabled;
    localStorage.setItem('journal_settings', JSON.stringify(journalSettings));
    setRemindersEnabled(enabled);
    
    if (enabled) {
      const created = createJournalReminders();
      if (created > 0) {
        alert(`✅ Created ${created} journal reminders for today!`);
      }
    } else {
      const today = new Date().toISOString().split('T')[0];
      const existingTasks = JSON.parse(localStorage.getItem('todos') || '[]');
      const filteredTasks = existingTasks.filter((t: any) => 
        !(t.dueDate === today && t.source === 'journal')
      );
      localStorage.setItem('todos', JSON.stringify(filteredTasks));
      window.dispatchEvent(new Event('todosUpdated'));
    }
  };

  const addJournalReminderTime = () => {
    if (newReminderTime && !reminderTimes.includes(newReminderTime)) {
      const updatedTimes = [...reminderTimes, newReminderTime].sort();
      setReminderTimes(updatedTimes);
      
      const journalSettings = JSON.parse(localStorage.getItem('journal_settings') || '{}');
      journalSettings.reminderTimes = updatedTimes;
      localStorage.setItem('journal_settings', JSON.stringify(journalSettings));
      
      setShowAddReminder(false);
      setNewReminderTime('20:00');
      
      if (remindersEnabled) {
        createJournalReminders();
      }
    }
  };

  const removeJournalReminderTime = (time: string) => {
    const updatedTimes = reminderTimes.filter(t => t !== time);
    setReminderTimes(updatedTimes);
    
    const journalSettings = JSON.parse(localStorage.getItem('journal_settings') || '{}');
    journalSettings.reminderTimes = updatedTimes;
    localStorage.setItem('journal_settings', JSON.stringify(journalSettings));
    
    if (remindersEnabled) {
      createJournalReminders();
    }
  };

  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: '',
    tags: ''
  });

  const handleAddEntry = () => {
    if (newEntry.title.trim() && newEntry.content.trim()) {
      const entry: JournalEntry = {
        id: Date.now().toString(),
        title: newEntry.title,
        content: newEntry.content,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        mood: newEntry.mood || undefined,
        tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      setEntries([entry, ...entries]);
      setNewEntry({ title: '', content: '', mood: '', tags: '' });
      setShowAddEntry(false);
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setNewEntry({
      title: entry.title,
      content: entry.content,
      mood: entry.mood || '',
      tags: entry.tags.join(', ')
    });
    setShowEditEntry(true);
  };

  const handleUpdateEntry = () => {
    if (editingEntry && newEntry.title.trim() && newEntry.content.trim()) {
      const updatedEntry: JournalEntry = {
        ...editingEntry,
        title: newEntry.title,
        content: newEntry.content,
        mood: newEntry.mood || undefined,
        tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      setEntries(entries.map(entry => 
        entry.id === editingEntry.id ? updatedEntry : entry
      ));
      setEditingEntry(null);
      setNewEntry({ title: '', content: '', mood: '', tags: '' });
      setShowEditEntry(false);
    }
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'excited': return '🤩';
      case 'curious': return '🤔';
      case 'calm': return '😌';
      case 'sad': return '😔';
      default: return '😐';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Journal
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="space-y-4 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{entries.length}</p>
                  <p className="text-sm text-muted-foreground">Entries</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {entries.filter(e => e.mood).length}
                  </p>
                  <p className="text-sm text-muted-foreground">With Mood</p>
                </div>
              </div>
              <Button onClick={() => setShowAddEntry(true)} className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                New Entry
              </Button>
            </div>
            
            {/* Journal Reminders */}
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">Journal Reminders</p>
                    <p className="text-xs text-purple-700">Set times for journaling reminders</p>
                  </div>
                </div>
                {reminderTimes.length > 0 && (
                  <Button
                    size="sm"
                    onClick={() => toggleJournalReminders(!remindersEnabled)}
                    variant={remindersEnabled ? "destructive" : "default"}
                  >
                    {remindersEnabled ? 'Disable' : 'Enable'}
                  </Button>
                )}
              </div>
              
              {reminderTimes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {reminderTimes.map((time) => (
                    <div key={time} className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-purple-300">
                      <Clock className="w-3 h-3 text-purple-600" />
                      <span className="text-sm text-purple-900">{time}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-red-100"
                        onClick={() => removeJournalReminderTime(time)}
                      >
                        <X className="w-3 h-3 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {showAddReminder ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={addJournalReminderTime}>
                    Add
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddReminder(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddReminder(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reminder Time
                </Button>
              )}
            </div>
            
            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="filter-date" className="text-sm">Filter by date:</Label>
              <Input
                id="filter-date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="flex-1"
              />
              {filterDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterDate('')}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Journal Entries */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {entries.length > 0 ? (
              entries
                .filter(entry => !filterDate || entry.date === filterDate)
                .map((entry) => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{entry.title}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{entry.date}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{entry.time}</span>
                          </span>
                          {entry.mood && (
                            <span className="flex items-center space-x-1 text-yellow-500">
                              <span>{getMoodEmoji(entry.mood)}</span>
                              <span className="capitalize">{entry.mood}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditEntry(entry)}
                          className="h-8 w-8"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      {entry.content}
                    </p>
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No entries yet</h3>
                <p className="text-muted-foreground mb-4">Start your journaling journey today</p>
                <Button onClick={() => setShowAddEntry(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Write First Entry
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Add Entry Dialog */}
        <Dialog open={showAddEntry} onOpenChange={setShowAddEntry}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Journal Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  placeholder="What's on your mind?"
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  placeholder="Write your thoughts here..."
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mood">Mood (Optional)</Label>
                  <Input
                    id="mood"
                    value={newEntry.mood}
                    onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                    placeholder="happy, excited, calm..."
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (Optional)</Label>
                  <Input
                    id="tags"
                    value={newEntry.tags}
                    onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
                    placeholder="gratitude, work, personal..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddEntry(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEntry}>
                  Save Entry
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Entry Dialog */}
        <Dialog open={showEditEntry} onOpenChange={setShowEditEntry}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Journal Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  placeholder="What's on your mind?"
                />
              </div>
              <div>
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  placeholder="Write your thoughts here..."
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-mood">Mood (Optional)</Label>
                  <Input
                    id="edit-mood"
                    value={newEntry.mood}
                    onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                    placeholder="happy, excited, calm..."
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tags">Tags (Optional)</Label>
                  <Input
                    id="edit-tags"
                    value={newEntry.tags}
                    onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
                    placeholder="gratitude, work, personal..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditEntry(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateEntry}>
                  Update Entry
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
