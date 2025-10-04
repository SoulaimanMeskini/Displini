# Habit Improvement Mobile App

## Overview

This is a mobile-first habit tracking application built with React and Express. The app helps users track daily habits across five main areas: Health (menstrual cycle, medications & sleep), Food (nutrition & macros), Sport (fitness & workouts), Calendar (events), and To Do (task management). It features macro tracking, protein intake monitoring, weight goal tracking, menstrual cycle predictions, medication reminders with completion tracking, sleep schedule with alarm and quality logging, workout scheduling, and task organization with cross-functional integration between modules.

The application uses a clean, distraction-free interface inspired by Apple Health, Linear, and Notion, with a focus on data clarity and quick task completion. An AI chat assistant powered by OpenAI enables natural language commands for rapid data entry across Food, Sport, and To Do tabs. The To Do page features a timeline view with all-day tasks displayed as circular buttons and timed tasks sorted chronologically.

**Latest Updates:**
- Sleep schedule flexibility: Weekly mode allows different wake/bedtime for each day of the week; daily mode for consistent schedule across all days
- Calendar time ranges: Events now support start time and end time fields (replacing single time field) with backward compatibility
- Unified header: All tabs now share consistent PageHeader with monthly stats button, Settings, and ThemeToggle (Food page preserves Column Settings button)
- Monthly statistics: New modal with Overview tab and per-module breakdowns (Food, Health, Sport, Calendar, To Do, Water) showing current month metrics
- Sleep schedule views: Enhanced with 3 tabs - Schedule (wake/bedtime with daily/weekly mode selector), Daily (today's tasks with completion status), Weekly (7-day quality grid with navigation)
- Reactive todo sync: Sleep schedule daily view auto-updates when tasks completed in To Do page
- Water tracking: New column in Food page with daily goals (ml/oz), progress bar, quick-add buttons, and 30-day history
- Task notes: Tasks can now include optional notes displayed in timeline view
- Meal scheduling: Added "Eat now", "Schedule for today", and "Monthly" options
- Calendar emoji sync: Calendar event emojis now display in corresponding all-day to-do circles
- All-day completion: Completed all-day tasks stay in place with green checkmark overlay (don't move to completed section)
- Barcode scanner: Moved into log food dialog header for better accessibility
- Unit conversion: Water tracking converts between ml/oz when switching units
- Timeline view: To Do page displays all-day tasks as circles, timed tasks chronologically
- Event-to-do sync: Calendar events create corresponding to-do items when toggled
- Medication completion: Marking medication to-dos complete updates Health page with timestamp

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and bundler.

**UI Component Library**: shadcn/ui components built on Radix UI primitives, providing accessible and customizable components with a "New York" design style.

**Routing**: Wouter for lightweight client-side routing:
- `/` - Landing page (logged out) or Food/Nutrition tracking page (logged in)
- `/health` - Health tracking (menstrual cycle, medications) page (protected)
- `/sport` - Sport & Fitness tracking page (protected)
- `/calendar` - Calendar events page (protected)
- `/todo` - Task management page (protected)
- `/profile` - User profile settings page (protected)

**State Management**: React hooks for local state management with @tanstack/react-query for server state and caching. LocalStorage for macro calculator settings and meal data persistence.

**Styling**: Tailwind CSS with custom design tokens following the design system defined in `design_guidelines.md`. Supports light/dark mode with theme customization capabilities.

**Key Design Patterns**:
- Component composition with reusable UI primitives
- Mobile-first responsive design with fixed bottom navigation
- Cross-module integration (medications→todos with completion sync, workouts→todos, cycle→calendar, scheduled meals→consumed, sleep→todos, calendar events→todos)
- Theme system with customizable colors stored in localStorage
- Authentication-aware routing (landing page for logged out users)
- Tap-to-consume for scheduled meals
- Weekly view with circular goal indicators
- AI-assisted data entry via floating chat bubble (bottom-24 right-4 positioning)
- Emoji customization for all tracked items (meals, tasks, medications, workouts, calendar events)
- Timeline-based task organization (all-day tasks as circles, timed tasks chronologically sorted)
- Customizable page layouts with column reordering and visibility controls
- Editable macro goals independent of calculator
- Event-driven component communication (CustomEvents for medication sync)

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js.

**API Architecture**: RESTful API with routes prefixed with `/api`. Includes authentication routes and protected endpoints.

**Storage Interface**: Abstract storage interface (`IStorage`) with PostgreSQL database implementation (`DatabaseStorage`). Uses Drizzle ORM for type-safe database operations.

**Build System**: 
- Development: tsx for TypeScript execution
- Production: esbuild for server bundling, Vite for client bundling
- Outputs to `dist/` directory

### Data Storage Solutions

**Current Implementation**: PostgreSQL database using Neon serverless adapter with Drizzle ORM.

**Database Schema** (Drizzle ORM): 
- Configured for PostgreSQL with Neon serverless adapter
- Tables: `users` (authentication), `sessions` (session storage)
- Schema location: `shared/schema.ts`
- Database changes pushed via: `npm run db:push`

**Data Models**:
- Users: OAuth profile (id, email, firstName, lastName, profileImageUrl, dateOfBirth)
- Sessions: Express session storage for authentication persistence
- Meals: Tracked with protein, carbs, fat, kcal, emoji, scheduling options (now/today/day/weekly/biweekly/monthly) (localStorage)
- Medications: Name, emoji, dosage, times, frequency, lastTaken timestamp, auto-creates todos (localStorage)
- Menstrual Cycle: Start date, duration, predictions, calendar integration (localStorage)
- Sleep Schedule: Mode (daily/weekly), daily schedule (wake/sleep times for all days), weekly schedule (different wake/sleep times per day), alarm enabled, alarm sound selection, legacy migration support (localStorage)
- Sleep Logs: Date, quality rating (3 emojis), wake time (localStorage)
- Workouts: Name, emoji, duration, type, frequency, days, time, auto-creates todos (localStorage)
- Calendar Events: Date, startTime, endTime (with legacy time field for backward compatibility), title, emoji, allDay flag, optional todo conversion, type (event/period) (localStorage)
- Tasks: Title, emoji, completion status, due date, time, allDay flag, notes (optional), source tracking (manual/food/calendar/medication/workout/sleep), medicationId, sleepAction (localStorage)
- Water Intake: Daily goal (ml/oz), entries with amount/unit/time/date, auto-purges entries >30 days (localStorage: 'water_settings', 'water_entries')
- Settings: Week start day preference, temperature units, measurement system (localStorage)
- Food Page Preferences: Column order and visibility settings (localStorage keys: 'food_column_order', 'food_column_visibility')

**Persistence Strategy**: 
- User authentication data: PostgreSQL database
- Application data (meals, medications, cycle data, workouts, calendar, tasks, sleep, water): LocalStorage for quick access
- Macro calculator settings and editable goals: LocalStorage (key: 'calculator_results')
- User preferences (week start day, theme, column order/visibility, temperature/measurement units): LocalStorage with cross-tab synchronization
- Food page layout: Column order ('food_column_order') and visibility ('food_column_visibility')
- Sleep data: Schedule ('sleepSchedule') and quality logs ('sleepLogs')
- Water tracking: Settings ('water_settings') and entries ('water_entries') with automatic 30-day cleanup
- Cross-component sync: CustomEvents for medication completion tracking

### Authentication & Authorization

**Implementation**: Replit Auth (OpenID Connect) integrated with support for:
- Google sign-in
- Apple sign-in  
- GitHub sign-in
- Email/password accounts

**Session Management**: 
- PostgreSQL session store via connect-pg-simple
- 7-day session TTL
- Environment-aware secure cookies (secure in production, http-only in dev)
- Automatic session refresh via refresh tokens

**Protected Routes**:
- `/api/auth/user` - Get current user profile
- `/api/auth/user/profile` - Update user profile (dateOfBirth)
- `/api/ai/parse` - Parse natural language commands using OpenAI (POST)
- All app pages (Food, Health, Sport, Calendar, Todo, Profile) require authentication

**Security Features**:
- Session-based authentication with database persistence
- HTTP-only cookies to prevent XSS attacks
- Secure cookies in production
- Input validation for profile updates
- Automatic token refresh for expired sessions

## External Dependencies

### Third-Party UI Libraries

- **Radix UI**: Complete suite of accessible component primitives (@radix-ui/react-*)
- **shadcn/ui**: Pre-built components configured in `components.json`
- **Lucide React**: Icon library for UI elements
- **cmdk**: Command palette component
- **embla-carousel-react**: Carousel/slider functionality
- **vaul**: Drawer component (mobile-friendly)

### Data & Forms

- **React Hook Form**: Form state management with @hookform/resolvers
- **Zod**: Schema validation, integrated with Drizzle via drizzle-zod
- **date-fns**: Date manipulation and formatting

### Database & ORM

- **Drizzle ORM**: Type-safe SQL query builder (v0.39.1)
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **connect-pg-simple**: PostgreSQL session store for Express

### State Management

- **@tanstack/react-query**: Server state management and caching (v5.60.5)

### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx & tailwind-merge**: Conditional class name utilities

### Build Tools

- **Vite**: Frontend build tool and dev server
- **esbuild**: Fast JavaScript/TypeScript bundler for server
- **TypeScript**: Type safety across the stack
- **PostCSS**: CSS processing with autoprefixer

### Development Tools

- **Replit Plugins**: Runtime error overlay, cartographer, dev banner for Replit environment
- **tsx**: TypeScript execution for development
- **drizzle-kit**: Database migrations and schema management

### AI Integration

- **OpenAI**: GPT-5 model for natural language command parsing via OpenAI SDK
- **Features**: Meal logging, workout scheduling, task creation via conversational interface
- **Error Handling**: Graceful rate limit handling with user-friendly fallback messages