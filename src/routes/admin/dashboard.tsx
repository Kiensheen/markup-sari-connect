import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useMock } from "@/contexts/MockContext";
import { peso } from "@/lib/mockData";
import { ShoppingCart, Users, Truck, Package, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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
  const { adminStats, orders } = useMock();

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

  const cards = useMemo(() => [
    { label: "Orders today", value: String(adminStats.orders_today), icon: ShoppingCart, color: "bg-primary" },
    { label: "Revenue today", value: peso(adminStats.revenue_today), icon: TrendingUp, color: "bg-green-600" },
    { label: "Pending orders", value: String(adminStats.pending_orders), icon: ShoppingCart, color: "bg-yellow-500" },
    { label: "Total revenue", value: peso(adminStats.total_revenue), icon: Wallet, color: "bg-emerald-600" },
    { label: "Consumers", value: String(adminStats.total_consumers), icon: Users, color: "bg-indigo-500" },
    { label: "Riders", value: String(adminStats.total_riders), icon: Truck, color: "bg-purple-500" },
    { label: "Products", value: String(adminStats.total_products), icon: Package, color: "bg-orange-500" },
  ], [adminStats]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">📊 Dashboard</h1>
      <p className="mb-6 text-sm text-muted-foreground">Overview of your MarketUp platform</p>

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
    </div>
  );
}
