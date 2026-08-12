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
    <div className="min-h-screen bg-blue-50/60 pb-24">
      <header className="sticky top-0 z-30 shadow-lg shadow-blue-900/10">
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-base font-bold text-white ring-1 ring-white/25 backdrop-blur-sm">
                M
              </div>
              <div className="leading-tight">
                <p className="text-[15px] font-bold text-white">MarketUp Rider</p>
                <p className="text-[11px] font-medium text-blue-100">Delivery Partner</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-200" />
              </span>
              Online
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-5">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/80 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {tabs.map((t) => {
            const active = location.pathname === t.to;
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  active ? "text-blue-700" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <div
                  className={`flex items-center justify-center rounded-full px-4 py-1.5 transition-colors ${
                    active ? "bg-blue-100" : "bg-transparent"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
                </div>
                <span className={active ? "font-semibold" : ""}>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
