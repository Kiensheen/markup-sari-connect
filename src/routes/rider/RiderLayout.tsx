import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, User, Wallet } from "lucide-react";

const tabs = [
  { to: "/rider/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/rider/earnings", label: "Earnings", icon: Wallet },
  { to: "/rider/profile", label: "Profile", icon: User },
];

export function RiderLayout() {
  const { location } = useRouterState();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">M</div>
            <span className="font-bold">MarketUp Rider</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">Consumer</Link>
            <Link to="/admin/dashboard" className="text-xs text-muted-foreground hover:text-foreground">Admin</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {tabs.map((t) => {
            const active = location.pathname === t.to;
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-6 w-6" />
                <span>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
