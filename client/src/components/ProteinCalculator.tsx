import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProteinCalculator() {
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [target, setTarget] = useState<number | null>(null);

  const calculateProtein = () => {
    const weightNum = parseFloat(weight);
    if (weightNum > 0) {
      const multiplier = gender === "male" ? 1.6 : 1.4;
      setTarget(Math.round(weightNum * multiplier));
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <h2 className="text-lg font-semibold mb-4">Protein Calculator</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="weight" className="text-primary-foreground/90">Your Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="70"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-2 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
            data-testid="input-weight"
          />
        </div>

        <div>
          <Label className="text-primary-foreground/90 mb-2 block">Gender</Label>
          <div className="flex gap-2">
            <Button
              variant={gender === "male" ? "default" : "outline"}
              onClick={() => setGender("male")}
              className={`flex-1 ${gender === "male" ? "bg-primary-foreground text-primary" : "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"}`}
              data-testid="button-gender-male"
            >
              Male
            </Button>
            <Button
              variant={gender === "female" ? "default" : "outline"}
              onClick={() => setGender("female")}
              className={`flex-1 ${gender === "female" ? "bg-primary-foreground text-primary" : "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"}`}
              data-testid="button-gender-female"
            >
              Female
            </Button>
          </div>
        </div>

        <Button
          onClick={calculateProtein}
          className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          data-testid="button-calculate"
        >
          Calculate
        </Button>

        {target !== null && (
          <div className="text-center pt-4 border-t border-primary-foreground/20">
            <p className="text-sm text-primary-foreground/80 mb-2">Daily Protein Target</p>
            <p className="text-4xl font-bold font-mono" data-testid="text-protein-target">{target}g</p>
          </div>
        )}
      </div>
    </Card>
  );
}
