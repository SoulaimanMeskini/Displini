# Habit Improvement Mobile App

## Overview

This is a mobile-first habit tracking application built with React and Express. The app helps users track daily habits across three main areas: nutrition/food intake, calendar events, and todo tasks. It features macro tracking, protein intake monitoring, weight goal tracking, calendar event management, and task organization with cross-functional integration between modules.

The application uses a clean, distraction-free interface inspired by Apple Health, Linear, and Notion, with a focus on data clarity and quick task completion.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and bundler.

**UI Component Library**: shadcn/ui components built on Radix UI primitives, providing accessible and customizable components with a "New York" design style.

**Routing**: Wouter for lightweight client-side routing with three main routes:
- `/` - Food/Nutrition tracking page
- `/calendar` - Calendar events page  
- `/todo` - Task management page

**State Management**: React hooks for local state management with @tanstack/react-query for server state and caching. The application currently uses in-memory state without persistence.

**Styling**: Tailwind CSS with custom design tokens following the design system defined in `design_guidelines.md`. Supports light/dark mode with theme customization capabilities.

**Key Design Patterns**:
- Component composition with reusable UI primitives
- Mobile-first responsive design with fixed bottom navigation
- Cross-module integration (meals can create todos, calendar events can create todos)
- Theme system with customizable colors stored in localStorage

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js.

**API Architecture**: RESTful API with routes prefixed with `/api`. Currently implements a minimal server with placeholder routes in `server/routes.ts`.

**Storage Interface**: Abstract storage interface (`IStorage`) with in-memory implementation (`MemStorage`). Designed to be swapped with database implementations without changing business logic.

**Build System**: 
- Development: tsx for TypeScript execution
- Production: esbuild for server bundling, Vite for client bundling
- Outputs to `dist/` directory

### Data Storage Solutions

**Current Implementation**: In-memory storage using JavaScript Maps for development/testing.

**Database Schema** (Drizzle ORM): 
- Configured for PostgreSQL with Neon serverless adapter
- Single `users` table defined with id, username, password fields
- Schema location: `shared/schema.ts`
- Migrations output: `migrations/` directory

**Data Models**:
- Users: Basic authentication schema
- Meals: Tracked with protein, carbs, fat, kcal, scheduling options
- Calendar Events: Date, time, title, optional todo conversion
- Tasks: Title, completion status, due date, source tracking (manual/food/calendar)

**Persistence Strategy**: Application data currently held in component state. Future implementation will use PostgreSQL with Drizzle ORM based on existing configuration.

### Authentication & Authorization

**Current State**: Basic user schema exists in database schema but no authentication is implemented.

**Planned Architecture**: Username/password authentication with session management using connect-pg-simple for PostgreSQL session store.

**Security Considerations**: Environment-based database credentials, session-based authentication ready to implement.

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