import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { peso } from "@/lib/admin-utils";
import { ShoppingCart, Users, Truck, Package, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

const revenueChartConfig = {
  revenue: { label: "Revenue", color: "#2563EB" },
};

const ordersChartConfig = {
  orders: { label: "Orders", color: "#2563EB" },
};

function AdminDashboard() {
  const [stats, setStats] = useState({
    ordersToday: 0,
    revenueToday: 0,
    pendingOrders: 0,
    totalConsumers: 0,
    totalRiders: 0,
    totalProducts: 0,
    revenueAllTime: 0,
  });
  const [weeklyRevenue, setWeeklyRevenue] = useState<{ date: string; revenue: number }[]>([]);
  const [weeklyOrders, setWeeklyOrders] = useState<{ date: string; orders: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const [ordersTodayRes, pendingRes, consumersRes, ridersRes, productsRes, allOrdersRes, weekOrdersRes] = await Promise.all([
        supabase.from("orders").select("total").gte("created_at", startOfToday.toISOString()).neq("status", "cancelled"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "consumer"),
        supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "rider"),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total").eq("status", "delivered"),
        supabase.from("orders").select("total,created_at").gte("created_at", weekAgo.toISOString()).neq("status", "cancelled"),
      ]);

      const ordersToday = ordersTodayRes.data ?? [];
      const revenueToday = ordersToday.reduce((s, o) => s + Number(o.total ?? 0), 0);
      const revenueAllTime = (allOrdersRes.data ?? []).reduce((s, o) => s + Number(o.total ?? 0), 0);

      const byDay: Record<string, { revenue: number; orders: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        byDay[d.toISOString().slice(0, 10)] = { revenue: 0, orders: 0 };
      }
      (weekOrdersRes.data ?? []).forEach((o) => {
        const key = o.created_at.slice(0, 10);
        if (!byDay[key]) byDay[key] = { revenue: 0, orders: 0 };
        byDay[key].revenue += Number(o.total);
        byDay[key].orders += 1;
      });

      setWeeklyRevenue(Object.entries(byDay).map(([date, v]) => ({ date: date.slice(5), revenue: v.revenue })));
      setWeeklyOrders(Object.entries(byDay).map(([date, v]) => ({ date: date.slice(5), orders: v.orders })));

      setStats({
        ordersToday: ordersToday.length,
        revenueToday,
        pendingOrders: pendingRes.count ?? 0,
        totalConsumers: consumersRes.count ?? 0,
        totalRiders: ridersRes.count ?? 0,
        totalProducts: productsRes.count ?? 0,
        revenueAllTime,
      });
      setLoading(false);
    })();
  }, []);

  const cards = useMemo(() => [
    { label: "Orders today", value: String(stats.ordersToday), icon: ShoppingCart, color: "bg-primary" },
    { label: "Revenue today", value: peso(stats.revenueToday), icon: TrendingUp, color: "bg-green-600" },
    { label: "Pending orders", value: String(stats.pendingOrders), icon: ShoppingCart, color: "bg-yellow-500" },
    { label: "Total revenue", value: peso(stats.revenueAllTime), icon: Wallet, color: "bg-emerald-600" },
    { label: "Consumers", value: String(stats.totalConsumers), icon: Users, color: "bg-indigo-500" },
    { label: "Riders", value: String(stats.totalRiders), icon: Truck, color: "bg-purple-500" },
    { label: "Products", value: String(stats.totalProducts), icon: Package, color: "bg-orange-500" },
  ], [stats]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">📊 Dashboard</h1>
      <p className="mb-6 text-sm text-muted-foreground">Overview of your MarketUp platform</p>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <Card key={c.label}>
                  <CardContent className="p-5">
                    <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${c.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-bold">{c.value}</div>
                    <div className="text-sm text-muted-foreground">{c.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue (last 7 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={revenueChartConfig} className="h-[260px] w-full">
                  <BarChart data={weeklyRevenue} margin={{ left: 0, right: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `₱${v}`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Orders (last 7 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={ordersChartConfig} className="h-[260px] w-full">
                  <LineChart data={weeklyOrders} margin={{ left: 0, right: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="orders" stroke="var(--color-orders)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
