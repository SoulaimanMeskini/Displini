import { useState, useEffect } from "react";
import Settings from "@/components/Settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";

interface CyclePeriod {
  id: string;
  startDate: string;
  cycleLength: number;
}

interface Medication {
  id: string;
  name: string;
  emoji: string;
  dosage: string;
  times: string[];
  frequency: string;
}

export default function Health() {
  const [cycles, setCycles] = useState<CyclePeriod[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isAddCycleOpen, setIsAddCycleOpen] = useState(false);
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [newPeriodDate, setNewPeriodDate] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  
  const [newMedName, setNewMedName] = useState("");
  const [newMedEmoji, setNewMedEmoji] = useState("💊");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedTime, setNewMedTime] = useState("");
  const [newMedFrequency, setNewMedFrequency] = useState("daily");

  useEffect(() => {
    const savedCycles = localStorage.getItem("menstrualCycles");
    const savedMeds = localStorage.getItem("medications");
    
    if (savedCycles) setCycles(JSON.parse(savedCycles));
    if (savedMeds) setMedications(JSON.parse(savedMeds));
  }, []);

  useEffect(() => {
    localStorage.setItem("menstrualCycles", JSON.stringify(cycles));
  }, [cycles]);

  useEffect(() => {
    localStorage.setItem("medications", JSON.stringify(medications));
  }, [medications]);

  const handleAddPeriod = () => {
    if (newPeriodDate) {
      const newCycle: CyclePeriod = {
        id: Date.now().toString(),
        startDate: newPeriodDate,
        cycleLength: cycleLength,
      };
      setCycles([...cycles, newCycle].sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      ));
      setNewPeriodDate("");
      setIsAddCycleOpen(false);
    }
  };

  const handleAddMedication = () => {
    if (newMedName && newMedTime) {
      const newMed: Medication = {
        id: Date.now().toString(),
        name: newMedName,
        emoji: newMedEmoji,
        dosage: newMedDosage,
        times: [newMedTime],
        frequency: newMedFrequency,
      };
      setMedications([...medications, newMed]);
      setNewMedName("");
      setNewMedEmoji("💊");
      setNewMedDosage("");
      setNewMedTime("");
      setIsAddMedOpen(false);
      
      addMedicationToTodo(newMed);
    }
  };

  const addMedicationToTodo = (med: Medication) => {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    const newTodo = {
      id: `med-${med.id}-${Date.now()}`,
      title: `${med.emoji} Take ${med.name}`,
      completed: false,
      dueDate: new Date().toISOString().split('T')[0],
      source: 'medication',
      medicationId: med.id,
    };
    todos.push(newTodo);
    localStorage.setItem("todos", JSON.stringify(todos));
  };

  const deleteCycle = (id: string) => {
    setCycles(cycles.filter(c => c.id !== id));
  };

  const deleteMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  const getNextPeriodDate = () => {
    if (cycles.length === 0) return null;
    const lastCycle = cycles[0];
    const avgLength = cycles.reduce((sum, c) => sum + c.cycleLength, 0) / cycles.length;
    return addDays(new Date(lastCycle.startDate), Math.round(avgLength));
  };

  const nextPeriod = getNextPeriodDate();
  const daysUntilNext = nextPeriod ? differenceInDays(nextPeriod, new Date()) : null;

  const emojiOptions = ["💊", "💉", "🩺", "🧪", "⚕️", "💝", "🌡️"];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold" data-testid="text-page-title">Health</h1>
          <Settings />
        </div>
      </header>

      <main className="p-4 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Menstrual Cycle</CardTitle>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => setIsAddCycleOpen(true)}
              data-testid="button-add-cycle"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {cycles.length > 0 ? (
              <>
                {nextPeriod && daysUntilNext !== null && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium">Next period predicted</p>
                    <p className="text-lg font-semibold text-primary">
                      {daysUntilNext > 0 ? `In ${daysUntilNext} days` : 'Today'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(nextPeriod, 'MMMM d, yyyy')}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Recent periods</p>
                  {cycles.slice(0, 3).map((cycle) => (
                    <div 
                      key={cycle.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {format(new Date(cycle.startDate), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cycle.cycleLength} day cycle
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteCycle(cycle.id)}
                        data-testid={`button-delete-cycle-${cycle.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Track your cycle to get predictions
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Medications & Pills</CardTitle>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => setIsAddMedOpen(true)}
              data-testid="button-add-medication"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {medications.length > 0 ? (
              <div className="space-y-2">
                {medications.map((med) => (
                  <div 
                    key={med.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="text-3xl">{med.emoji}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{med.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {med.dosage} • {med.times.join(", ")} • {med.frequency}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMedication(med.id)}
                      data-testid={`button-delete-medication-${med.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add medications to get reminders
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isAddCycleOpen} onOpenChange={setIsAddCycleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Period Start Date</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="period-date">Period Start Date</Label>
              <Input
                id="period-date"
                type="date"
                value={newPeriodDate}
                onChange={(e) => setNewPeriodDate(e.target.value)}
                data-testid="input-period-date"
              />
            </div>
            <div>
              <Label htmlFor="cycle-length">Typical Cycle Length (days)</Label>
              <Input
                id="cycle-length"
                type="number"
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
                data-testid="input-cycle-length"
              />
            </div>
            <Button onClick={handleAddPeriod} className="w-full" data-testid="button-submit-cycle">
              Add Period
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddMedOpen} onOpenChange={setIsAddMedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="med-emoji">Emoji</Label>
              <div className="flex gap-2 mt-2">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    className={`text-2xl p-2 rounded-lg ${newMedEmoji === emoji ? 'bg-primary/20' : 'hover-elevate'}`}
                    onClick={() => setNewMedEmoji(emoji)}
                    data-testid={`button-emoji-${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="med-name">Medication Name</Label>
              <Input
                id="med-name"
                placeholder="Vitamin D"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                data-testid="input-medication-name"
              />
            </div>
            <div>
              <Label htmlFor="med-dosage">Dosage</Label>
              <Input
                id="med-dosage"
                placeholder="1000 IU"
                value={newMedDosage}
                onChange={(e) => setNewMedDosage(e.target.value)}
                data-testid="input-medication-dosage"
              />
            </div>
            <div>
              <Label htmlFor="med-time">Time</Label>
              <Input
                id="med-time"
                type="time"
                value={newMedTime}
                onChange={(e) => setNewMedTime(e.target.value)}
                data-testid="input-medication-time"
              />
            </div>
            <Button onClick={handleAddMedication} className="w-full" data-testid="button-submit-medication">
              Add Medication
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
