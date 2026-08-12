import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { useMock } from "@/contexts/MockContext";
import { peso } from "@/lib/mockData";
import { downloadCSV } from "@/lib/admin-utils";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/reports")({
  component: AdminReports,
});

const salesChartConfig = {
  revenue: { label: "Revenue", color: "#2563EB" },
};

const paymentChartConfig = {
  cod: { label: "COD", color: "#2563EB" },
  gcash: { label: "GCash", color: "#60A5FA" },
};

function AdminReports() {
  const { orders, products, users } = useMock();
  const [from, setFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10); });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  const filteredOrders = useMemo(() => {
    const start = new Date(from + "T00:00:00").getTime();
    const end = new Date(to + "T23:59:59").getTime();
    return orders.filter((o) => {
      const t = new Date(o.created_at).getTime();
      return t >= start && t <= end;
    });
  }, [orders, from, to]);

  const revenueTotal = filteredOrders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const cod = filteredOrders.filter((o) => o.payment_method === "cod" && o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const gcash = filteredOrders.filter((o) => o.payment_method !== "cod" && o.status !== "cancelled").reduce((s, o) => s + o.total, 0);

  const salesByDay = useMemo(() => {
    const byDay: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      if (o.status === "cancelled") return;
      const d = o.created_at.slice(0, 10);
      byDay[d] = (byDay[d] ?? 0) + o.total;
    });
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date: date.slice(5), revenue }));
  }, [filteredOrders]);

  const paymentBreakdown = useMemo(() => [
    { name: "cod", value: cod, fill: "var(--color-cod)" },
    { name: "gcash", value: gcash, fill: "var(--color-gcash)" },
  ], [cod, gcash]);

  const topProducts = useMemo(() => {
    const agg: Record<string, { name: string; qty: number; revenue: number }> = {};
    filteredOrders.forEach((o) => {
      o.items?.forEach((it) => {
        if (!agg[it.product_id]) {
          agg[it.product_id] = { name: it.name, qty: 0, revenue: 0 };
        }
        agg[it.product_id].qty += it.quantity;
        agg[it.product_id].revenue += it.quantity * it.price;
      });
    });
    return Object.values(agg).sort((a, b) => b.qty - a.qty).slice(0, 10);
  }, [filteredOrders]);

  const riderRanks = useMemo(() => {
    const delivered = filteredOrders.filter((o) => o.status === "delivered" && o.rider_id);
    const riderMap: Record<string, string> = {};
    users.forEach((u) => { riderMap[u.id] = u.name || u.email; });
    const rstats: Record<string, { name: string; deliveries: number; earnings: number }> = {};
    delivered.forEach((o) => {
      const rid = o.rider_id!;
      if (!rstats[rid]) rstats[rid] = { name: riderMap[rid] || rid.slice(0, 8), deliveries: 0, earnings: 0 };
      rstats[rid].deliveries += 1;
      rstats[rid].earnings += o.delivery_fee;
    });
    return Object.values(rstats).sort((a, b) => b.deliveries - a.deliveries);
  }, [filteredOrders, users]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Reports</h2>
          <p className="text-sm text-slate-500">Revenue, orders and performance over a date range</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-auto border-slate-300 focus:border-blue-500 focus:ring-blue-500/30" />
          <span className="text-slate-400">→</span>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-auto border-slate-300 focus:border-blue-500 focus:ring-blue-500/30" />
          <Button
            onClick={() => downloadCSV(`report-${from}-${to}.csv`, filteredOrders.map((o) => ({
              id: o.id, total: o.total, delivery_fee: o.delivery_fee, payment: o.payment_method, status: o.status, created_at: o.created_at,
            })))}
            className="gap-1 bg-gradient-to-r from-blue-600 to-blue-600 shadow-md shadow-blue-600/20 hover:from-blue-700 hover:to-blue-700"
          >
            <Download className="h-4 w-4" />CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Stat label="Total revenue" value={peso(revenueTotal)} tint="from-green-600 to-green-700" />
        <Stat label="COD revenue" value={peso(cod)} tint="from-sky-500 to-blue-600" />
        <Stat label="GCash/other" value={peso(gcash)} tint="from-blue-400 to-blue-500" />
        <Stat label="Total orders" value={String(filteredOrders.length)} tint="from-slate-600 to-slate-700" />
        <Stat label="Delivered" value={String(filteredOrders.filter((o) => o.status === "delivered").length)} tint="from-emerald-500 to-green-600" />
        <Stat label="Cancelled" value={String(filteredOrders.filter((o) => o.status === "cancelled").length)} tint="from-red-500 to-rose-600" />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card className="border-0 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Sales by day</CardTitle>
          </CardHeader>
          <CardContent>
            {!salesByDay.length ? (
              <p className="text-sm text-muted-foreground">No data for this period</p>
            ) : (
              <ChartContainer config={salesChartConfig} className="h-[280px] w-full">
                <BarChart data={salesByDay}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `₱${v}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Payment split</CardTitle>
          </CardHeader>
          <CardContent>
            {cod + gcash === 0 ? (
              <p className="text-sm text-muted-foreground">No revenue data</p>
            ) : (
              <ChartContainer config={paymentChartConfig} className="mx-auto h-[280px] w-full max-w-[240px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie data={paymentBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                    {paymentBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-sm ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Top selling products</CardTitle>
          </CardHeader>
          <CardContent>
            {!topProducts.length ? <p className="text-sm text-muted-foreground">No data</p> : (
              <ol className="space-y-2 text-sm">
                {topProducts.map((p, i) => (
                  <li key={p.name + i} className="flex justify-between border-b border-border pb-1">
                    <span>{i + 1}. {p.name}</span>
                    <span className="text-muted-foreground">{p.qty} sold · {peso(p.revenue)}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Rider performance</CardTitle>
          </CardHeader>
          <CardContent>
            {!riderRanks.length ? <p className="text-sm text-muted-foreground">No deliveries</p> : (
              <ol className="space-y-2 text-sm">
                {riderRanks.map((r, i) => (
                  <li key={r.name + i} className="flex justify-between border-b border-border pb-1">
                    <span>{i + 1}. {r.name}</span>
                    <span className="text-muted-foreground">{r.deliveries} · {peso(r.earnings)}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <Card className="border-0 shadow-sm ring-1 ring-slate-200">
      <CardContent className="p-4">
        <div className={`mb-2 h-1 w-8 rounded-full bg-gradient-to-r ${tint}`} />
        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
        <div className="mt-1 text-xl font-bold text-slate-800">{value}</div>
      </CardContent>
    </Card>
  );
}
