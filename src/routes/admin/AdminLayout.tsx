import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3, Box, LogOut, Package, Recycle, Settings, ShoppingCart, Truck, Users, Warehouse,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { to: "/admin/consumers", label: "Consumers", icon: Users },
  { to: "/admin/riders", label: "Riders", icon: Truck },
  { to: "/admin/bottles", label: "Bottles", icon: Recycle },
  { to: "/admin/reports", label: "Reports", icon: Box },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout() {
  const { location } = useRouterState();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    await signOut();
    navigate({ to: "/admin/login" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white font-bold">M</div>
          <div>
            <div className="font-bold leading-none">MarkUp</div>
            <div className="text-xs text-slate-500">Admin</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {links.map((l) => {
            const active = location.pathname === l.to || location.pathname.startsWith(l.to + "/");
            const Icon = l.icon;
            return (
              <Link key={l.to} to={l.to} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}>
                <Icon className="h-4 w-4" />{l.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={logout} className="m-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="md:hidden flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm">M</div>
            <span className="font-bold">MarkUp Admin</span>
          </div>
          <div className="hidden md:block text-sm text-slate-500">Logged in as <span className="font-medium text-slate-900">{user?.email}</span></div>
          <button onClick={logout} className="md:hidden text-sm text-slate-600">Logout</button>
        </header>

        {/* Mobile nav */}
        <nav className="md:hidden overflow-x-auto border-b border-slate-200 bg-white">
          <div className="flex gap-1 px-2 py-2">
            {links.map((l) => {
              const active = location.pathname === l.to;
              return (
                <Link key={l.to} to={l.to} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium ${active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
                  {l.label}
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
