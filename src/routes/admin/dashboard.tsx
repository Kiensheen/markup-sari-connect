import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useMock } from "@/contexts/MockContext";
import { peso, statusLabel, formatDate, STATUS_COLORS } from "@/lib/mockData";
import {
  ShoppingCart,
  TrendingUp,
  Clock,
  Bike,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

const revenueChartConfig = {
  revenue: { label: "Revenue", color: "#2563EB" },
};

const ordersChartConfig = {
  orders: { label: "Orders", color: "#059669" },
};

function AdminDashboard() {
  const { adminStats, orders, users, products } = useMock();

  const weeklyRevenue = useMemo(() => {
    const byDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      byDay[d.toISOString().slice(0, 10)] = 0;
    }
    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      const key = o.created_at.slice(0, 10);
      if (byDay[key] !== undefined) byDay[key] += o.total;
    });
    return Object.entries(byDay).map(([date, revenue]) => ({ date: date.slice(5), revenue }));
  }, [orders]);

  const weeklyOrders = useMemo(() => {
    const byDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      byDay[d.toISOString().slice(0, 10)] = 0;
    }
    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      const key = o.created_at.slice(0, 10);
      if (byDay[key] !== undefined) byDay[key] += 1;
    });
    return Object.entries(byDay).map(([date, count]) => ({ date: date.slice(5), orders: count }));
  }, [orders]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6),
    [orders]
  );

  const profileMap = useMemo(() => {
    const map: Record<string, { name?: string }> = {};
    users.forEach((u) => { map[u.id] = { name: u.name || u.email }; });
    return map;
  }, [users]);

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stock > 0 && p.stock < 10),
    [products]
  );

  const cards = [
    { label: "Orders today", value: String(adminStats.orders_today), icon: ShoppingCart, tint: "from-blue-500 to-blue-600", sub: `${adminStats.pending_orders} pending` },
    { label: "Revenue today", value: peso(adminStats.revenue_today), icon: TrendingUp, tint: "from-emerald-500 to-emerald-600", sub: "net of cancelled" },
    { label: "Pending orders", value: String(adminStats.pending_orders), icon: Clock, tint: "from-amber-500 to-orange-500", sub: "need action" },
    { label: "Total revenue", value: peso(adminStats.total_revenue), icon: Wallet, tint: "from-green-600 to-green-700", sub: "all time" },
    { label: "Consumers", value: String(adminStats.total_consumers), icon: Users, tint: "from-sky-500 to-blue-600", sub: "registered" },
    { label: "Riders", value: String(adminStats.total_riders), icon: Bike, tint: "from-blue-600 to-blue-700", sub: "active fleet" },
    { label: "Products", value: String(adminStats.total_products), icon: Package, tint: "from-teal-500 to-cyan-600", sub: "in catalog" },
  ];

  const today = new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-6">
      {/* Hero strip */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 p-6 text-white shadow-lg shadow-blue-600/20">
        <div className="pointer-events-none absolute -right-8 -top-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-24 -bottom-16 h-40 w-40 rounded-full bg-white/10" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-100">{today}</p>
            <h2 className="mt-1 text-2xl font-bold">Good day, Admin</h2>
            <p className="mt-1 text-sm text-blue-100">
              Here's what's happening across your MarketUp store today.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow transition-transform hover:scale-[1.02]"
            >
              <ShoppingCart className="h-4 w-4" /> View orders
            </Link>
            <Link
              to="/admin/reports"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/30 transition-colors hover:bg-white/25"
            >
              Reports <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="border-0 shadow-sm ring-1 ring-slate-200">
              <CardContent className="p-4">
                <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${c.tint} text-white shadow-sm`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="text-xl font-bold tracking-tight text-slate-800">{c.value}</div>
                <div className="text-xs font-medium text-slate-500">{c.label}</div>
                <div className="mt-0.5 text-[11px] text-slate-400">{c.sub}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-0 shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-slate-800">
              <TrendingUp className="h-4 w-4 text-blue-600" /> Revenue (last 7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[260px] w-full">
              <BarChart data={weeklyRevenue} margin={{ left: 0, right: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `₱${v}`} stroke="#94a3b8" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-slate-800">
              <ShoppingCart className="h-4 w-4 text-blue-600" /> Orders (last 7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={ordersChartConfig} className="h-[260px] w-full">
              <LineChart data={weeklyOrders} margin={{ left: 0, right: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} stroke="#94a3b8" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="orders" stroke="var(--color-orders)" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders + low stock */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-0 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base text-slate-800">Recent orders</CardTitle>
            <Link to="/admin/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-semibold">Order</th>
                    <th className="px-5 py-3 font-semibold">Consumer</th>
                    <th className="px-5 py-3 font-semibold">Total</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono text-xs text-slate-500">#{o.id.slice(0, 8)}</td>
                      <td className="px-5 py-3 font-medium text-slate-700">{profileMap[o.consumer_id]?.name ?? "—"}</td>
                      <td className="px-5 py-3 font-semibold text-slate-800">{peso(o.total)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[o.status] ?? "bg-slate-100 text-slate-700"}`}>
                          {statusLabel(o.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">{formatDate(o.created_at)}</td>
                    </tr>
                  ))}
                  {!recentOrders.length && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">No orders yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm ring-1 ring-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-slate-800">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Low stock
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lowStockProducts.length ? (
                lowStockProducts.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 ring-1 ring-amber-100">
                    <span className="truncate text-sm font-medium text-slate-700">{p.name}</span>
                    <span className="ml-2 shrink-0 text-xs font-bold text-amber-600">{p.stock} left</span>
                  </div>
                ))
              ) : (
                <p className="rounded-lg bg-green-50 px-3 py-3 text-sm text-green-700 ring-1 ring-green-100">
                  All products are well stocked.
                </p>
              )}
              <Link
                to="/admin/inventory"
                className="inline-flex items-center gap-1 pt-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Manage inventory <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-slate-800">
                <Package className="h-4 w-4 text-blue-600" /> Catalog
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Link to="/admin/products" className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-slate-700 ring-1 ring-slate-100 transition-colors hover:bg-blue-50 hover:text-blue-700">
                <span className="font-medium">Add a product</span> <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/admin/consumers" className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-slate-700 ring-1 ring-slate-100 transition-colors hover:bg-blue-50 hover:text-blue-700">
                <span className="font-medium">Manage consumers</span> <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/admin/riders" className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-slate-700 ring-1 ring-slate-100 transition-colors hover:bg-blue-50 hover:text-blue-700">
                <span className="font-medium">Manage riders</span> <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
