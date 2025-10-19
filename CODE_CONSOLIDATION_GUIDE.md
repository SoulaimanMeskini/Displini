# Code Consolidation Guide

## Overview
This guide documents the standardization and deduplication efforts across the Displini codebase.

---

## ✅ **Completed Improvements**

### 1. **UniversalDialog Component** (`client/src/components/shared/UniversalDialog.tsx`)

**Purpose**: Single source of truth for all dialog/popup styling

**Key Features**:
- ✅ Fixed width: `max-w-md` (matches meal log styling)
- ✅ Scrollable content: `max-h-[90vh] overflow-y-auto`
- ✅ Rounded corners: `rounded-3xl` (24px)
- ✅ Consistent spacing: `space-y-4 py-4`
- ✅ Auto-managed footer with save/cancel buttons
- ✅ Optional custom footer
- ✅ Responsive button layout

**Changes from Original**:
```diff
- maxWidth prop with multiple options (sm, md, lg, xl, 2xl, full)
+ Fixed max-w-md for consistency (like meal log)

- No scrolling by default
+ Always scrollable with max-h-[90vh]

+ Added scrollable prop for special cases
```

**Usage Example**:
```tsx
<UniversalDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Add Medication"
  onSave={handleSave}
  onCancel={() => setIsOpen(false)}
>
  <Input placeholder="Name" />
  <Input placeholder="Dosage" />
</UniversalDialog>
```

---

### 2. **Base Dialog Styling** (`client/src/components/ui/dialog.tsx`)

**Change**:
```diff
- sm:rounded-lg
+ rounded-3xl
```

**Result**: ALL dialogs now have rounded corners automatically!

---

### 3. **useSectionManager Hook** (`client/src/hooks/useSectionManager.ts`)

**Purpose**: Eliminate duplicate code for managing sections/columns across tabs

**What it replaces**:
```tsx
// OLD WAY (duplicated in Health, Food, Sport):
const [enabledSections, setEnabledSections] = useState(() => {
  const saved = localStorage.getItem('healthEnabledSections');
  return saved ? JSON.parse(saved) : defaultVisibility;
});

useEffect(() => {
  localStorage.setItem('healthEnabledSections', JSON.stringify(enabledSections));
}, [enabledSections]);

// ... repeated for sectionOrder and minimizedSections
```

**NEW WAY (single hook)**:
```tsx
const {
  enabledSections,
  setEnabledSections,
  sectionOrder,
  setSectionOrder,
  minimizedSections,
  setMinimizedSections,
} = useSectionManager({
  storagePrefix: 'health',
  defaultOrder: ['sleep', 'cycle', 'meds'],
  defaultVisibility: { sleep: true, cycle: true, meds: true },
});
```

**Benefits**:
- ✅ Reduces ~30-40 lines of code per page
- ✅ Consistent localStorage naming
- ✅ Auto-persists to localStorage
- ✅ Type-safe
- ✅ Reusable across Health, Food, Sport tabs

---

### 4. **Storage Utilities** (`client/src/lib/storageUtils.ts`)

**Purpose**: Centralize localStorage operations and common data access

**Functions**:

#### `getStorageItem<T>(key, fallback)`
Safe localStorage read with error handling:
```tsx
// Instead of:
const saved = localStorage.getItem('meals');
const meals = saved ? JSON.parse(saved) : [];

// Use:
const meals = getStorageItem('meals', []);
```

#### `setStorageItem<T>(key, value)`
Safe localStorage write:
```tsx
// Instead of:
localStorage.setItem('meals', JSON.stringify(meals));

// Use:
setStorageItem('meals', meals);
```

#### `getUserProfile()`
Get user profile with defaults:
```tsx
const profile = getUserProfile();
console.log(profile.weight, profile.height);
```

#### `getCurrentWeight()`
Quick access to user's weight:
```tsx
const weight = getCurrentWeight(); // Returns 0 if not set
```

#### `getSleepSchedule()`
Get sleep schedule:
```tsx
const schedule = getSleepSchedule();
```

#### `formatDateKey(date)`
Consistent date formatting for storage keys:
```tsx
const key = formatDateKey(new Date()); // "2025-10-19"
```

---

## 🔄 **Migration Roadmap**

### Phase 1: Dialogs (In Progress)
Migrate all dialogs to use `UniversalDialog`:

#### Health Tab
- [ ] Add Medication
- [ ] Sleep Schedule Setup  
- [ ] Blood Glucose Log
- [ ] Mood Tracker
- [ ] Stress Meter
- [ ] Breathing Exercises Settings
- [ ] Menstrual Cycle Setup
- [ ] Winddown & Startup Dialog

