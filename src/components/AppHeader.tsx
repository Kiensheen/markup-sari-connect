import { Link } from "@tanstack/react-router";
import { Award } from "lucide-react";
import { useMock } from "@/contexts/MockContext";
import { RoleSwitcher } from "@/components/RoleSwitcher";

export function AppHeader() {
  const { role, currentUser } = useMock();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">M</div>
          <span className="text-lg font-bold tracking-tight">MarketUp</span>
        </Link>
        <div className="flex items-center gap-2">
          <RoleSwitcher />
          {role === 'consumer' && currentUser.points > 0 && (
            <Link
              to="/profile"
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/15"
            >
              <Award className="h-3.5 w-3.5" />
              {currentUser.points.toLocaleString()} pts
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
