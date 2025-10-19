import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Edit } from "lucide-react";

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
  const [weight, setWeight] = useState(() => {
    const saved = localStorage.getItem('calculator_weight');
    if (saved) return saved;
    
    // Try to load from user profile
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      try {
        const userData = JSON.parse(profile);
        return userData.weight ? userData.weight.toString() : "";
      } catch (e) {
        return "";
      }
    }
    return "";
  });
  
  const [height, setHeight] = useState(() => {
    const saved = localStorage.getItem('calculator_height');
    if (saved) return saved;
    
    // Try to load from user profile
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      try {
        const userData = JSON.parse(profile);
        return userData.height ? userData.height.toString() : "";
      } catch (e) {
        return "";
      }
    }
    return "";
  });
  
  const [dateOfBirth, setDateOfBirth] = useState(() => {
    const saved = localStorage.getItem('calculator_dob');
    if (saved) return saved;
    
    // Try to load from user profile
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      try {
        const userData = JSON.parse(profile);
        return userData.dateOfBirth || "";
      } catch (e) {
        return "";
      }
    }
    return "";
  });
  
  const [gender, setGender] = useState<"male" | "female">(() => {
    const saved = localStorage.getItem('calculator_gender');
    if (saved) return saved as "male" | "female";
    
    // Try to load from user profile
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      try {
        const userData = JSON.parse(profile);
        if (userData.gender === 'male' || userData.gender === 'female') {
          return userData.gender;
        }
      } catch (e) {
        return "male";
      }
    }
    return "male";
  });
  
  const [trainingDays, setTrainingDays] = useState(() => localStorage.getItem('calculator_training') || "");
  const [goal, setGoal] = useState<"cutting" | "lean-bulk" | "bulking" | "maintenance">(() => (localStorage.getItem('calculator_goal') as "cutting" | "lean-bulk" | "bulking" | "maintenance") || "lean-bulk");
  const [results, setResults] = useState<MacroResults | null>(() => {
    const saved = localStorage.getItem('calculator_results');
    return saved ? JSON.parse(saved) : null;
  });
  const [showForm, setShowForm] = useState(() => {
    const saved = localStorage.getItem('calculator_results');
    return !saved;
  });

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

    localStorage.setItem('calculator_weight', weight);
    localStorage.setItem('calculator_height', height);
    localStorage.setItem('calculator_dob', dateOfBirth);
    localStorage.setItem('calculator_gender', gender);
    localStorage.setItem('calculator_training', trainingDays);
    localStorage.setItem('calculator_goal', goal);

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
    } else if (goal === "maintenance") {
      kcal = tdee;
      proteinPerKg = 1.6;
      fatPercentage = 0.25;
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
    localStorage.setItem('calculator_results', JSON.stringify(calculatedResults));
    setShowForm(false);
    if (onCalculate) {
      onCalculate(calculatedResults);
    }
  };

  const handleEdit = () => {
    setShowForm(true);
  };

  if (results && !showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Daily Targets</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEdit}
            data-testid="button-edit-calculator"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-primary/10 text-center">
            <p className="text-2xl font-bold font-mono text-primary" data-testid="text-kcal-target">{results.kcal}</p>
            <p className="text-xs text-muted-foreground mt-1">Calories</p>
          </div>
          <div className="p-3 rounded-lg bg-success/10 text-center">
            <p className="text-2xl font-bold font-mono text-success" data-testid="text-protein-target">{results.protein}g</p>
            <p className="text-xs text-muted-foreground mt-1">Protein</p>
          </div>
          <div className="p-3 rounded-lg bg-chart-2/10 text-center">
            <p className="text-2xl font-bold font-mono text-chart-2" data-testid="text-carbs-target">{results.carbs}g</p>
            <p className="text-xs text-muted-foreground mt-1">Carbs</p>
          </div>
          <div className="p-3 rounded-lg bg-warning/10 text-center">
            <p className="text-2xl font-bold font-mono text-warning" data-testid="text-fat-target">{results.fat}g</p>
            <p className="text-xs text-muted-foreground mt-1">Fat</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="weight" className="text-sm">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1"
              data-testid="input-weight"
            />
          </div>
          <div>
            <Label htmlFor="height" className="text-sm">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder="175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="mt-1"
              data-testid="input-height"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="dob" className="text-sm">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="mt-1"
            data-testid="input-date-of-birth"
          />
        </div>

        <div>
          <Label className="mb-2 block text-sm">Gender</Label>
          <div className="flex gap-2">
            <Button
              variant={gender === "male" ? "default" : "outline"}
              onClick={() => setGender("male")}
              className="flex-1"
              data-testid="button-gender-male"
            >
              Male
            </Button>
            <Button
              variant={gender === "female" ? "default" : "outline"}
              onClick={() => setGender("female")}
              className="flex-1"
              data-testid="button-gender-female"
            >
              Female
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="training" className="text-sm">Training Days per Week</Label>
          <Input
            id="training"
            type="number"
            placeholder="3"
            min="0"
            max="7"
            value={trainingDays}
            onChange={(e) => setTrainingDays(e.target.value)}
            className="mt-1"
            data-testid="input-training-days"
          />
        </div>

        <div>
          <Label className="mb-2 block text-sm">Goal</Label>
          <RadioGroup value={goal} onValueChange={(v) => setGoal(v as typeof goal)} className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cutting" id="cutting" data-testid="radio-goal-cutting" />
              <Label htmlFor="cutting" className="text-sm cursor-pointer">Cutting / Losing Weight</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lean-bulk" id="lean-bulk" data-testid="radio-goal-lean-bulk" />
              <Label htmlFor="lean-bulk" className="text-sm cursor-pointer">Lean Bulking</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="maintenance" id="maintenance" data-testid="radio-goal-maintenance" />
              <Label htmlFor="maintenance" className="text-sm cursor-pointer">Maintenance / Regular Eating</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bulking" id="bulking" data-testid="radio-goal-bulking" />
              <Label htmlFor="bulking" className="text-sm cursor-pointer">Bulking / Gaining Weight</Label>
            </div>
          </RadioGroup>
        </div>

        <Button
          onClick={calculateMacros}
          className="w-full"
          data-testid="button-calculate"
        >
          Calculate
        </Button>
      </div>
    </div>
  );
}
