import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { downloadCSV, peso } from "@/lib/admin-utils";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/reports")({
  component: AdminReports,
});

type OrderRow = { id: string; total: number; delivery_fee: number; payment_method: string; status: string; created_at: string };

const salesChartConfig = {
  revenue: { label: "Revenue", color: "#2563EB" },
};

const paymentChartConfig = {
  cod: { label: "COD", color: "#2563EB" },
  gcash: { label: "GCash", color: "#60A5FA" },
};

function AdminReports() {
  const [from, setFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10); });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; qty: number; revenue: number }[]>([]);
  const [riderRanks, setRiderRanks] = useState<{ name: string; deliveries: number; earnings: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const start = new Date(from + "T00:00:00").toISOString();
    const end = new Date(to + "T23:59:59").toISOString();

    const { data: ords } = await supabase.from("orders").select("id,total,delivery_fee,payment_method,status,created_at,rider_id").gte("created_at", start).lte("created_at", end);
    const rows = (ords ?? []) as (OrderRow & { rider_id: string | null })[];
    setOrders(rows);

    const orderIds = rows.map((o) => o.id);
    if (orderIds.length) {
      const { data: items } = await supabase.from("order_items").select("quantity,price,product_id,products(name)").in("order_id", orderIds);
      const agg: Record<string, { name: string; qty: number; revenue: number }> = {};
      (items ?? []).forEach((it) => {
        const pid = it.product_id as string;
        const name = (it.products as { name?: string } | null)?.name ?? pid.slice(0, 8);
        if (!agg[pid]) agg[pid] = { name, qty: 0, revenue: 0 };
        agg[pid].qty += Number(it.quantity);
        agg[pid].revenue += Number(it.quantity) * Number(it.price);
      });
      setTopProducts(Object.values(agg).sort((a, b) => b.qty - a.qty).slice(0, 10));
    } else {
      setTopProducts([]);
    }

    const delivered = rows.filter((o) => o.status === "delivered" && o.rider_id);
    const riderIds = Array.from(new Set(delivered.map((o) => o.rider_id as string)));
    const riderMap: Record<string, string> = {};
    if (riderIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id,name,email").in("id", riderIds);
      (profs ?? []).forEach((p) => { riderMap[p.id as string] = (p.name as string) || (p.email as string) || (p.id as string); });
    }
    const rstats: Record<string, { name: string; deliveries: number; earnings: number }> = {};
    delivered.forEach((o) => {
      const rid = o.rider_id as string;
      if (!rstats[rid]) rstats[rid] = { name: riderMap[rid] || rid.slice(0, 8), deliveries: 0, earnings: 0 };
      rstats[rid].deliveries += 1;
      rstats[rid].earnings += Number(o.delivery_fee);
    });
    setRiderRanks(Object.values(rstats).sort((a, b) => b.deliveries - a.deliveries));
    setLoading(false);
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const revenueTotal = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
  const cod = orders.filter((o) => o.payment_method === "cod" && o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
  const gcash = orders.filter((o) => o.payment_method !== "cod" && o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);

  const salesByDay = useMemo(() => {
    const byDay: Record<string, number> = {};
    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      const d = o.created_at.slice(0, 10);
      byDay[d] = (byDay[d] ?? 0) + Number(o.total);
    });
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date: date.slice(5), revenue }));
  }, [orders]);

  const paymentBreakdown = useMemo(() => [
    { name: "cod", value: cod, fill: "var(--color-cod)" },
    { name: "gcash", value: gcash, fill: "var(--color-gcash)" },
  ], [cod, gcash]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">📈 Reports</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-auto" />
          <span>→</span>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-auto" />
          <Button
            onClick={() => downloadCSV(`report-${from}-${to}.csv`, orders.map((o) => ({
              id: o.id, total: o.total, delivery_fee: o.delivery_fee, payment: o.payment_method, status: o.status, created_at: o.created_at,
            })))}
            className="gap-1"
          >
            <Download className="h-4 w-4" />CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Stat label="Total revenue" value={peso(revenueTotal)} />
            <Stat label="COD revenue" value={peso(cod)} />
            <Stat label="GCash/other revenue" value={peso(gcash)} />
            <Stat label="Total orders" value={String(orders.length)} />
            <Stat label="Delivered" value={String(orders.filter((o) => o.status === "delivered").length)} />
            <Stat label="Cancelled" value={String(orders.filter((o) => o.status === "cancelled").length)} />
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
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

            <Card>
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
            <Card>
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
            <Card>
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
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs uppercase text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
