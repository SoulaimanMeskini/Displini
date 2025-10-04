import { useState, useEffect } from "react";
import { Settings as SettingsIcon, User } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "wouter";

const themes = [
  { id: "blue", name: "Blue", primary: "59 91% 47%", primaryDark: "210 100% 60%" },
  { id: "green", name: "Green", primary: "142 71% 45%", primaryDark: "142 71% 55%" },
  { id: "purple", name: "Purple", primary: "271 81% 56%", primaryDark: "271 81% 66%" },
  { id: "orange", name: "Orange", primary: "24 80% 58%", primaryDark: "24 80% 68%" },
  { id: "pink", name: "Pink", primary: "330 81% 60%", primaryDark: "330 81% 70%" },
  { id: "custom", name: "Custom", primary: "", primaryDark: "" },
];

export default function Settings() {
  const [selectedTheme, setSelectedTheme] = useState("blue");
  const [customColor, setCustomColor] = useState("#3b82f6");
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem("colorTheme") || "blue";
    const savedCustomColor = localStorage.getItem("customColor") || "#3b82f6";
    setSelectedTheme(savedTheme);
    setCustomColor(savedCustomColor);
    applyTheme(savedTheme, savedCustomColor);
  }, []);

  const hexToHSL = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "210 100% 60%";

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
  };

  const applyTheme = (themeId: string, color?: string) => {
    const theme = themes.find((t) => t.id === themeId);
    const root = document.documentElement;
    
    let primaryColor = theme?.primary || "";
    let primaryDarkColor = theme?.primaryDark || "";

    if (themeId === "custom" && color) {
      const hsl = hexToHSL(color);
      primaryColor = hsl;
      const [h, s, l] = hsl.split(" ");
      const lightness = parseInt(l);
      primaryDarkColor = `${h} ${s} ${Math.min(lightness + 10, 90)}%`;
    }

    if (primaryColor) {
      root.style.setProperty("--primary", primaryColor);
      root.style.setProperty("--sidebar-primary", primaryColor);
      root.style.setProperty("--ring", primaryColor);
      root.style.setProperty("--sidebar-ring", primaryColor);
      
      if (document.documentElement.classList.contains("dark")) {
        root.style.setProperty("--primary", primaryDarkColor);
        root.style.setProperty("--sidebar-primary", primaryDarkColor);
        root.style.setProperty("--ring", primaryDarkColor);
        root.style.setProperty("--sidebar-ring", primaryDarkColor);
      }
    }
  };

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    localStorage.setItem("colorTheme", themeId);
    applyTheme(themeId, customColor);
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    localStorage.setItem("customColor", color);
    if (selectedTheme === "custom") {
      applyTheme("custom", color);
    }
  };

  const initials = user 
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'
    : '?';

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
          {user && (
            <div>
              <Label className="text-base font-semibold mb-3 block">Profile</Label>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={() => setLocation("/profile")}
                data-testid="button-profile"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={user.profileImageUrl || undefined} 
                    alt={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User'}
                    className="object-cover"
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="font-medium">
                    {user.firstName || user.lastName 
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
                      : user.email || 'User'}
                  </span>
                  <span className="text-xs text-muted-foreground">View profile settings</span>
                </div>
              </Button>
            </div>
          )}
          
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
                      {theme.id === "custom" ? (
                        <Input
                          type="color"
                          value={customColor}
                          onChange={(e) => handleCustomColorChange(e.target.value)}
                          className="w-8 h-8 rounded-md border-2 border-border cursor-pointer"
                          data-testid="input-custom-color"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-md border-2 border-border"
                          style={{ backgroundColor: `hsl(${theme.primary})` }}
                        />
                      )}
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
