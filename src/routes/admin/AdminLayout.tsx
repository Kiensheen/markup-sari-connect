import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useMock } from "@/contexts/MockContext";
import { RoleSwitcher } from "@/components/RoleSwitcher";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", emoji: "📊" },
  { to: "/admin/orders", label: "Orders", emoji: "📦" },
  { to: "/admin/products", label: "Products", emoji: "🏷️" },
  { to: "/admin/consumers", label: "Consumers", emoji: "👤" },
  { to: "/admin/riders", label: "Riders", emoji: "🏍️" },
  { to: "/admin/inventory", label: "Inventory", emoji: "📦" },
  { to: "/admin/reports", label: "Reports", emoji: "📈" },
  { to: "/admin/settings", label: "Settings", emoji: "⚙️" },
];

export function AdminLayout() {
  const { location } = useRouterState();
  const { currentUser } = useMock();

  const initials = currentUser.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-card md:flex">
        <div className="flex items-center gap-2 border-b border-border px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">M</div>
          <div>
            <div className="font-bold leading-none">MarketUp</div>
            <div className="text-xs text-muted-foreground">Admin Panel</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {links.map((l) => {
            const active = location.pathname === l.to || location.pathname.startsWith(`${l.to}/`);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-primary/10"
                }`}
              >
                <span className="text-base">{l.emoji}</span>
                {l.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="md:hidden flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">M</div>
            <span className="font-bold">MarketUp Admin</span>
          </div>
          <div className="hidden md:block" />

          <div className="flex items-center gap-2">
            <RoleSwitcher />
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{initials}</div>
              <span className="max-w-[140px] truncate text-sm font-medium">{currentUser.name}</span>
            </div>
          </div>
        </header>

        <nav className="overflow-x-auto border-b border-border bg-card md:hidden">
          <div className="flex gap-1 px-2 py-2">
            {links.map((l) => {
              const active = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium ${
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  {l.emoji} {l.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
