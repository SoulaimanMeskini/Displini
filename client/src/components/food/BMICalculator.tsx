import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BMICalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [bmi, setBmi] = useState<number | null>(null);

  // Load user profile data on mount
  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      try {
        const userData = JSON.parse(profile);
        if (userData.weight && !weight) {
          setWeight(userData.weight.toString());
        }
        if (userData.height && !height) {
          setHeight(userData.height.toString());
        }
        if (userData.weightUnit) {
          setUnit(userData.weightUnit === 'kg' && userData.heightUnit === 'cm' ? 'metric' : 'imperial');
        }
      } catch (e) {
        console.error('Failed to load user profile:', e);
      }
    }
  }, []);

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    
    if (!w || !h || h === 0) return;

    let bmiValue: number;
    if (unit === "metric") {
      // BMI = weight (kg) / (height (m))^2
      const heightInMeters = h / 100;
      bmiValue = w / (heightInMeters * heightInMeters);
    } else {
      // BMI = (weight (lbs) / (height (in))^2) * 703
      bmiValue = (w / (h * h)) * 703;
    }

    setBmi(parseFloat(bmiValue.toFixed(1)));
  };

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { label: "Underweight", color: "text-blue-600", bg: "bg-blue-50" };
    if (bmiValue < 25) return { label: "Normal weight", color: "text-green-600", bg: "bg-green-50" };
    if (bmiValue < 30) return { label: "Overweight", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { label: "Obese", color: "text-red-600", bg: "bg-red-50" };
  };

  const category = bmi !== null ? getBMICategory(bmi) : null;

  return (
    <div>
      <div className="space-y-4">
        <div>
          <Label>Unit System</Label>
          <Select value={unit} onValueChange={(v: "metric" | "imperial") => setUnit(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">Metric (kg, cm)</SelectItem>
              <SelectItem value="imperial">Imperial (lbs, in)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="bmi-weight">
              Weight ({unit === "metric" ? "kg" : "lbs"})
            </Label>
            <Input
              id="bmi-weight"
              type="number"
              placeholder={unit === "metric" ? "70" : "154"}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="bmi-height">
              Height ({unit === "metric" ? "cm" : "in"})
            </Label>
            <Input
              id="bmi-height"
              type="number"
              placeholder={unit === "metric" ? "175" : "69"}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={calculateBMI} className="w-full">
          Calculate BMI
        </Button>

        {bmi !== null && category && (
          <div className={`p-4 rounded-lg ${category.bg} border-2 border-${category.color.replace('text-', '')}`}>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Your BMI</p>
              <p className={`text-4xl font-bold ${category.color}`}>{bmi}</p>
              <p className={`text-sm font-medium ${category.color} mt-1`}>
                {category.label}
              </p>
            </div>
            
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Underweight</span>
                <span className="text-muted-foreground">&lt; 18.5</span>
              </div>
              <div className="flex justify-between">
                <span>Normal weight</span>
                <span className="text-muted-foreground">18.5 - 24.9</span>
              </div>
              <div className="flex justify-between">
                <span>Overweight</span>
                <span className="text-muted-foreground">25 - 29.9</span>
              </div>
              <div className="flex justify-between">
                <span>Obese</span>
                <span className="text-muted-foreground">≥ 30</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

