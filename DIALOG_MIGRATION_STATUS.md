# Dialog Migration Status

## ✅ Completed Migrations

### Health Components
- ✅ **BloodGlucoseTracker** - Both dialogs migrated (Log Reading + Settings)

### Infrastructure  
- ✅ **UniversalDialog** - Created with meal log styling
- ✅ **Base dialog.tsx** - Updated with `rounded-3xl`

---

## 🔄 In Progress Migrations

### Health Components (6 files)
1. **BreathingExercises.tsx** - Settings dialog
2. **MenstrualCycleTracker.tsx** - Setup + Edit dialogs  
3. **WinddownStartupDialog.tsx** - Winddown + Startup dialogs
4. **MoodTracker** (if has dialogs)
5. **StressMeter** (if has dialogs)
6. **AlcoholSmokingTracker** (if has dialogs)

### Food Components (2 files)
1. **WaterTracker.tsx** - Settings dialog
2. **EnhancedMealLog.tsx** - Add meal dialog

### Sport Components (1 file)
1. **StepCounter.tsx** - Settings dialog

---

## ⏳ Pending Migrations

### Other Components
- **Settings.tsx** - Multiple dialogs
- **ManageColumns.tsx** - Column management
- **RemindersDialog.tsx** - Reminder management
- **OnboardingDialog.tsx** - Onboarding wizard (keep as-is, complex)
- **AIChatBubble.tsx** - AI chat (keep as-is, special styling)
- **MonthlyStatsModal.tsx** - Stats display
- **AddTask.tsx** - Add task dialog
- **OfficeProductivity.tsx** - Task management
- **TimelineTask.tsx** - Task editing

---

## Migration Template

### Before:
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <div className="space-y-4 pt-4">
      {/* content */}
      <Button onClick={handleSave} className="w-full">
        Save
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

### After:
```tsx
import { UniversalDialog } from "@/components/shared";

<UniversalDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Dialog Title"
  onSave={handleSave}
  onCancel={() => setIsOpen(false)}
  saveLabel="Save"
>
  {/* content without wrapping div or button */}
</UniversalDialog>
```

---

## Benefits Per Migration

- ✅ Consistent `max-w-md` width (matches meal log)
- ✅ Automatic rounded corners (`rounded-3xl`)
- ✅ Scrollable content (`max-h-[90vh]`)
- ✅ Auto-managed Save/Cancel buttons
- ✅ ~15-20 lines of code reduction per dialog
- ✅ Centralized styling - change once, updates everywhere

---

## Estimated Total Impact

| Category | Dialogs | Lines Saved |
|----------|---------|-------------|
| Health | ~8 dialogs | ~120-160 lines |
| Food | ~2 dialogs | ~30-40 lines |
| Sport | ~2 dialogs | ~30-40 lines |
| Other | ~8 dialogs | ~120-160 lines |
| **Total** | **~20 dialogs** | **~300-400 lines** |

---

## Next Steps

1. ✅ Complete Health components
2. ✅ Complete Food components  
3. ✅ Complete Sport components
4. 🔄 Review Other components (some may not need migration)
5. 📝 Update documentation
6. ✅ Remove unused Dialog imports

---

## Notes

- **OnboardingDialog**: Keep as-is (complex wizard, custom styling)
- **AIChatBubble**: Keep as-is (special chat interface)
- **Command.tsx**: UI component, don't touch
- Simple info dialogs can be migrated easily
- Complex multi-step wizards may need custom implementation

