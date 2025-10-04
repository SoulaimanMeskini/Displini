import { useState, useEffect } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const themes = [
  { id: "blue", name: "Blue", primary: "59 91% 47%", primaryDark: "210 100% 60%" },
  { id: "green", name: "Green", primary: "142 71% 45%", primaryDark: "142 71% 55%" },
  { id: "purple", name: "Purple", primary: "271 81% 56%", primaryDark: "271 81% 66%" },
  { id: "orange", name: "Orange", primary: "24 80% 58%", primaryDark: "24 80% 68%" },
  { id: "pink", name: "Pink", primary: "330 81% 60%", primaryDark: "330 81% 70%" },
];

export default function Settings() {
  const [selectedTheme, setSelectedTheme] = useState("blue");

  useEffect(() => {
    const savedTheme = localStorage.getItem("colorTheme") || "blue";
    setSelectedTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (theme) {
      const root = document.documentElement;
      root.style.setProperty("--primary", theme.primary);
      root.style.setProperty("--sidebar-primary", theme.primary);
      root.style.setProperty("--ring", theme.primary);
      root.style.setProperty("--sidebar-ring", theme.primary);
      
      if (document.documentElement.classList.contains("dark")) {
        root.style.setProperty("--primary", theme.primaryDark);
        root.style.setProperty("--sidebar-primary", theme.primaryDark);
        root.style.setProperty("--ring", theme.primaryDark);
        root.style.setProperty("--sidebar-ring", theme.primaryDark);
      }
    }
  };

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    localStorage.setItem("colorTheme", themeId);
    applyTheme(themeId);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-settings">
          <SettingsIcon className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div>
            <Label className="text-base font-semibold mb-4 block">Color Theme</Label>
            <RadioGroup value={selectedTheme} onValueChange={handleThemeChange}>
              <div className="space-y-3">
                {themes.map((theme) => (
                  <div key={theme.id} className="flex items-center space-x-3">
                    <RadioGroupItem
                      value={theme.id}
                      id={theme.id}
                      data-testid={`radio-theme-${theme.id}`}
                    />
                    <Label
                      htmlFor={theme.id}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <div
                        className="w-8 h-8 rounded-md border-2 border-border"
                        style={{ backgroundColor: `hsl(${theme.primary})` }}
                      />
                      <span>{theme.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
