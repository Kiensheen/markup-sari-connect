import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMock } from "@/contexts/MockContext";
import { formatDate, peso } from "@/lib/mockData";
import { Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/riders")({
  component: AdminRiders,
});

function AdminRiders() {
  const { users, orders, updateUserProfile } = useMock();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<(typeof users)[0] | null>(null);
  const [addEmail, setAddEmail] = useState("");

  const riderRows = useMemo(() => users.filter((u) => u.role === "rider"), [users]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return riderRows;
    return riderRows.filter((r) => r.name?.toLowerCase().includes(s) || r.email?.toLowerCase().includes(s));
  }, [riderRows, search]);

  const riderStats = useMemo(() => {
    const stats: Record<string, { deliveries: number; earnings: number }> = {};
    riderRows.forEach((r) => { stats[r.id] = { deliveries: 0, earnings: 0 }; });
    orders.filter((o) => o.status === "delivered" && o.rider_id).forEach((o) => {
      if (stats[o.rider_id!]) {
        stats[o.rider_id!].deliveries += 1;
        stats[o.rider_id!].earnings += o.delivery_fee;
      }
    });
    return stats;
  }, [riderRows, orders]);

  const history = useMemo(() => {
    if (!selected) return [];
    return orders
      .filter((o) => o.rider_id === selected.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, selected]);

  const addRider = () => {
    const email = addEmail.trim().toLowerCase();
    if (!email) return;
    const existing = users.find((u) => u.email === email);
    if (!existing) { toast.error("No user with that email"); return; }
    if (existing.role === "rider") { toast.error("Already a rider"); return; }
    updateUserProfile(existing.id, { role: "rider" });
    toast.success("Rider role added");
    setAddEmail("");
  };

  const removeRider = (id: string) => {
    if (!window.confirm("Remove rider role from this user?")) return;
    updateUserProfile(id, { role: "consumer" });
    toast.success("Rider role removed");
    setSelected(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Riders</h1>

      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold mb-2">Add rider</div>
        <div className="flex gap-2">
          <input value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="user@email.com (must already have account)" className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900" />
          <button onClick={addRider} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-4 text-sm text-white hover:bg-slate-800"><Plus className="h-4 w-4" />Add</button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search rider" className="flex-1 outline-none bg-transparent" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Deliveries</th>
              <th className="px-4 py-3">Earnings</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{r.name || "—"}</td>
                <td className="px-4 py-3">{r.email}</td>
                <td className="px-4 py-3">{riderStats[r.id]?.deliveries ?? 0}</td>
                <td className="px-4 py-3">{peso(riderStats[r.id]?.earnings ?? 0)}</td>
                <td className="px-4 py-3"><button onClick={() => setSelected(r)} className="text-blue-600 hover:underline">View</button></td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No riders</td></tr>}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-0 md:p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl rounded-t-2xl md:rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">{selected.name || selected.email}</h2>
                <p className="text-sm text-slate-500">{selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">Deliveries</div><div className="text-xl font-bold">{riderStats[selected.id]?.deliveries ?? 0}</div></div>
              <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">Earnings</div><div className="text-xl font-bold">{peso(riderStats[selected.id]?.earnings ?? 0)}</div></div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-semibold mb-2">Delivery history</div>
              <div className="rounded-lg border border-slate-200 max-h-64 overflow-y-auto">
                {history.map((o) => (
                  <div key={o.id} className="flex justify-between border-b border-slate-100 px-3 py-2 text-sm last:border-0">
                    <span className="font-mono text-xs">#{o.id.slice(0, 8)} · {o.status}</span>
                    <span>{peso(o.delivery_fee)} · {formatDate(o.created_at)}</span>
                  </div>
                ))}
                {!history.length && <div className="px-3 py-4 text-center text-sm text-slate-500">No deliveries yet</div>}
              </div>
            </div>

            <button onClick={() => removeRider(selected.id)} className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
              <Trash2 className="h-4 w-4" /> Remove rider role
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
