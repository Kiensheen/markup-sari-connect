import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMock } from "@/contexts/MockContext";
import { downloadCSV } from "@/lib/admin-utils";
import { formatDate, ORDER_STATUSES, STATUS_COLORS, peso } from "@/lib/mockData";
import { Search, Download, X } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const { orders, users, updateOrderStatus, assignRider } = useMock();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<(typeof orders)[0] | null>(null);

  const profileMap = useMemo(() => {
    const map: Record<string, (typeof users)[0]> = {};
    users.forEach((u) => { map[u.id] = u; });
    return map;
  }, [users]);

  const riders = useMemo(() => users.filter((u) => u.role === "rider"), [users]);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);
    if (dateFilter !== "all") {
      const now = new Date();
      const start = new Date();
      if (dateFilter === "today") start.setHours(0, 0, 0, 0);
      if (dateFilter === "week") start.setDate(now.getDate() - 7);
      if (dateFilter === "month") start.setDate(now.getDate() - 30);
      list = list.filter((o) => new Date(o.created_at) >= start);
    }
    const s = search.toLowerCase().trim();
    if (s) {
      list = list.filter((o) => {
        const p = profileMap[o.consumer_id];
        return o.id.toLowerCase().includes(s)
          || (p?.name?.toLowerCase().includes(s) ?? false)
          || (p?.email?.toLowerCase().includes(s) ?? false);
      });
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, statusFilter, dateFilter, search, profileMap]);

  const exportCSV = () => {
    downloadCSV(`orders-${Date.now()}.csv`, filtered.map((o) => ({
      id: o.id,
      consumer: profileMap[o.consumer_id]?.name ?? profileMap[o.consumer_id]?.email ?? o.consumer_id,
      rider: o.rider_id ? (profileMap[o.rider_id]?.name ?? o.rider_id) : "",
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
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs">#{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3">{profileMap[o.consumer_id]?.name || profileMap[o.consumer_id]?.email || "—"}</td>
                <td className="px-4 py-3">{o.rider_id ? (profileMap[o.rider_id]?.name || "—") : <span className="text-slate-400">Unassigned</span>}</td>
                <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[o.status] || "bg-slate-100"}`}>{o.status}</span></td>
                <td className="px-4 py-3 font-medium">{peso(o.total)}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(o.created_at)}</td>
                <td className="px-4 py-3"><button onClick={() => setSelected(o)} className="text-sm text-blue-600 hover:underline">View</button></td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">No orders</td></tr>}
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
                <div className="font-medium">{profileMap[selected.consumer_id]?.name || "—"}</div>
                <div className="text-sm text-slate-500">{profileMap[selected.consumer_id]?.email}</div>
                <div className="text-sm text-slate-500">{profileMap[selected.consumer_id]?.phone}</div>
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
                {selected.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between border-b border-slate-100 px-3 py-2 last:border-0 text-sm">
                    <span>{it.name} × {it.quantity}</span>
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
                <select
                  value={selected.status}
                  onChange={(e) => {
                    updateOrderStatus(selected.id, e.target.value);
                    setSelected({ ...selected, status: e.target.value as typeof selected.status });
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs uppercase text-slate-500">Assign rider</span>
                <select
                  value={selected.rider_id ?? ""}
                  onChange={(e) => {
                    assignRider(selected.id, e.target.value);
                    setSelected({ ...selected, rider_id: e.target.value || null });
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">— Unassigned —</option>
                  {riders.map((r) => <option key={r.id} value={r.id}>{r.name || r.email}</option>)}
                </select>
              </label>
            </div>

            <button
              onClick={() => {
                const reason = prompt("Cancellation reason?");
                if (reason !== null) {
                  updateOrderStatus(selected.id, "cancelled");
                  setSelected({ ...selected, status: "cancelled", notes: reason });
                }
              }}
              className="w-full rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Cancel order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
