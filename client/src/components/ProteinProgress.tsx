import { Card } from "@/components/ui/card";

interface ProteinProgressProps {
  current: number;
  target: number;
}

export default function ProteinProgress({ current, target }: ProteinProgressProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold mb-6">Today's Progress</h3>
      
      <div className="flex justify-center">
        <div className="relative w-52 h-52">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="104"
              cy="104"
              r="80"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="104"
              cy="104"
              r="80"
              stroke="hsl(var(--chart-1))"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-bold font-mono" data-testid="text-current-protein">{current}g</p>
            <p className="text-sm text-muted-foreground">of {target}g</p>
            <p className="text-lg font-semibold text-chart-1 mt-1" data-testid="text-protein-percentage">{Math.round(percentage)}%</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
