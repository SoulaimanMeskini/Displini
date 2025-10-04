import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingDown, TrendingUp, Target } from "lucide-react";

interface WeightGoalTrackerProps {
  currentWeight: number;
  onWeightUpdate?: (weight: number) => void;
}

export default function WeightGoalTracker({ currentWeight, onWeightUpdate }: WeightGoalTrackerProps) {
  const [goalWeight, setGoalWeight] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [streak, setStreak] = useState(7);

  const handleSetGoal = () => {
    console.log("Goal weight set:", goalWeight);
  };

  const handleUpdateWeight = () => {
    if (newWeight && onWeightUpdate) {
      onWeightUpdate(parseFloat(newWeight));
      setNewWeight("");
    }
  };

  const goalWeightNum = parseFloat(goalWeight) || 0;
  const difference = goalWeightNum ? currentWeight - goalWeightNum : 0;
  const progress = goalWeightNum ? Math.min(Math.abs(difference) / Math.abs(difference) * 100, 100) : 0;

  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold mb-4">Weight Goal</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="current-weight" className="text-sm">Current Weight</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                id="current-weight"
                type="number"
                placeholder="70"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                data-testid="input-current-weight"
              />
              <Button size="sm" onClick={handleUpdateWeight} data-testid="button-update-weight">
                Set
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="goal-weight" className="text-sm">Goal Weight</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                id="goal-weight"
                type="number"
                placeholder="65"
                value={goalWeight}
                onChange={(e) => setGoalWeight(e.target.value)}
                data-testid="input-goal-weight"
              />
              <Button size="sm" onClick={handleSetGoal} data-testid="button-set-goal">
                Set
              </Button>
            </div>
          </div>
        </div>

        {goalWeightNum > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {difference > 0 ? (
                  <TrendingDown className="w-5 h-5 text-success" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-chart-1" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">To Goal</p>
                  <p className="text-lg font-bold font-mono" data-testid="text-weight-difference">
                    {Math.abs(difference).toFixed(1)}kg
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-lg font-bold font-mono text-warning" data-testid="text-streak">
                  {streak} days
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold" data-testid="text-progress-percentage">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
