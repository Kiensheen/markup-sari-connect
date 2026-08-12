import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMock } from "@/contexts/MockContext";
import { formatDate, peso } from "@/lib/mockData";
import { Plus, Search, Trash2, Bike } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/riders")({
  component: AdminRiders,
});

function AdminRiders() {
  const { users, orders, updateUserProfile } = useMock();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<(typeof users)[0] | null>(null);
  const [addEmail, setAddEmail] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);

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
    if (!email) { toast.error("Enter an email"); return; }
    const existing = users.find((u) => u.email === email);
    if (!existing) { toast.error("No user with that email"); return; }
    if (existing.role === "rider") { toast.error("Already a rider"); return; }
    updateUserProfile(existing.id, { role: "rider" });
    toast.success("Rider role added");
    setAddEmail("");
  };

  const removeRider = () => {
    if (!selected) return;
    updateUserProfile(selected.id, { role: "consumer" });
    toast.success("Rider role removed");
    setSelected(null);
    setConfirmRemove(false);
  };

  const avatar = (r: (typeof users)[0]) => (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white">
      {(r.name || r.email || "?").charAt(0).toUpperCase()}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Riders</h2>
        <p className="text-sm text-slate-500">{riderRows.length} rider{riderRows.length === 1 ? "" : "s"} in your delivery fleet</p>
      </div>

      {/* Add rider */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <Bike className="h-5 w-5 text-blue-600" />
        <span className="text-sm font-semibold text-slate-700">Add a rider by email</span>
        <input
          value={addEmail}
          onChange={(e) => setAddEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addRider()}
          placeholder="user@email.com (must already have an account)"
          className="min-w-[200px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        />
        <button onClick={addRider} className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-transform hover:scale-[1.02]">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {/* Search */}
      <div className="flex min-w-[220px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30 sm:max-w-md">
        <Search className="h-4 w-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search rider" className="flex-1 bg-transparent outline-none" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Rider</th>
                <th className="px-4 py-3 font-semibold">Deliveries</th>
                <th className="px-4 py-3 font-semibold">Earnings</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 transition-colors hover:bg-blue-50/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {avatar(r)}
                      <div>
                        <div className="font-medium text-slate-800">{r.name || "—"}</div>
                        <div className="text-xs text-slate-400">{r.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{riderStats[r.id]?.deliveries ?? 0}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{peso(riderStats[r.id]?.earnings ?? 0)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelected(r)} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">No riders found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rider detail */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rider profile</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                {avatar(selected)}
                <div>
                  <div className="font-semibold text-slate-800">{selected.name}</div>
                  <div className="text-sm text-slate-500">{selected.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-blue-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-blue-400">Deliveries</div>
                  <div className="mt-1 text-2xl font-bold text-blue-700">{riderStats[selected.id]?.deliveries ?? 0}</div>
                </div>
                <div className="rounded-xl bg-blue-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-blue-400">Earnings</div>
                  <div className="mt-1 text-2xl font-bold text-blue-700">{peso(riderStats[selected.id]?.earnings ?? 0)}</div>
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Delivery history</div>
                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200">
                  {history.map((o) => (
                    <div key={o.id} className="flex justify-between border-b border-slate-100 px-3 py-2 text-sm last:border-0">
                      <span className="font-mono text-xs text-slate-500">{o.id} · {o.status}</span>
                      <span className="text-slate-600">{peso(o.delivery_fee)} · {formatDate(o.created_at)}</span>
                    </div>
                  ))}
                  {!history.length && <div className="px-3 py-4 text-center text-sm text-slate-400">No deliveries yet</div>}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose>
              <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">Close</button>
            </DialogClose>
            <button
              onClick={() => setConfirmRemove(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" /> Remove rider role
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title="Remove rider role?"
        description={`${selected?.name || "This user"} will no longer be able to accept deliveries. Their account is kept.`}
        confirmLabel="Remove role"
        destructive
        onConfirm={removeRider}
      />
    </div>
  );
}
