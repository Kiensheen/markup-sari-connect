import { useState } from "react";
import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Bike,
  Boxes,
  BarChart3,
  Settings,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Store,
} from "lucide-react";
import { useMock } from "@/contexts/MockContext";
import { useAuth } from "@/contexts/AuthContext";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard };

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    title: "Management",
    items: [
      { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { to: "/admin/products", label: "Products", icon: Package },
      { to: "/admin/inventory", label: "Inventory", icon: Boxes },
    ],
  },
  {
    title: "People",
    items: [
      { to: "/admin/consumers", label: "Consumers", icon: Users },
      { to: "/admin/riders", label: "Riders", icon: Bike },
    ],
  },
  {
    title: "System",
    items: [
      { to: "/admin/support", label: "Support", icon: MessageCircle },
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

function pageTitle(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean).pop() ?? "dashboard";
  const map: Record<string, string> = {
    dashboard: "Dashboard",
    orders: "Orders",
    products: "Products",
    consumers: "Consumers",
    riders: "Riders",
    inventory: "Inventory",
    reports: "Reports",
    settings: "Settings",
    support: "Support",
  };
  return map[seg] ?? "Dashboard";
}

export function AdminLayout() {
  const { location } = useRouterState();
  const navigate = useNavigate();
  const { currentUser } = useMock();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (currentUser.name || currentUser.email || "A").charAt(0).toUpperCase();
  const title = pageTitle(location.pathname);

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`);

  const SidebarContent = (
    <div className="flex h-full flex-col bg-gradient-to-b from-blue-950 via-blue-900 to-blue-900 text-white">
      {/* Brand */}
      <div className={`flex items-center gap-3 border-b border-white/10 px-5 py-5 ${collapsed ? "justify-center" : ""}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-500 text-lg font-black shadow-lg shadow-blue-950/40">
          M
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-bold leading-none">
              MarketUp
            </div>
            <div className="mt-0.5 text-xs font-medium text-blue-200">Admin Panel</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-blue-300/60">
                {group.title}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to as never}
                    title={collapsed ? item.label : undefined}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-white/15 text-white shadow-inner ring-1 ring-white/10"
                        : "text-blue-100/70 hover:bg-white/10 hover:text-white"
                    } ${collapsed ? "justify-center px-2" : ""}`}
                  >
                    <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-white" : "text-blue-200/70 group-hover:text-white"}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-300" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="hidden items-center justify-center border-t border-white/10 py-3 text-blue-200/70 transition-colors hover:bg-white/10 hover:text-white lg:flex"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Admin profile */}
      <div className={`border-t border-white/10 p-3 ${collapsed ? "flex justify-center" : ""}`}>
        <div className={`flex items-center gap-3 rounded-lg ${collapsed ? "" : "bg-white/10 p-2"}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-400 text-sm font-bold text-blue-950">
            {initials}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{currentUser.name}</div>
                <div className="truncate text-xs text-blue-200/70">Administrator</div>
              </div>
              <button
                onClick={() => {
                  logout("admin");
                  navigate({ to: "/admin/login" });
                }}
                className="rounded-md p-1.5 text-blue-200/70 transition-colors hover:bg-white/10 hover:text-white"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden transition-all duration-300 lg:block ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      >
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 z-10 rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className={`transition-all duration-300 ${collapsed ? "lg:pl-[72px]" : "lg:pl-64"}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 md:px-8">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-600 text-sm font-bold text-white lg:hidden">
                M
              </div>
              <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:flex">
                <Store className="h-3.5 w-3.5 text-blue-600" />
                <span>Wholesale Store · Gitagum</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {initials}
                </div>
                <span className="hidden text-sm font-medium text-slate-700 md:block">{currentUser.name}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
