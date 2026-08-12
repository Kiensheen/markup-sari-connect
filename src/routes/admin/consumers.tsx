import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMock } from "@/contexts/MockContext";
import { formatDate, peso } from "@/lib/mockData";
import { downloadCSV } from "@/lib/admin-utils";
import { Search, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/consumers")({
  component: AdminConsumers,
});

function AdminConsumers() {
  const { users, orders, updateUserProfile, blockUser, unblockUser, adjustPoints } = useMock();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<(typeof users)[0] | null>(null);
  const [pointsDelta, setPointsDelta] = useState("");

  const consumerRows = useMemo(() => users.filter((u) => u.role === "consumer"), [users]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return consumerRows;
    return consumerRows.filter((r) => r.name?.toLowerCase().includes(s) || r.email?.toLowerCase().includes(s));
  }, [consumerRows, search]);

  const consumerOrderCount = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      counts[o.consumer_id] = (counts[o.consumer_id] ?? 0) + 1;
    });
    return counts;
  }, [orders]);

  const isCurrentlyBlocked = (p: (typeof users)[0]) =>
    p.is_blocked === true || (!!p.blocked_until && new Date(p.blocked_until).getTime() > Date.now());

  const saveProfile = () => {
    if (!selected) return;
    updateUserProfile(selected.id, { name: selected.name, phone: selected.phone, address: selected.address });
    toast.success("Profile saved");
  };

  const handleBlock = (mode: "24h" | "7d" | "permanent") => {
    if (!selected) return;
    blockUser(selected.id, mode);
    toast.success(mode === "permanent" ? "Blocked permanently" : `Blocked for ${mode === "24h" ? "24 hours" : "7 days"}`);
    setSelected({ ...selected, is_blocked: true });
  };

  const handleUnblock = () => {
    if (!selected) return;
    unblockUser(selected.id);
    toast.success("Unblocked");
    setSelected({ ...selected, is_blocked: false, blocked_until: null });
  };

  const handleAdjustPoints = () => {
    if (!selected) return;
    const n = Number(pointsDelta);
    if (!n || Number.isNaN(n)) { toast.error("Enter a number (use negative to deduct)"); return; }
    adjustPoints(selected.id, n);
    toast.success(n > 0 ? `${n} points added` : `${Math.abs(n)} points deducted`);
    setPointsDelta("");
  };

  const exportCSV = () => downloadCSV(`consumers-${Date.now()}.csv`, filtered.map((r) => ({
    id: r.id, name: r.name ?? "", email: r.email ?? "", phone: r.phone ?? "", address: r.address ?? "",
    points: r.points, blocked: isCurrentlyBlocked(r) ? "yes" : "no",
    orders: consumerOrderCount[r.id] ?? 0,
  })));

  const inp = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

  const avatar = (r: (typeof users)[0]) => (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-500 text-sm font-bold text-white">
      {(r.name || r.email || "?").charAt(0).toUpperCase()}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Consumers</h2>
          <p className="text-sm text-slate-500">{filtered.length} consumer{filtered.length === 1 ? "" : "s"}</p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-transform hover:scale-[1.02]"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="flex min-w-[220px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30 sm:max-w-md">
        <Search className="h-4 w-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email" className="flex-1 bg-transparent outline-none" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Points</th>
                <th className="px-4 py-3 font-semibold">Orders</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 transition-colors hover:bg-blue-50/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {avatar(r)}
                      <span className="font-medium text-slate-800">{r.name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.email}</td>
                  <td className="px-4 py-3 text-slate-500">{r.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{r.points}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{consumerOrderCount[r.id] ?? 0}</td>
                  <td className="px-4 py-3">
                    {isCurrentlyBlocked(r) ? (
                      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">Blocked</span>
                    ) : (
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setSelected(r); setPointsDelta(""); }} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No consumers found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage consumer</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-6">
              {/* Profile */}
              <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                <div className="mb-1 flex items-center gap-3">
                  {avatar(selected)}
                  <div>
                    <div className="font-semibold text-slate-800">{selected.name}</div>
                    <div className="text-sm text-slate-500">{selected.email}</div>
                  </div>
                </div>
                <Field label="Name"><input className={inp} value={selected.name ?? ""} onChange={(e) => setSelected({ ...selected, name: e.target.value })} /></Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Phone"><input className={inp} value={selected.phone ?? ""} onChange={(e) => setSelected({ ...selected, phone: e.target.value })} /></Field>
                  <Field label="Address"><input className={inp} value={selected.address ?? ""} onChange={(e) => setSelected({ ...selected, address: e.target.value })} /></Field>
                </div>
                <button onClick={saveProfile} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                  Save profile
                </button>
              </div>

              {/* Account access */}
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-800">Account access</div>
                {isCurrentlyBlocked(selected) ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-red-600">This consumer is currently blocked.</p>
                    <button onClick={handleUnblock} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700">Unblock</button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleBlock("24h")} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100">Block 24h</button>
                    <button onClick={() => handleBlock("7d")} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100">Block 7 days</button>
                    <button onClick={() => handleBlock("permanent")} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700">Block permanently</button>
                  </div>
                )}
              </div>

              {/* Points */}
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-2 text-sm font-semibold text-slate-800">Points balance: <span className="text-blue-600">{selected.points}</span></div>
                <div className="flex gap-2">
                  <input type="number" placeholder="+100 or -50" value={pointsDelta} onChange={(e) => setPointsDelta(e.target.value)} className={inp + " flex-1"} />
                  <button onClick={handleAdjustPoints} className="rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Apply</button>
                </div>
              </div>

              {/* Order history */}
              <div>
                <div className="mb-2 text-sm font-semibold text-slate-800">Order history</div>
                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200">
                  {orders.filter((o) => o.consumer_id === selected.id).map((o) => (
                    <div key={o.id} className="flex justify-between border-b border-slate-100 px-3 py-2 text-sm last:border-0">
                      <span className="font-mono text-xs text-slate-500">#{o.id.slice(0, 8)} · {o.status}</span>
                      <span className="text-slate-600">{peso(o.total)} · {formatDate(o.created_at)}</span>
                    </div>
                  ))}
                  {!orders.filter((o) => o.consumer_id === selected.id).length && (
                    <div className="px-3 py-4 text-center text-sm text-slate-400">No orders yet</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose>
              <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">Close</button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}
