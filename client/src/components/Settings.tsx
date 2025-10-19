import { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Edit } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [weekStartDay, setWeekStartDay] = useState("0");
  const [temperatureUnit, setTemperatureUnit] = useState("celsius");
  const [measurementUnit, setMeasurementUnit] = useState("metric");
  const [timezone, setTimezone] = useState("auto");
  const [showTaskTags, setShowTaskTags] = useState(true);
  const [confettiEnabled, setConfettiEnabled] = useState(true);
  const [showTodosInCalendar, setShowTodosInCalendar] = useState(false);
  const [stickyDateCarousel, setStickyDateCarousel] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const handleEditProfile = () => {
    // Reset onboarding flag to show the dialog again
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    profile.onboardingCompleted = false;
    localStorage.setItem('userProfile', JSON.stringify(profile));
    window.location.reload();
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("colorTheme") || "blue";
    const savedCustomColor = localStorage.getItem("customColor") || "#3b82f6";
    const savedWeekStart = localStorage.getItem("weekStartDay") || "0";
    const savedTempUnit = localStorage.getItem("temperatureUnit") || "celsius";
    const savedMeasureUnit = localStorage.getItem("measurementUnit") || "metric";
    const savedTimezone = localStorage.getItem("timezone") || "auto";
    const savedShowTags = localStorage.getItem("showTaskTags") !== "false"; // Default true
    const savedConfetti = localStorage.getItem("confettiEnabled") !== "false"; // Default true
    const savedShowTodosInCalendar = localStorage.getItem("showTodosInCalendar") === "true"; // Default false
    const savedStickyCarousel = localStorage.getItem("stickyDateCarousel") === "true"; // Default false
    setSelectedTheme(savedTheme);
    setCustomColor(savedCustomColor);
    setWeekStartDay(savedWeekStart);
    setTemperatureUnit(savedTempUnit);
    setMeasurementUnit(savedMeasureUnit);
    setTimezone(savedTimezone);
    setShowTaskTags(savedShowTags);
    setConfettiEnabled(savedConfetti);
    setShowTodosInCalendar(savedShowTodosInCalendar);
    setStickyDateCarousel(savedStickyCarousel);
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

  const handleWeekStartChange = (day: string) => {
    setWeekStartDay(day);
    localStorage.setItem("weekStartDay", day);
    window.dispatchEvent(new Event('weekStartDayChanged'));
  };

  const handleTemperatureUnitChange = (unit: string) => {
    setTemperatureUnit(unit);
    localStorage.setItem("temperatureUnit", unit);
  };

  const handleMeasurementUnitChange = (unit: string) => {
    setMeasurementUnit(unit);
    localStorage.setItem("measurementUnit", unit);
  };

  const handleTimezoneChange = (tz: string) => {
    setTimezone(tz);
    localStorage.setItem("timezone", tz);
    window.dispatchEvent(new Event('timezoneChanged'));
  };

  const handleShowTaskTagsChange = (checked: boolean) => {
    setShowTaskTags(checked);
    localStorage.setItem("showTaskTags", String(checked));
    window.dispatchEvent(new Event('taskTagsSettingChanged'));
  };

  const handleConfettiChange = (checked: boolean) => {
    setConfettiEnabled(checked);
    localStorage.setItem("confettiEnabled", String(checked));
  };

  const handleShowTodosInCalendarChange = (checked: boolean) => {
    setShowTodosInCalendar(checked);
    localStorage.setItem("showTodosInCalendar", String(checked));
    window.dispatchEvent(new Event('calendarTodosSettingChanged'));
  };

  const handleStickyCarouselChange = (checked: boolean) => {
    setStickyDateCarousel(checked);
    localStorage.setItem("stickyDateCarousel", String(checked));
    window.dispatchEvent(new Event('stickyCarouselSettingChanged'));
  };

  const initials = user 
    ? user.email?.[0]?.toUpperCase() || '?'
    : '?';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" data-testid="button-settings">
          <SettingsIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                    src={undefined} 
                    alt={user.email || 'User'}
                    className="object-cover"
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="font-medium">
                    {user.email || 'User'}
                  </span>
                  <span className="text-xs text-muted-foreground">View profile settings</span>
                </div>
              </Button>
            </div>
          )}

          <div>
            <Label className="text-base font-semibold mb-3 block">Personal Information</Label>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={handleEditProfile}
              data-testid="button-edit-profile"
            >
              <span>Edit Profile Info</span>
              <Edit className="w-4 h-4" />
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Update your gender, age, height, weight, and activity level
            </p>
          </div>
          
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

          <div>
            <Label htmlFor="week-start-day" className="text-base font-semibold mb-3 block">Week Starts On</Label>
            <Select value={weekStartDay} onValueChange={handleWeekStartChange}>
              <SelectTrigger id="week-start-day" data-testid="select-week-start-day">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sunday</SelectItem>
                <SelectItem value="1">Monday</SelectItem>
                <SelectItem value="2">Tuesday</SelectItem>
                <SelectItem value="3">Wednesday</SelectItem>
                <SelectItem value="4">Thursday</SelectItem>
                <SelectItem value="5">Friday</SelectItem>
                <SelectItem value="6">Saturday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="temperature-unit" className="text-base font-semibold mb-3 block">Temperature Unit</Label>
            <Select value={temperatureUnit} onValueChange={handleTemperatureUnitChange}>
              <SelectTrigger id="temperature-unit" data-testid="select-temperature-unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="celsius">Celsius (°C)</SelectItem>
                <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="measurement-unit" className="text-base font-semibold mb-3 block">Measurement System</Label>
            <Select value={measurementUnit} onValueChange={handleMeasurementUnitChange}>
              <SelectTrigger id="measurement-unit" data-testid="select-measurement-unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (cm, kg)</SelectItem>
                <SelectItem value="imperial">Imperial (ft, lb)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="timezone" className="text-base font-semibold mb-3 block">Timezone</Label>
            <Select value={timezone} onValueChange={handleTimezoneChange}>
              <SelectTrigger id="timezone" data-testid="select-timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="auto">Auto-detect</SelectItem>
                <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                <SelectItem value="America/New_York">Eastern Time (GMT-5)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (GMT-6)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (GMT-7)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (GMT-8)</SelectItem>
                <SelectItem value="America/Anchorage">Alaska Time (GMT-9)</SelectItem>
                <SelectItem value="Pacific/Honolulu">Hawaii Time (GMT-10)</SelectItem>
                <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                <SelectItem value="Europe/Paris">Paris/Berlin (GMT+1)</SelectItem>
                <SelectItem value="Europe/Athens">Athens (GMT+2)</SelectItem>
                <SelectItem value="Europe/Moscow">Moscow (GMT+3)</SelectItem>
                <SelectItem value="Asia/Dubai">Dubai (GMT+4)</SelectItem>
                <SelectItem value="Asia/Karachi">Karachi (GMT+5)</SelectItem>
                <SelectItem value="Asia/Dhaka">Dhaka (GMT+6)</SelectItem>
                <SelectItem value="Asia/Bangkok">Bangkok (GMT+7)</SelectItem>
                <SelectItem value="Asia/Shanghai">Beijing/Shanghai (GMT+8)</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo (GMT+9)</SelectItem>
                <SelectItem value="Australia/Sydney">Sydney (GMT+10)</SelectItem>
                <SelectItem value="Pacific/Auckland">Auckland (GMT+12)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="show-task-tags" className="text-base font-semibold mb-3 block">Display Options</Label>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 mb-2">
              <Label htmlFor="show-task-tags" className="cursor-pointer flex-1">
                Show task source tags in timeline
              </Label>
              <Switch
                id="show-task-tags"
                checked={showTaskTags}
                onCheckedChange={handleShowTaskTagsChange}
                data-testid="switch-show-task-tags"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <Label htmlFor="confetti-enabled" className="cursor-pointer flex-1">
                Show confetti when all tasks completed
              </Label>
              <Switch
                id="confetti-enabled"
                checked={confettiEnabled}
                onCheckedChange={handleConfettiChange}
                data-testid="switch-confetti-enabled"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <Label htmlFor="show-todos-in-calendar" className="cursor-pointer flex-1">
                Show To Do tasks in Calendar
              </Label>
              <Switch
                id="show-todos-in-calendar"
                checked={showTodosInCalendar}
                onCheckedChange={handleShowTodosInCalendarChange}
                data-testid="switch-show-todos-in-calendar"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <Label htmlFor="sticky-date-carousel" className="cursor-pointer flex-1">
                Pin Date Carousel (Sticky)
              </Label>
              <Switch
                id="sticky-date-carousel"
                checked={stickyDateCarousel}
                onCheckedChange={handleStickyCarouselChange}
                data-testid="switch-sticky-date-carousel"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
