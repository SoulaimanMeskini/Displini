# Component Standardization Patterns

## Unified Container Pattern

All containers in Health, Food, and Sport tabs follow this standardized structure for consistency and efficiency.

### Standard Container Structure

```typescript
<EnhancedMinimizableCard
  title="🔥 Component Title"
  isEmpty={items.length === 0}
  onAdd={() => setIsAddOpen(true)}
  onSettings={hasSettings ? () => setIsSettingsOpen(true) : undefined}
  minimized={minimized}
  onMinimizeChange={setMinimized}
>
  {/* Content when not empty */}
</EnhancedMinimizableCard>
```

### Button Placement Rules

#### When Container is Empty (No Data):
```
┌─────────────────────────────┐
│ 🔥 Title          [Settings][↑] │
├─────────────────────────────┤
│                             │
│           ┌─────┐           │
│           │  +  │  ← Big rounded circle in center
│           └─────┘           │
│                             │
└─────────────────────────────┘
```

#### When Container Has Content:
```
┌─────────────────────────────┐
│ 🔥 Title    [+][Settings][↑] │  ← + appears next to settings
├─────────────────────────────┤
│  Content here...            │
│  - Item 1                   │
│  - Item 2                   │
└─────────────────────────────┘
```

### Component Examples

#### Blood Glucose Tracker
```typescript
<EnhancedMinimizableCard
  title="🩸 Blood Glucose"
  isEmpty={readings.length === 0}
  onAdd={() => setIsAddOpen(true)}
  onSettings={() => setIsSettingsOpen(true)}
  minimized={minimized}
  onMinimizeChange={setMinimized}
>
  {/* Glucose readings list */}
</EnhancedMinimizableCard>
```

#### Water Intake
```typescript
<EnhancedMinimizableCard
  title="💧 Water Intake"
  isEmpty={logs.length === 0}
  onAdd={() => handleQuickAdd(250)}
  onSettings={() => setIsSettingsOpen(true)}
  minimized={minimized}
  onMinimizeChange={setMinimized}
>
  {/* Water progress and quick add buttons */}
</EnhancedMinimizableCard>
```

#### Step Counter
```typescript
<EnhancedMinimizableCard
  title="👟 Step Counter"
  isEmpty={todaySteps === 0}
  onAdd={() => setIsAddOpen(true)}
  onSettings={() => setIsSettingsOpen(true)}
  minimized={minimized}
  onMinimizeChange={setMinimized}
>
  {/* Step progress */}
</EnhancedMinimizableCard>
```

#### Macro Calculator (No Settings Needed)
```typescript
<EnhancedMinimizableCard
  title="🧮 Macro Calculator"
  isEmpty={false} // Always has content
  minimized={minimized}
  onMinimizeChange={setMinimized}
>
  {/* Calculator form */}
</EnhancedMinimizableCard>
```

### Benefits

1. **Consistency** ✅
   - Same button positions across ALL containers
   - Same empty state behavior
   - Same visual hierarchy

2. **Less Code** ✅
   - No duplicate button positioning
   - No manual empty state logic
   - Automatic button management

3. **Efficiency** ✅
   - Single component handles all patterns
   - Easy to update globally
   - Fewer lines per component

4. **User Experience** ✅
   - Predictable interface
   - Clear action hierarchy
   - Intuitive empty states

### Migration Guide

**Before (Old MinimizableCard):**
```typescript
<MinimizableCard title="🩸 Blood Glucose">
  <div className="relative">
    <Button className="absolute top-2 right-12" onClick={...}>
      <Settings />
    </Button>
    <Button className="absolute top-2 right-2" onClick={...}>
      <Plus />
    </Button>
    {readings.length === 0 ? (
      <div className="flex justify-center">
        <Button className="rounded-full">
          <Plus />
        </Button>
      </div>
    ) : (
      // content
    )}
  </div>
</MinimizableCard>
```

**After (EnhancedMinimizableCard):**
```typescript
<EnhancedMinimizableCard
  title="🩸 Blood Glucose"
  isEmpty={readings.length === 0}
  onAdd={() => setIsAddOpen(true)}
  onSettings={() => setIsSettingsOpen(true)}
>
  {/* Just the content - no button logic needed */}
</EnhancedMinimizableCard>
```

**Code Reduction:** ~15 lines → 7 lines per component

### Components to Migrate

#### Health Tab:
- [x] Blood Glucose Tracker
- [ ] Mood Tracker
- [ ] Stress Meter
- [ ] Breathing Exercises
- [ ] Alcohol/Smoking Tracker
- [ ] Water Tracker
- [ ] Weight Tracker
- [ ] Menstrual Cycle Tracker
- [ ] Pregnancy Mode

#### Food Tab:
- [ ] Macro Calculator
- [ ] BMI Calculator
- [ ] Water Intake
- [ ] Today's Meals (EnhancedMealLog)

#### Sport Tab:
- [ ] Step Counter
- [ ] Workout Schedule
- [ ] Recent Workouts

### Testing Checklist

After migration:
- [ ] Empty state shows centered + circle
- [ ] Adding first item moves + to header
- [ ] Settings button always next to minimize
- [ ] + button appears next to settings when has content
- [ ] Minimize/expand works correctly
- [ ] No visual regressions

This standardization reduces code by ~40% and ensures perfect consistency!

