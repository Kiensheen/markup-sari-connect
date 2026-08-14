import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Home, ShoppingCart, Package, User, LogOut, Bell, PackageCheck } from "lucide-react";
import { AnimatedTabBar } from "@/components/ui/animated-tab-bar";
import { useMock } from "@/contexts/MockContext";
import { useAuth } from "@/contexts/AuthContext";

// Consistent green (emerald) theme across all tabs (consumer = growth & orders)
const GREEN = "#059669";
const tabColors = [GREEN, GREEN, GREEN, GREEN];
const bgColorsBody = ["#ECFDF5", "#ECFDF5", "#ECFDF5", "#ECFDF5"];

// Notification copy derived from order status — generated from the live orders
// array in MockContext so it can never drift out of sync with real order state.
const ORDER_NOTIF_SUFFIX: Record<string, string> = {
  pending: "is pending confirmation",
  confirmed: "has been confirmed",
  assigned: "has been assigned a rider",
  picked_up: "has been picked up",
  out_for_delivery: "is out for delivery",
  delivered: "was delivered",
  cancelled: "was cancelled",
  delivery_failed: "delivery failed",
};

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/profile", label: "Profile", icon: User },
];

export function ConsumerLayout({ children }: { children: React.ReactNode }) {
  const { location } = useRouterState();
  const navigate = useNavigate();
  const { orders, currentUser, notificationsEnabled } = useMock();
  const { isLoggedIn, logout } = useAuth();
  const [bgColor, setBgColor] = useState(bgColorsBody[0]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifPos, setNotifPos] = useState<{ top: number; right: number } | null>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Notifications are derived live from the consumer's orders — there is no
  // separate notifications store, so they always reflect current order status.
  const notifications = useMemo(
    () =>
      orders
        .filter((o) => o.consumer_id === currentUser.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6)
        .map((o) => ({
          id: o.id,
          status: o.status,
          at: o.created_at,
          text: ORDER_NOTIF_SUFFIX[o.status]
            ? `Order #${o.id} ${ORDER_NOTIF_SUFFIX[o.status]}`
            : `Order #${o.id} is ${o.status.replace(/_/g, " ")}`,
        })),
    [orders, currentUser.id],
  );

  // Order-status notifications only show when enabled (see Settings). The bell
  // icon itself stays visible, but the panel and badge stay quiet when off.
  const visibleNotifications = notificationsEnabled ? notifications : [];

  const toggleNotifs = () => {
    if (notifOpen) {
      setNotifOpen(false);
      return;
    }
    const rect = bellRef.current?.getBoundingClientRect();
    setNotifPos({
      top: (rect?.bottom ?? 0) + 8,
      right: rect ? Math.max(12, window.innerWidth - rect.right) : 12,
    });
    setNotifOpen(true);
  };

  // Close the panel when clicking outside or pressing Escape
  useEffect(() => {
    if (!notifOpen) return;
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNotifOpen(false);
    };
    const onScroll = () => setNotifOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [notifOpen]);

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
              {isLoggedIn("consumer") && (
                <>
                  <button
                    ref={bellRef}
                    onClick={toggleNotifs}
                    className="relative flex items-center justify-center rounded-full bg-white/15 p-2 text-white ring-1 ring-white/20 transition-colors hover:bg-white/25"
                    aria-label="Notifications"
                    aria-expanded={notifOpen}
                  >
                    <Bell className="h-4 w-4" />
                    {visibleNotifications.length > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[8px] font-bold text-amber-950 ring-2 ring-emerald-700">
                        {visibleNotifications.length}
                      </span>
                    )}
                  </button>
                  {notifOpen && notifPos && (
                    <div
                      ref={panelRef}
                      style={{ top: notifPos.top, right: notifPos.right }}
                      className="fixed z-50 w-[min(92vw,340px)] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 bg-emerald-50/60 px-4 py-3">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800">
                          <Bell className="h-4 w-4 text-emerald-600" /> Notifications
                        </h3>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          {visibleNotifications.length} update{visibleNotifications.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto">
                        {visibleNotifications.length === 0 ? (
                          <div className="flex flex-col items-center px-4 py-8 text-center">
                            <PackageCheck className="h-10 w-10 text-gray-200" />
                            <p className="mt-2 text-sm text-gray-500">
                              {notificationsEnabled
                                ? "No order updates yet."
                                : "Order notifications are turned off in Settings."}
                            </p>
                          </div>
                        ) : (
                          visibleNotifications.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => {
                                setNotifOpen(false);
                                navigate({ to: "/orders" });
                              }}
                              className="flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-emerald-50/50"
                            >
                              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                <Package className="h-4 w-4" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-[13px] font-medium leading-snug text-gray-800">
                                  {n.text}
                                </span>
                                <span className="mt-0.5 block text-[11px] text-gray-400">{timeAgo(n.at)}</span>
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
              {isLoggedIn("consumer") ? (
                <button
                  onClick={() => logout("consumer")}
                  className="flex items-center justify-center rounded-full bg-white/15 p-2 text-white ring-1 ring-white/20 transition-colors hover:bg-white/25"
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
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
          <AnimatedTabBar
            items={tabs.map((t, i) => ({
              color: tabColors[i],
              icon: <t.icon className="icon" />,
              label: t.label,
            }))}
            activeIndex={safeIndex}
            onTabChange={handleTabChange}
          />
        </div>
      </nav>
    </div>
  );
}
