# Universal Dialog Component Guide

## Overview
The `UniversalDialog` component provides a consistent, reusable dialog pattern across the entire application. All popups should use this component for visual consistency.

## Location
`client/src/components/shared/UniversalDialog.tsx`

## Features
✅ **Rounded corners** (`rounded-3xl`) - Modern, friendly appearance  
✅ **Consistent spacing** - Standardized padding and gaps  
✅ **Flexible footer** - Default save/cancel buttons or custom footer  
✅ **Responsive widths** - Multiple size presets (sm, md, lg, xl, 2xl, full)  
✅ **Optional description** - Subtitle support  
✅ **Customizable buttons** - Custom labels and handlers  

## Basic Usage

```tsx
import { UniversalDialog } from "@/components/shared";

<UniversalDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Add Medication"
  description="Enter your medication details"
  onSave={handleSave}
  onCancel={() => setIsOpen(false)}
  saveLabel="Add"
  cancelLabel="Cancel"
  maxWidth="md"
>
  {/* Your form content here */}
  <Input placeholder="Medication name" />
  <Input placeholder="Dosage" />
</UniversalDialog>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `open` | boolean | ✅ | - | Dialog open state |
| `onOpenChange` | (open: boolean) => void | ✅ | - | State change handler |
| `title` | string | ✅ | - | Dialog title |
| `description` | string | ❌ | - | Optional subtitle |
| `children` | ReactNode | ✅ | - | Dialog content |
| `footer` | ReactNode | ❌ | - | Custom footer (overrides default) |
| `onSave` | () => void | ❌ | - | Save button handler |
| `onCancel` | () => void | ❌ | - | Cancel button handler |
| `saveLabel` | string | ❌ | "Save" | Save button text |
| `cancelLabel` | string | ❌ | "Cancel" | Cancel button text |
| `maxWidth` | "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "full" | ❌ | "md" | Dialog width |
| `hideDefaultFooter` | boolean | ❌ | false | Hide default footer completely |

## Examples

### Simple Dialog (Auto-managed buttons)
```tsx
<UniversalDialog
  open={open}
  onOpenChange={setOpen}
  title="Add Water Intake"
  onSave={handleSave}
>
  <Input type="number" placeholder="Amount (ml)" />
</UniversalDialog>
```

### Custom Footer
```tsx
<UniversalDialog
  open={open}
  onOpenChange={setOpen}
  title="Confirm Delete"
  footer={
    <div className="flex gap-2">
      <Button variant="destructive" onClick={handleDelete}>Delete</Button>
      <Button variant="outline" onClick={() => setOpen(false)}>Keep</Button>
    </div>
  }
>
  <p>Are you sure you want to delete this?</p>
</UniversalDialog>
```

### Large Dialog
```tsx
<UniversalDialog
  open={open}
  onOpenChange={setOpen}
  title="Edit Sleep Schedule"
  maxWidth="xl"
  onSave={handleSave}
  onCancel={() => setOpen(false)}
>
  {/* Complex form with multiple sections */}
</UniversalDialog>
```

### No Footer
```tsx
<UniversalDialog
  open={open}
  onOpenChange={setOpen}
  title="Information"
  hideDefaultFooter
>
  <p>This is an informational dialog.</p>
</UniversalDialog>
```

## Components That Should Use UniversalDialog

### Health Tab
- ✅ Add Medication
- ✅ Sleep Schedule Setup
- ✅ Blood Glucose Log
- ✅ Mood Tracker
- ✅ Stress Meter
- ✅ Breathing Exercises Settings
- ✅ Menstrual Cycle Setup

### Food Tab
- ✅ Add Meal / Log Food
- ✅ Water Goal Settings
- ✅ Macro Calculator
- ✅ BMI Calculator

### Sport Tab
- ✅ Add Workout
- ✅ Step Counter Settings
- ✅ Activity Log

### Other
- ✅ Reminders Dialog
- ✅ Winddown & Startup Dialog
- ✅ Settings Dialogs

## Migration Checklist

When migrating an existing dialog:

1. ✅ Import `UniversalDialog` from `@/components/shared`
2. ✅ Replace `<Dialog>`, `<DialogContent>`, `<DialogHeader>`, etc.
3. ✅ Move title to `title` prop
4. ✅ Move description (if any) to `description` prop
5. ✅ Move save handler to `onSave` prop
6. ✅ Move cancel handler to `onCancel` prop
7. ✅ Move form content to `children`
8. ✅ Remove manual footer if using default buttons
9. ✅ Set appropriate `maxWidth` if needed
10. ✅ Test open/close behavior

## Global Dialog Styling

All dialogs automatically have:
- **Border radius**: `rounded-3xl` (24px)
- **Padding**: 24px (p-6)
- **Backdrop**: Dark overlay with blur
- **Animations**: Smooth fade and zoom
- **Shadow**: Elevated appearance
- **Responsive**: Mobile-friendly
- **Accessibility**: Keyboard navigation and ARIA labels

## Changing Global Dialog Styling

To change the styling for ALL dialogs:

1. Edit `client/src/components/ui/dialog.tsx` for base styles
2. Edit `client/src/components/shared/UniversalDialog.tsx` for wrapper styles

**Example**: To change corner radius globally:
```tsx
// In dialog.tsx, change:
"rounded-3xl"  // to any other rounded class
```

All dialogs will update automatically! 🎉

