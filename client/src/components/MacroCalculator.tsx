import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MacroResults {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MacroCalculatorProps {
  onCalculate?: (results: MacroResults) => void;
}

export default function MacroCalculator({ onCalculate }: MacroCalculatorProps) {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [trainingDays, setTrainingDays] = useState("");
  const [goal, setGoal] = useState<"cutting" | "lean-bulk" | "bulking">("lean-bulk");
  const [results, setResults] = useState<MacroResults | null>(null);

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateMacros = () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const trainingNum = parseFloat(trainingDays);
    
    if (!weightNum || !heightNum || !dateOfBirth || !trainingNum) return;

    const age = calculateAge(dateOfBirth);
    
    let bmr;
    if (gender === "male") {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * age + 5;
    } else {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * age - 161;
    }

    let activityMultiplier = 1.2;
    if (trainingNum >= 6) activityMultiplier = 1.725;
    else if (trainingNum >= 4) activityMultiplier = 1.55;
    else if (trainingNum >= 2) activityMultiplier = 1.375;

    let tdee = bmr * activityMultiplier;

    let kcal = tdee;
    let proteinPerKg = 2.0;
    let fatPercentage = 0.25;
    
    if (goal === "cutting") {
      kcal = tdee * 0.8;
      proteinPerKg = 2.2;
      fatPercentage = 0.25;
    } else if (goal === "bulking") {
      kcal = tdee * 1.15;
      proteinPerKg = 1.8;
      fatPercentage = 0.3;
    } else {
      kcal = tdee * 1.05;
      proteinPerKg = 2.0;
      fatPercentage = 0.27;
    }

    const protein = Math.round(weightNum * proteinPerKg);
    const fat = Math.round((kcal * fatPercentage) / 9);
    const proteinKcal = protein * 4;
    const fatKcal = fat * 9;
    const carbKcal = kcal - proteinKcal - fatKcal;
    const carbs = Math.round(carbKcal / 4);

    const calculatedResults = {
      kcal: Math.round(kcal),
      protein,
      carbs,
      fat,
    };

    setResults(calculatedResults);
    if (onCalculate) {
      onCalculate(calculatedResults);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <h2 className="text-lg font-semibold mb-4">Macro Calculator</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="weight" className="text-primary-foreground/90 text-sm">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
              data-testid="input-weight"
            />
          </div>
          <div>
            <Label htmlFor="height" className="text-primary-foreground/90 text-sm">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder="175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="mt-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
              data-testid="input-height"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="dob" className="text-primary-foreground/90 text-sm">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="mt-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
            data-testid="input-date-of-birth"
          />
        </div>

        <div>
          <Label className="text-primary-foreground/90 mb-2 block text-sm">Gender</Label>
          <div className="flex gap-2">
            <Button
              variant={gender === "male" ? "default" : "outline"}
              onClick={() => setGender("male")}
              className={`flex-1 h-9 ${gender === "male" ? "bg-primary-foreground text-primary" : "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"}`}
              data-testid="button-gender-male"
            >
              Male
            </Button>
            <Button
              variant={gender === "female" ? "default" : "outline"}
              onClick={() => setGender("female")}
              className={`flex-1 h-9 ${gender === "female" ? "bg-primary-foreground text-primary" : "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"}`}
              data-testid="button-gender-female"
            >
              Female
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="training" className="text-primary-foreground/90 text-sm">Training Days per Week</Label>
          <Input
            id="training"
            type="number"
            placeholder="3"
            min="0"
            max="7"
            value={trainingDays}
            onChange={(e) => setTrainingDays(e.target.value)}
            className="mt-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
            data-testid="input-training-days"
          />
        </div>

        <div>
          <Label className="text-primary-foreground/90 mb-2 block text-sm">Goal</Label>
          <RadioGroup value={goal} onValueChange={(v) => setGoal(v as typeof goal)} className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cutting" id="cutting" className="border-primary-foreground/50" data-testid="radio-goal-cutting" />
              <Label htmlFor="cutting" className="text-primary-foreground/90 text-sm cursor-pointer">Cutting / Losing Weight</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lean-bulk" id="lean-bulk" className="border-primary-foreground/50" data-testid="radio-goal-lean-bulk" />
              <Label htmlFor="lean-bulk" className="text-primary-foreground/90 text-sm cursor-pointer">Lean Bulking</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bulking" id="bulking" className="border-primary-foreground/50" data-testid="radio-goal-bulking" />
              <Label htmlFor="bulking" className="text-primary-foreground/90 text-sm cursor-pointer">Bulking / Gaining Weight</Label>
            </div>
          </RadioGroup>
        </div>

        <Button
          onClick={calculateMacros}
          className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          data-testid="button-calculate"
        >
          Calculate
        </Button>

        {results && (
          <div className="pt-4 border-t border-primary-foreground/20 space-y-3">
            <p className="text-sm text-primary-foreground/80 text-center mb-3">Daily Targets</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold font-mono" data-testid="text-kcal-target">{results.kcal}</p>
                <p className="text-xs text-primary-foreground/80">Calories</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono" data-testid="text-protein-target">{results.protein}g</p>
                <p className="text-xs text-primary-foreground/80">Protein</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono" data-testid="text-carbs-target">{results.carbs}g</p>
                <p className="text-xs text-primary-foreground/80">Carbs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono" data-testid="text-fat-target">{results.fat}g</p>
                <p className="text-xs text-primary-foreground/80">Fat</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
