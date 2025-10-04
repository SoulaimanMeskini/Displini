import { useState } from "react";
import Settings from "@/components/Settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Sport() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold" data-testid="text-page-title">Sport & Fitness</h1>
          <Settings />
        </div>
      </header>

      <main className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Workout Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Schedule your workouts</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
