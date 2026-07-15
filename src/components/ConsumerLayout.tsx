import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ShoppingCart, Package, User } from "lucide-react";
import { useMock } from "@/contexts/MockContext";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/profile", label: "Profile", icon: User },
];

export function ConsumerLayout({ children }: { children: React.ReactNode }) {
  const { location } = useRouterState();
  const { cartCount } = useMock();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">M</div>
            <span className="text-lg font-bold tracking-tight">MarketUp</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center justify-center rounded-full bg-primary/10 p-2 text-primary hover:bg-primary/15"
              aria-label="Profile"
            >
              <User className="h-4 w-4" />
            </Link>
            <Link to="/rider/dashboard" className="text-xs text-muted-foreground hover:text-foreground">Rider</Link>
            <Link to="/admin/dashboard" className="text-xs text-muted-foreground hover:text-foreground">Admin</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-around md:justify-start md:gap-2 md:px-4">
          {tabs.map((t) => {
            const active = location.pathname === t.to;
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors md:flex-row md:gap-2 md:px-4 md:py-3 md:text-sm ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{t.label}</span>
                {t.to === "/cart" && cartCount > 0 && (
                  <span className="absolute right-1/4 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground md:static md:ml-1">
                    {cartCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
