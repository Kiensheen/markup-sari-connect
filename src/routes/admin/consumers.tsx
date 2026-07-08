import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMock } from "@/contexts/MockContext";
import { formatDate, peso } from "@/lib/mockData";
import { downloadCSV } from "@/lib/admin-utils";
import { Search, Download, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/consumers")({
  component: AdminConsumers,
});

function AdminConsumers() {
  const { users, orders, updateUserProfile, blockUser, unblockUser, adjustPoints } = useMock();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<(typeof users)[0] | null>(null);
  const [pointsDelta, setPointsDelta] = useState("");
  const [pointsNote, setPointsNote] = useState("");

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
    toast.success("Saved");
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
    toast.success("Points updated");
    setPointsDelta("");
    setPointsNote("");
  };

  const exportCSV = () => downloadCSV(`consumers-${Date.now()}.csv`, filtered.map((r) => ({
    id: r.id, name: r.name ?? "", email: r.email ?? "", phone: r.phone ?? "", address: r.address ?? "",
    points: r.points, blocked: isCurrentlyBlocked(r) ? "yes" : "no",
    orders: consumerOrderCount[r.id] ?? 0,
  })));

  const inp = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Consumers</h1>
        <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email" className="flex-1 outline-none bg-transparent" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{r.name || "—"}</td>
                <td className="px-4 py-3">{r.email}</td>
                <td className="px-4 py-3">{r.phone || "—"}</td>
                <td className="px-4 py-3">{r.points}</td>
                <td className="px-4 py-3">{consumerOrderCount[r.id] ?? 0}</td>
                <td className="px-4 py-3">
                  {isCurrentlyBlocked(r) ? (
                    <span className="text-red-600 font-medium">Blocked</span>
                  ) : (
                    <span className="text-green-600 font-medium">Active</span>
                  )}
                </td>
                <td className="px-4 py-3"><button onClick={() => { setSelected(r); setPointsDelta(""); setPointsNote(""); }} className="text-blue-600 hover:underline">Manage</button></td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">No consumers</td></tr>}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-0 md:p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl rounded-t-2xl md:rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Manage consumer</h2>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-3 mb-6">
              <Field label="Name"><input className={inp} value={selected.name ?? ""} onChange={(e) => setSelected({ ...selected, name: e.target.value })} /></Field>
              <Field label="Email"><input className={inp} value={selected.email ?? ""} disabled /></Field>
              <Field label="Phone"><input className={inp} value={selected.phone ?? ""} onChange={(e) => setSelected({ ...selected, phone: e.target.value })} /></Field>
              <Field label="Address"><input className={inp} value={selected.address ?? ""} onChange={(e) => setSelected({ ...selected, address: e.target.value })} /></Field>
              <button onClick={saveProfile} className="w-full rounded-lg bg-slate-900 py-2 font-semibold text-white hover:bg-slate-800">Save profile</button>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 mb-6">
              <div className="mb-2 text-sm font-semibold">Account access</div>
              {isCurrentlyBlocked(selected) ? (
                <div className="space-y-2">
                  <p className="text-sm text-red-600">Currently blocked.</p>
                  <button onClick={handleUnblock} className="w-full rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700">Unblock</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Blocked consumers cannot place orders.</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => handleBlock("24h")} className="rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">Block 24h</button>
                    <button onClick={() => handleBlock("7d")} className="rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">Block 7 days</button>
                    <button onClick={() => handleBlock("permanent")} className="rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700">Permanent</button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 p-4 mb-6">
              <div className="text-sm font-semibold mb-2">Points balance: {selected.points}</div>
              <div className="flex gap-2">
                <input type="number" placeholder="+100 or -50" value={pointsDelta} onChange={(e) => setPointsDelta(e.target.value)} className={inp + " flex-1"} />
                <input placeholder="Reason" value={pointsNote} onChange={(e) => setPointsNote(e.target.value)} className={inp + " flex-1"} />
                <button onClick={handleAdjustPoints} className="rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">Apply</button>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">Order history</div>
              <div className="rounded-lg border border-slate-200 max-h-64 overflow-y-auto">
                {orders.filter((o) => o.consumer_id === selected.id).map((o) => (
                  <div key={o.id} className="flex justify-between border-b border-slate-100 px-3 py-2 text-sm last:border-0">
                    <span className="font-mono text-xs">#{o.id.slice(0, 8)} · {o.status}</span>
                    <span>{peso(o.total)} · {formatDate(o.created_at)}</span>
                  </div>
                ))}
                {!orders.filter((o) => o.consumer_id === selected.id).length && <div className="px-3 py-4 text-center text-sm text-slate-500">No orders</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs uppercase text-slate-500">{label}</span><div className="mt-1">{children}</div></label>;
}
