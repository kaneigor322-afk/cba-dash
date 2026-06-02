import { Smartphone } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <Smartphone className="size-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-medium">CBA Events Dashboard</h1>
            <p className="text-xs text-muted-foreground">Mobile Event Apps</p>
          </div>
        </div>
      </div>
    </header>
  );
}
