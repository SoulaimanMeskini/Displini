import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingDown, TrendingUp, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WeightEntry {
  date: string;
  weight: number;
  bodyFat?: number;
}

interface WeightGoalTrackerProps {
  currentWeight: number;
  onWeightUpdate?: (weight: number) => void;
}

export default function WeightGoalTracker({ currentWeight, onWeightUpdate }: WeightGoalTrackerProps) {
  const [goalWeight, setGoalWeight] = useState("");
  const [goalDirection, setGoalDirection] = useState<"loss" | "gain">("loss");
  const [newWeight, setNewWeight] = useState("");
  const [currentBodyFat, setCurrentBodyFat] = useState("");
  const [goalBodyFat, setGoalBodyFat] = useState("");
  const [newBodyFat, setNewBodyFat] = useState("");
  const [history, setHistory] = useState<WeightEntry[]>([
    { date: "2025-09-28", weight: 72, bodyFat: 18 },
    { date: "2025-09-21", weight: 73.5, bodyFat: 19 },
    { date: "2025-09-14", weight: 74, bodyFat: 19.5 },
  ]);
  const [showHistory, setShowHistory] = useState(false);

  const handleUpdateWeight = () => {
    if (newWeight && onWeightUpdate) {
      const weightNum = parseFloat(newWeight);
      const bodyFatNum = newBodyFat ? parseFloat(newBodyFat) : undefined;
      
      onWeightUpdate(weightNum);
      
      const newEntry: WeightEntry = {
        date: new Date().toISOString().split('T')[0],
        weight: weightNum,
        bodyFat: bodyFatNum,
      };
      
      setHistory([newEntry, ...history]);
      if (newBodyFat) setCurrentBodyFat(newBodyFat);
      setNewWeight("");
      setNewBodyFat("");
    }
  };

  const goalWeightNum = parseFloat(goalWeight) || 0;
  const goalBodyFatNum = parseFloat(goalBodyFat) || 0;
  const currentBodyFatNum = parseFloat(currentBodyFat) || 0;
  
  const weightDifference = goalWeightNum ? Math.abs(currentWeight - goalWeightNum) : 0;
  const bodyFatDifference = goalBodyFatNum && currentBodyFatNum ? Math.abs(currentBodyFatNum - goalBodyFatNum) : 0;
  
  const isOnTrack = goalDirection === "loss" 
    ? currentWeight < (history[1]?.weight || currentWeight)
    : currentWeight > (history[1]?.weight || currentWeight);

  const totalWeightChange = history.length > 0 ? currentWeight - history[history.length - 1].weight : 0;
  const isProgressGood = goalDirection === "loss" ? totalWeightChange < 0 : totalWeightChange > 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold">Weight & Body Composition</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          data-testid="button-toggle-history"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {showHistory ? "Hide" : "History"}
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="goal-direction" className="text-sm mb-2 block">Goal Direction</Label>
          <Select value={goalDirection} onValueChange={(v) => setGoalDirection(v as typeof goalDirection)}>
            <SelectTrigger id="goal-direction" data-testid="select-goal-direction">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="loss">Weight Loss</SelectItem>
              <SelectItem value="gain">Weight Gain</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="current-weight" className="text-sm">Current Weight (kg)</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                id="current-weight"
                type="number"
                step="0.1"
                placeholder="70.0"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                data-testid="input-current-weight"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="goal-weight" className="text-sm">Goal Weight (kg)</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                id="goal-weight"
                type="number"
                step="0.1"
                placeholder="65.0"
                value={goalWeight}
                onChange={(e) => setGoalWeight(e.target.value)}
                data-testid="input-goal-weight"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="current-bodyfat" className="text-sm">Current Body Fat %</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                id="current-bodyfat"
                type="number"
                step="0.1"
                placeholder="18.0"
                value={newBodyFat || currentBodyFat}
                onChange={(e) => setNewBodyFat(e.target.value)}
                data-testid="input-current-bodyfat"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="goal-bodyfat" className="text-sm">Goal Body Fat %</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                id="goal-bodyfat"
                type="number"
                step="0.1"
                placeholder="12.0"
                value={goalBodyFat}
                onChange={(e) => setGoalBodyFat(e.target.value)}
                data-testid="input-goal-bodyfat"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleUpdateWeight} className="w-full" data-testid="button-update-weight">
          Update Weight
        </Button>

        {goalWeightNum > 0 && (
          <div className="pt-4 border-t border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {goalDirection === "loss" ? (
                  <TrendingDown className="w-5 h-5 text-success" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-chart-1" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">To Goal Weight</p>
                  <p className="text-lg font-bold font-mono" data-testid="text-weight-difference">
                    {weightDifference.toFixed(1)}kg
                  </p>
                </div>
              </div>
              {goalBodyFatNum > 0 && currentBodyFatNum > 0 && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">To Goal BF%</p>
                  <p className="text-lg font-bold font-mono" data-testid="text-bodyfat-difference">
                    {bodyFatDifference.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>

            {history.length > 1 && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Overall Progress</p>
                <p className={`text-lg font-bold font-mono ${isProgressGood ? "text-success" : "text-warning"}`} data-testid="text-total-change">
                  {totalWeightChange > 0 ? "+" : ""}{totalWeightChange.toFixed(1)}kg
                </p>
              </div>
            )}
          </div>
        )}

        {showHistory && history.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-semibold mb-3">History</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((entry, index) => (
                <div 
                  key={entry.date} 
                  className="flex items-center justify-between py-2 px-3 bg-muted rounded-md"
                  data-testid={`history-entry-${index}`}
                >
                  <div>
                    <p className="text-sm font-medium">{new Date(entry.date).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.bodyFat ? `${entry.bodyFat}% BF` : "No BF% data"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold font-mono">{entry.weight.toFixed(1)}kg</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
