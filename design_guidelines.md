# Design Guidelines: Habit Improvement Mobile App

## Design Approach

**Selected Approach**: Design System-Inspired (Apple HIG + Modern Productivity)

Drawing inspiration from industry leaders in productivity and health tracking:
- **Primary Reference**: Apple Health (data visualization & health tracking patterns)
- **Secondary References**: Linear (clean task management), Notion (information hierarchy), Streaks (habit tracking)

**Core Principle**: Clean, distraction-free interface that prioritizes data clarity and quick task completion. Design should feel calm yet motivating.

---

## Color Palette

### Light Mode
- **Primary**: 59 91% 47% (Vibrant Blue - CTAs, active states)
- **Background**: 0 0% 100% (Pure White)
- **Surface**: 220 14% 96% (Soft Gray - cards, elevated elements)
- **Text Primary**: 220 9% 15% (Near Black)
- **Text Secondary**: 220 9% 46% (Medium Gray)
- **Success**: 142 71% 45% (Green - completed tasks, goals met)
- **Warning**: 38 92% 50% (Amber - reminders, alerts)
- **Chart Colors**: 217 91% 60%, 142 76% 36%, 271 81% 56%, 24 80% 58%

### Dark Mode
- **Primary**: 210 100% 60% (Lighter Blue for contrast)
- **Background**: 222 47% 11% (Deep Navy)
- **Surface**: 217 33% 17% (Elevated Dark)
- **Text Primary**: 210 40% 98% (Off White)
- **Text Secondary**: 215 16% 65% (Light Gray)
- **Success**: 142 71% 55%
- **Warning**: 38 92% 60%

---

## Typography

**Font Stack**: System UI fonts for optimal mobile performance
- Primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
- Monospace: "SF Mono", Monaco (for numbers, data)

**Type Scale**:
- Headings (Tab Titles): 2xl (24px), font-bold
- Section Headers: lg (18px), font-semibold
- Body Text: base (16px), font-normal
- Captions/Meta: sm (14px), font-medium
- Data Numbers: 3xl (30px), font-bold, monospace

---

## Layout System

**Spacing Primitives**: Consistent use of Tailwind units: 2, 4, 6, 8, 12, 16, 20
- Card padding: p-4
- Section spacing: space-y-6
- Tab content padding: px-4 py-6
- Component gaps: gap-4

**Container Strategy**:
- Max width: max-w-md (mobile-first, centered on larger screens)
- Full-width data visualizations within safe areas
- Cards with rounded-2xl, subtle shadows

---

## Component Library

### Navigation
- **Bottom Tab Bar**: Fixed, 3 tabs with icons + labels, height-16, active state with primary color fill
- Tab Icons: Utensils (Food), Calendar (Calendar), CheckSquare (To Do)
- Active indicator: Solid color background + bold text

### Food Tab Components
- **Protein Calculator Card**: Gradient background (primary to primary-dark), white text, large number display
- **Gender Toggle**: Pill-style segmented control, 100px width each option
- **Daily Log Cards**: Timeline-style vertical list, time stamps on left, meal entries on right
- **Meal Entry Form**: Large tap targets (min-h-12), quantity steppers with +/- buttons
- **Progress Ring Chart**: Circular progress indicator showing protein goal completion (200px diameter)

### Calendar Tab Components
- **Month View**: Grid layout with rounded cells, current day highlighted with primary color ring
- **Day/Week Switcher**: Segmented control at top
- **Event Cards**: Left color strip indicating calendar category, time + title, swipe actions for edit/delete
- **Add Event FAB**: Floating action button, bottom-right, 56x56px, primary color, white plus icon
- **Smart Checkmark Toggle**: Checkbox with "Add to To Do" label inline with event creation

### To Do Tab Components
- **Task List**: Clean checkbox list, unchecked circles, completed with checkmark + strikethrough
- **Task Cards**: Left checkbox, center text/details, right date/time chip
- **Quick Add Bar**: Sticky bottom input with send button
- **Category Pills**: Small chips showing source (Food, Calendar, Manual) with color coding
- **Completion Animation**: Gentle scale + fade when marking complete

### Data Visualization
- **Line Charts**: Protein intake over 7/30 days, smooth curves, gradient fills below lines
- **Bar Charts**: Daily comparison, rounded tops
- **Streak Display**: Fire icon + number of consecutive days, prominent positioning
- **Weight Progress**: Line chart with target weight dotted line overlay

### Forms & Inputs
- **Text Inputs**: Rounded-lg, border-2, h-12, focus:ring-4 with primary color
- **Date/Time Pickers**: Native mobile pickers styled to match theme
- **Buttons**: 
  - Primary: bg-primary, rounded-lg, h-12, font-semibold
  - Secondary: bg-surface, text-primary, same dimensions
  - Icon Only: 44x44px minimum (touch target)

### Cards & Surfaces
- **Standard Card**: bg-surface, rounded-2xl, p-4, shadow-sm
- **Stat Card**: Larger padding (p-6), centered content, bold numbers
- **Interactive Card**: hover:shadow-md transition, active:scale-98

---

## Interactions & Animations

**Principle**: Subtle, purposeful motion only
- Tab switching: 200ms ease-in-out slide
- Task completion: 300ms scale(0.95) → checkmark → fade opacity
- Chart entry: Staggered 100ms delay per data point on load
- Pull-to-refresh: Standard mobile pattern with spinner
- Swipe actions: Reveal edit/delete at -100px threshold

**No**: Excessive bounces, rotations, or decorative animations

---

## Accessibility

- Minimum touch targets: 44x44px
- Color contrast ratio: 4.5:1 minimum for text
- Focus indicators: 4px ring on all interactive elements
- Dark mode respects system preference
- Form inputs maintain consistent styling in both modes
- All icons paired with labels on primary actions

---

## Images

**No hero images** - This is a utility app focused on data and tasks.

**Icon Usage**: 
- Heroicons via CDN for all UI icons
- Consistent 24x24px size throughout
- Outlined style for inactive states, solid for active

**Data Visualization**: 
- Use Chart.js or Recharts for responsive charts
- Custom food/meal icons from icon library (Apple, Drumstick, Coffee, etc.)

---

## Key Screens Layout

**Food Tab**: Protein calculator card (top) → Daily summary stats (3-column grid) → Timeline of meals → Bottom CTA "Log Food"

**Calendar Tab**: Month header with navigation → Calendar grid → Upcoming events list (scrollable) → FAB for new event

**To Do Tab**: Stats bar (completed/total) → Filter chips (All, Today, Food, Calendar) → Task list (grouped by status) → Quick add bar (sticky bottom)

**All Tabs**: Consistent header height (h-14), tab title centered, optional action button top-right