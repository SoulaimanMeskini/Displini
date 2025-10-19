import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Calendar, CheckSquare } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Habit Tracker</h1>
          <Button asChild data-testid="button-login">
            <a href="/">Sign In</a>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl w-full py-12 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Build Better Habits,
              <br />
              One Day at a Time
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track your nutrition, manage your calendar, and organize your tasks all in one place.
              Simple, focused, and designed to help you improve every day.
            </p>
            <div className="pt-6">
              <Button asChild size="lg" data-testid="button-get-started">
                <a href="/">Get Started</a>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Food Tracking</h3>
              <p className="text-muted-foreground">
                Monitor your macros, hit your protein goals, and track your weight progress with smart calculators and weekly views.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Calendar Events</h3>
              <p className="text-muted-foreground">
                Manage your schedule and automatically convert events into actionable tasks to keep you on track.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Task Management</h3>
              <p className="text-muted-foreground">
                Organize your to-dos with smart integration from scheduled meals and calendar events for seamless productivity.
              </p>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground">
              Sign in with Google, Apple, or email to get started
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
