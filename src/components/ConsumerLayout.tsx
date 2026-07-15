import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { Home, ShoppingCart, Package, User } from "lucide-react";
import { AnimatedTabBar } from "@/components/ui/animated-tab-bar";
import { useMock } from "@/contexts/MockContext";

const tabColors = ["#2563EB", "#10B981", "#EF4444", "#2563EB"];
const bgColorsBody = ["#EFF6FF", "#ECFDF5", "#FEF2F2", "#EFF6FF"];

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
  const [bgColor, setBgColor] = useState(bgColorsBody[0]);

  const activeIndex = tabs.findIndex((t) => location.pathname === t.to);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;

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
      <header
        className="sticky top-0 z-30 text-white shadow-md transition-all duration-700"
        style={{
          background: `linear-gradient(135deg, ${tabColors[safeIndex]} 0%, ${adjustColor(tabColors[safeIndex], -20)} 100%)`,
        }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src="/marketup-logo.jpg" alt="MarketUp" className="h-12 w-12 rounded-lg object-cover object-[35%_center]" />
            <span className="text-lg font-bold tracking-tight">MarketUp</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center justify-center rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
              aria-label="Profile"
            >
              <User className="h-4 w-4" />
            </Link>
            <Link
              to="/rider/dashboard"
              className="text-xs text-white/70 hover:text-white transition-colors"
            >
              Rider
            </Link>
            <Link
              to="/admin/dashboard"
              className="text-xs text-white/70 hover:text-white transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/80 bg-white shadow-lg md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b md:shadow-none">
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
                className="absolute right-[18%] top-1 z-50 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm transition-colors duration-500"
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

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `rgb(${r},${g},${b})`;
}
