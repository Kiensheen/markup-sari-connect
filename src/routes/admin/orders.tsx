import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ORDER_STATUSES, STATUS_COLORS, downloadCSV, formatDate, peso } from "@/lib/admin-utils";
import { toast } from "sonner";
import { Download, Search, X } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

type Order = {
  id: string;
  consumer_id: string;
  rider_id: string | null;
  status: string;
  total: number;
  delivery_fee: number;
  payment_method: string;
  delivery_address: string | null;
  notes: string | null;
  created_at: string;
};

type Profile = { id: string; name: string | null; email: string | null; phone: string | null };
type Rider = { user_id: string };

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [riders, setRiders] = useState<Profile[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [items, setItems] = useState<{ id: string; quantity: number; price: number; product_id: string; products?: { name: string } | null }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    if (dateFilter !== "all") {
      const now = new Date();
      const start = new Date();
      if (dateFilter === "today") start.setHours(0, 0, 0, 0);
      if (dateFilter === "week") start.setDate(now.getDate() - 7);
      if (dateFilter === "month") start.setDate(now.getDate() - 30);
      q = q.gte("created_at", start.toISOString());
    }
    const { data, error } = await q;
    if (error) { toast.error(error.message); setLoading(false); return; }
    const ords = (data ?? []) as Order[];
    setOrders(ords);

    const userIds = Array.from(new Set(ords.flatMap((o) => [o.consumer_id, o.rider_id].filter(Boolean)))) as string[];
    if (userIds.length) {
      const { data: pdata } = await supabase.from("profiles").select("id,name,email,phone").in("id", userIds);
      const map: Record<string, Profile> = {};
      (pdata ?? []).forEach((p) => { map[p.id] = p as Profile; });
      setProfiles(map);
    }

    const { data: riderRoles } = await supabase.from("user_roles").select("user_id").eq("role", "rider");
    const riderIds = (riderRoles ?? []).map((r: Rider) => r.user_id);
    if (riderIds.length) {
      const { data: rps } = await supabase.from("profiles").select("id,name,email,phone").in("id", riderIds);
      setRiders((rps ?? []) as Profile[]);
    }
    setLoading(false);
  }, [statusFilter, dateFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return orders;
    return orders.filter((o) => {
      const p = profiles[o.consumer_id];
      return o.id.toLowerCase().includes(s)
        || (p?.name?.toLowerCase().includes(s) ?? false)
        || (p?.email?.toLowerCase().includes(s) ?? false);
    });
  }, [orders, profiles, search]);

  const openOrder = async (o: Order) => {
    setSelected(o);
    const { data } = await supabase.from("order_items").select("id,quantity,price,product_id,products(name)").eq("order_id", o.id);
    setItems((data ?? []) as never);
  };

  const updateOrder = async (id: string, patch: Partial<Order>) => {
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Order updated");
    setSelected((s) => (s && s.id === id ? { ...s, ...patch } as Order : s));
    load();
  };

  const cancelOrder = async (id: string) => {
    const reason = prompt("Cancellation reason?");
    if (reason === null) return;
    await updateOrder(id, { status: "cancelled", notes: reason });
  };

  const exportCSV = () => {
    downloadCSV(`orders-${Date.now()}.csv`, filtered.map((o) => ({
      id: o.id,
      consumer: profiles[o.consumer_id]?.name ?? profiles[o.consumer_id]?.email ?? o.consumer_id,
      rider: o.rider_id ? (profiles[o.rider_id]?.name ?? o.rider_id) : "",
      status: o.status,
      total: o.total,
      delivery_fee: o.delivery_fee,
      payment_method: o.payment_method,
      address: o.delivery_address ?? "",
      created_at: o.created_at,
    })));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as "today" | "week" | "month" | "all")} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
        </select>
        <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, name, email" className="flex-1 outline-none bg-transparent" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Consumer</th>
              <th className="px-4 py-3">Rider</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">Loading…</td></tr>}
            {!loading && !filtered.length && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">No orders</td></tr>}
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs">#{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3">{profiles[o.consumer_id]?.name || profiles[o.consumer_id]?.email || "—"}</td>
                <td className="px-4 py-3">{o.rider_id ? (profiles[o.rider_id]?.name || "—") : <span className="text-slate-400">Unassigned</span>}</td>
                <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[o.status] || "bg-slate-100"}`}>{o.status}</span></td>
                <td className="px-4 py-3 font-medium">{peso(o.total)}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(o.created_at)}</td>
                <td className="px-4 py-3"><button onClick={() => openOrder(o)} className="text-sm text-blue-600 hover:underline">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-0 md:p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl rounded-t-2xl md:rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">Order #{selected.id.slice(0, 8)}</h2>
                <p className="text-sm text-slate-500">{formatDate(selected.created_at)}</p>
              </div>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5" /></button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <div>
                <div className="text-xs uppercase text-slate-500">Consumer</div>
                <div className="font-medium">{profiles[selected.consumer_id]?.name || "—"}</div>
                <div className="text-sm text-slate-500">{profiles[selected.consumer_id]?.email}</div>
                <div className="text-sm text-slate-500">{profiles[selected.consumer_id]?.phone}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-slate-500">Delivery</div>
                <div className="text-sm">{selected.delivery_address || "—"}</div>
                <div className="text-sm text-slate-500">Payment: {selected.payment_method.toUpperCase()}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs uppercase text-slate-500 mb-2">Items</div>
              <div className="rounded-lg border border-slate-200">
                {items.map((it) => (
                  <div key={it.id} className="flex justify-between border-b border-slate-100 px-3 py-2 last:border-0 text-sm">
                    <span>{it.products?.name || it.product_id.slice(0, 8)} × {it.quantity}</span>
                    <span>{peso(Number(it.price) * it.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between px-3 py-2 text-sm border-t border-slate-200">
                  <span>Delivery fee</span><span>{peso(selected.delivery_fee)}</span>
                </div>
                <div className="flex justify-between px-3 py-2 font-bold border-t border-slate-200">
                  <span>Total</span><span>{peso(selected.total)}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 mb-4">
              <label className="block">
                <span className="text-xs uppercase text-slate-500">Status</span>
                <select value={selected.status} onChange={(e) => updateOrder(selected.id, { status: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs uppercase text-slate-500">Assign rider</span>
                <select value={selected.rider_id ?? ""} onChange={(e) => updateOrder(selected.id, { rider_id: e.target.value || null })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option value="">— Unassigned —</option>
                  {riders.map((r) => <option key={r.id} value={r.id}>{r.name || r.email}</option>)}
                </select>
              </label>
            </div>

            <button onClick={() => cancelOrder(selected.id)} className="w-full rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
              Cancel order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
