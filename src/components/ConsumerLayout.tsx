import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { Home, ShoppingCart, Package, User, LogOut } from "lucide-react";
import { AnimatedTabBar } from "@/components/ui/animated-tab-bar";
import { useMock } from "@/contexts/MockContext";
import { useAuth } from "@/contexts/AuthContext";

// Consistent green (emerald) theme across all tabs (consumer = growth & orders)
const GREEN = "#059669";
const tabColors = [GREEN, GREEN, GREEN, GREEN];
const bgColorsBody = ["#ECFDF5", "#ECFDF5", "#ECFDF5", "#ECFDF5"];

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/profile", label: "Profile", icon: User },
];

export function ConsumerLayout({ children }: { children: React.ReactNode }) {
  const { location } = useRouterState();
  const navigate = useNavigate();
  const { cartCount } = useMock();
  const { isLoggedIn, getUsername, logout } = useAuth();
  const [bgColor, setBgColor] = useState(bgColorsBody[0]);

  // Checkout should highlight Cart tab, other exact matches
  const getActiveIndex = () => {
    const path = location.pathname;
    // Checkout page should show Cart tab as active (index 1)
    if (path === "/checkout") return 1;
    // Exact match for other tabs
    return tabs.findIndex((t) => path === t.to);
  };

  const activeIndex = getActiveIndex();
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;

  // Keep body background in sync with the active tab whenever the route changes
  // (covers navigation via links/buttons, not just tab bar clicks)
  useEffect(() => {
    setBgColor(bgColorsBody[safeIndex]);
  }, [safeIndex]);

  const handleTabChange = useCallback(
    (index: number) => {
      setBgColor(bgColorsBody[index]);
      navigate({ to: tabs[index].to as any });
    },
    [navigate],
  );

  return (
    <div
      className="min-h-screen pb-20 transition-colors duration-700 md:pb-0"
      style={{ backgroundColor: bgColor }}
    >
      <header className="sticky top-0 z-30 shadow-lg shadow-emerald-900/10">
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500">
          <div className="pointer-events-none absolute -right-8 -top-12 h-28 w-28 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-14 left-1/3 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="/marketup-logo.jpg"
                alt="MarketUp"
                className="h-10 w-10 rounded-xl object-cover object-[35%_center] ring-1 ring-white/25"
              />
              <div className="leading-tight">
                <p className="text-lg font-bold tracking-tight text-white">MarketUp</p>
                <p className="text-[11px] font-medium text-emerald-100">Wholesale for sari-sari stores</p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              {isLoggedIn("consumer") ? (
                <div className="flex max-w-[160px] items-center gap-1 rounded-full bg-white/15 py-1 pl-3 pr-1 text-sm text-white ring-1 ring-white/20">
                  <span className="truncate">Hi, {getUsername("consumer")}</span>
                  <button
                    onClick={() => logout("consumer")}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
                    aria-label="Log out"
                    title="Log out"
                  >
                    <LogOut className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/consumer/login"
                  search={{ redirect: "/" }}
                  className="rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/25"
                >
                  Login
                </Link>
              )}
              <Link
                to="/profile"
                className="flex items-center justify-center rounded-full bg-white/15 p-2 text-white ring-1 ring-white/20 transition-colors hover:bg-white/25"
                aria-label="Profile"
              >
                <User className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/80 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b md:shadow-none">
        <div className="mx-auto max-w-3xl">
          <div className="relative">
            <AnimatedTabBar
              items={tabs.map((t, i) => ({
                color: tabColors[i],
                icon: <t.icon className="icon" />,
                label: t.label,
              }))}
              activeIndex={safeIndex}
              onTabChange={handleTabChange}
            />
            {cartCount > 0 && (
              <span
                className="absolute right-[18%] top-1 z-50 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm"
                style={{ backgroundColor: tabColors[safeIndex] }}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
