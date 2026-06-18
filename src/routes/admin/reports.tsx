import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { downloadCSV, peso } from "@/lib/admin-utils";
import { Download } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  component: AdminReports,
});

type OrderRow = { id: string; total: number; delivery_fee: number; payment_method: string; status: string; created_at: string };

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

    // Rider ranking
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

  // Sales by day
  const byDay: Record<string, number> = {};
  orders.forEach((o) => {
    if (o.status === "cancelled") return;
    const d = o.created_at.slice(0, 10);
    byDay[d] = (byDay[d] ?? 0) + Number(o.total);
  });
  const days = Object.entries(byDay).sort();
  const maxDay = Math.max(1, ...days.map(([, v]) => v));

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-2 items-center text-sm">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
          <span>→</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
          <button onClick={() => downloadCSV(`report-${from}-${to}.csv`, orders.map((o) => ({
            id: o.id, total: o.total, delivery_fee: o.delivery_fee, payment: o.payment_method, status: o.status, created_at: o.created_at,
          })))} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-white"><Download className="h-4 w-4" />CSV</button>
        </div>
      </div>

      {loading ? <div className="text-slate-500">Loading…</div> : (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <Stat label="Total revenue" value={peso(revenueTotal)} />
            <Stat label="COD revenue" value={peso(cod)} />
            <Stat label="GCash/other revenue" value={peso(gcash)} />
            <Stat label="Total orders" value={String(orders.length)} />
            <Stat label="Delivered" value={String(orders.filter((o) => o.status === "delivered").length)} />
            <Stat label="Cancelled" value={String(orders.filter((o) => o.status === "cancelled").length)} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-6">
            <div className="font-semibold mb-3">Sales by day</div>
            {!days.length ? <div className="text-slate-500 text-sm">No data</div> : (
              <div className="flex items-end gap-1 h-48">
                {days.map(([d, v]) => (
                  <div key={d} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[10px] text-slate-500">{peso(v).replace(".00", "")}</div>
                    <div className="w-full bg-blue-500 rounded-t" style={{ height: `${(v / maxDay) * 100}%`, minHeight: 2 }} />
                    <div className="text-[10px] text-slate-500 rotate-45 origin-top-left whitespace-nowrap mt-2">{d.slice(5)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="font-semibold mb-3">Top selling products</div>
              {!topProducts.length ? <div className="text-slate-500 text-sm">No data</div> : (
                <ol className="space-y-2 text-sm">
                  {topProducts.map((p, i) => (
                    <li key={p.name + i} className="flex justify-between border-b border-slate-100 pb-1">
                      <span>{i + 1}. {p.name}</span>
                      <span className="text-slate-600">{p.qty} sold · {peso(p.revenue)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="font-semibold mb-3">Rider performance</div>
              {!riderRanks.length ? <div className="text-slate-500 text-sm">No deliveries</div> : (
                <ol className="space-y-2 text-sm">
                  {riderRanks.map((r, i) => (
                    <li key={r.name + i} className="flex justify-between border-b border-slate-100 pb-1">
                      <span>{i + 1}. {r.name}</span>
                      <span className="text-slate-600">{r.deliveries} · {peso(r.earnings)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-xs uppercase text-slate-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
