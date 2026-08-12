import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMock } from "@/contexts/MockContext";
import { downloadCSV } from "@/lib/admin-utils";
import { formatDate, ORDER_STATUSES, STATUS_COLORS, statusLabel, peso } from "@/lib/mockData";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const PAGE_SIZE = 8;

function AdminOrders() {
  const { orders, users, updateOrderStatus, assignRider } = useMock();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<(typeof orders)[0] | null>(null);
  const [page, setPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
    toast.success("Orders exported");
  };

  const selectCls = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">All orders</h2>
          <p className="text-sm text-slate-500">{filtered.length} order{filtered.length === 1 ? "" : "s"}</p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-transform hover:scale-[1.02]"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={selectCls}>
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
        <select value={dateFilter} onChange={(e) => { setDateFilter(e.target.value as typeof dateFilter); setPage(1); }} className={selectCls}>
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
        </select>
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30">
          <Search className="h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by ID, name, email" className="flex-1 bg-transparent outline-none" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Consumer</th>
                <th className="px-4 py-3 font-semibold">Rider</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((o) => (
                <tr key={o.id} className="border-t border-slate-100 transition-colors hover:bg-blue-50/40">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{o.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{profileMap[o.consumer_id]?.name || profileMap[o.consumer_id]?.email || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {o.rider_id ? (profileMap[o.rider_id]?.name || "—") : <span className="text-slate-400">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[o.status] || "bg-slate-100 text-slate-700"}`}>
                      {statusLabel(o.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{peso(o.total)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(o.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelected(o)} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {!pageItems.length && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No orders match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <span className="text-xs text-slate-500">
              Page {safePage} of {totalPages} · {filtered.length} results
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order {selected?.id}</DialogTitle>
            {selected && <p className="text-sm text-slate-500">{formatDate(selected.created_at)}</p>}
          </DialogHeader>

          {selected && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Consumer</div>
                  <div className="mt-1 font-semibold text-slate-800">{profileMap[selected.consumer_id]?.name || "—"}</div>
                  <div className="text-sm text-slate-500">{profileMap[selected.consumer_id]?.email}</div>
                  <div className="text-sm text-slate-500">{profileMap[selected.consumer_id]?.phone}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Delivery</div>
                  <div className="mt-1 text-sm text-slate-700">{selected.delivery_address || "—"}</div>
                  <div className="text-sm text-slate-500">Payment: {selected.payment_method.toUpperCase()}</div>
                  {selected.notes && <div className="mt-1 text-sm text-slate-500">Notes: {selected.notes}</div>}
                  {selected.admin_note && <div className="mt-1 text-sm font-medium text-amber-600">Cancellation note: {selected.admin_note}</div>}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Items</div>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  {selected.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between border-b border-slate-100 px-3 py-2 text-sm last:border-0">
                      <span className="text-slate-700">{it.name} <span className="text-slate-400">× {it.quantity}</span></span>
                      <span className="font-medium text-slate-800">{peso(Number(it.price) * it.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    <span className="text-slate-500">Delivery fee</span><span className="text-slate-800">{peso(selected.delivery_fee)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 px-3 py-2 font-bold">
                    <span className="text-slate-800">Total</span><span className="text-blue-600">{peso(selected.total)}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</span>
                  <select
                    value={selected.status}
                    onChange={(e) => {
                      updateOrderStatus(selected.id, e.target.value);
                      setSelected({ ...selected, status: e.target.value as typeof selected.status });
                      toast.success("Status updated");
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  >
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Assign rider</span>
                  <select
                    value={selected.rider_id ?? ""}
                    onChange={(e) => {
                      assignRider(selected.id, e.target.value);
                      setSelected({ ...selected, rider_id: e.target.value || null });
                      toast.success(e.target.value ? "Rider assigned" : "Rider unassigned");
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="">— Unassigned —</option>
                    {riders.map((r) => <option key={r.id} value={r.id}>{r.name || r.email}</option>)}
                  </select>
                </label>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose>
              <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">Close</button>
            </DialogClose>
            <button
              onClick={() => {
                if (!selected) return;
                const reason = prompt("Cancellation reason?");
                updateOrderStatus(selected.id, "cancelled", reason ?? null);
                setSelected({ ...selected, status: "cancelled", admin_note: reason ?? null });
                toast.success("Order cancelled");
              }}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              Cancel order
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
