import { Link } from "@tanstack/react-router";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function AppHeader() {
  const { user, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">M</div>
          <span className="text-lg font-bold tracking-tight">MarkUp</span>
        </Link>
        {user ? (
          <button onClick={signOut} className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        ) : (
          <Link to="/auth" className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
            <UserIcon className="h-4 w-4" /> Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