#### Food Tab
- [ ] Add Meal / Log Food
- [ ] Water Goal Settings
- [ ] Macro Calculator (form section)
- [ ] BMI Calculator (form section)

#### Sport Tab
- [ ] Add Workout
- [ ] Step Counter Settings

#### Other
- [ ] Reminders Dialog
- [ ] Settings Dialogs

### Phase 2: Section Management
Replace manual section management with `useSectionManager` hook:

- [ ] Health.tsx - Section visibility/order/minimized
- [ ] Food.tsx - Column visibility/order/minimized
- [ ] Sport.tsx - Column visibility/order/minimized

### Phase 3: Storage Operations
Replace manual localStorage calls with utility functions:

- [ ] All `localStorage.getItem` → `getStorageItem`
- [ ] All `localStorage.setItem` → `setStorageItem`
- [ ] User profile access → `getUserProfile()`, `getCurrentWeight()`
- [ ] Date formatting → `formatDateKey()`

---

## 📊 **Expected Impact**

### Code Reduction
- **Per dialog**: ~15-20 lines saved
- **Per page (sections)**: ~30-40 lines saved
- **Per localStorage operation**: ~3-5 lines saved

### Total Estimated Reduction
- **~500-800 lines** of duplicate code removed
- **~30-40%** less boilerplate in page components

### Quality Improvements
- ✅ Consistent styling across all dialogs
- ✅ Type-safe storage operations
- ✅ Error handling built-in
- ✅ Easier to maintain
- ✅ Single source of truth for common patterns

---

## 🎯 **Best Practices**

### When to Use UniversalDialog
✅ Any popup/modal for user input
✅ Settings dialogs
✅ Confirmation dialogs
✅ Forms with save/cancel

### When NOT to Use
❌ Full-page modals (use Sheet instead)
❌ Complex wizards (create custom component)
❌ Notifications (use Toast)

### When to Use useSectionManager
✅ Managing tab sections/columns
✅ User-customizable layouts
✅ Visibility toggles
✅ Drag-and-drop ordering

### When to Use Storage Utilities
✅ Any localStorage read/write
✅ User profile access
✅ Date-based storage keys
✅ Shared data access

---

## 📝 **Migration Example**

### Before (Health.tsx)
```tsx
const [enabledSections, setEnabledSections] = useState(() => {
  const saved = localStorage.getItem('healthEnabledSections');
  return saved ? JSON.parse(saved) : {
    sleep: true,
    cycle: true,
    meds: true,
  };
});

const [minimizedSections, setMinimizedSections] = useState(() => {
  const saved = localStorage.getItem('healthMinimizedSections');
  return saved ? JSON.parse(saved) : {};
});

useEffect(() => {
  localStorage.setItem('healthEnabledSections', JSON.stringify(enabledSections));
}, [enabledSections]);

useEffect(() => {
  localStorage.setItem('healthMinimizedSections', JSON.stringify(minimizedSections));
}, [minimizedSections]);

const getCurrentWeight = () => {
  const profile = localStorage.getItem('userProfile');
  if (profile) {
    try {
      const userData = JSON.parse(profile);
      return userData.weight || 0;
    } catch (e) {
      return 0;
    }
  }
  return 0;
};
```

### After
```tsx
import { useSectionManager } from '@/hooks/useSectionManager';
import { getCurrentWeight } from '@/lib/storageUtils';

const {
  enabledSections,
  setEnabledSections,
  minimizedSections,
  setMinimizedSections,
} = useSectionManager({
  storagePrefix: 'health',
  defaultOrder: ['sleep', 'cycle', 'meds'],
  defaultVisibility: { sleep: true, cycle: true, meds: true },
});

const weight = getCurrentWeight();
```

**Lines of code**: ~40 → ~10 (75% reduction!)

---

## 🚀 **Next Steps**

1. ✅ UniversalDialog created
2. ✅ useSectionManager hook created
3. ✅ Storage utilities created
4. 🔄 Migrate existing dialogs one by one
5. 🔄 Migrate section management in pages
6. 🔄 Replace localStorage calls with utilities
7. 📝 Update component documentation

---

## 💡 **Tips**

- **Test as you migrate**: Don't migrate everything at once
- **One component at a time**: Easier to track issues
- **Check localStorage keys**: Ensure they match after migration
- **Preserve existing data**: Don't break user's saved preferences
- **Update imports**: Use absolute imports (`@/`) for consistency

