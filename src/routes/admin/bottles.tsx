import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/admin-utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/bottles")({
  component: AdminBottles,
});

type Exchange = {
  id: string;
  user_id: string;
  product_name: string;
  quantity: number;
  status: string;
  notes: string | null;
  created_at: string;
};

function AdminBottles() {
  const [rows, setRows] = useState<Exchange[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { name: string | null; email: string | null }>>({});
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("bottle_exchanges").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    const r = (data ?? []) as Exchange[];
    setRows(r);
    const ids = Array.from(new Set(r.map((x) => x.user_id)));
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id,name,email").in("id", ids);
      const m: Record<string, { name: string | null; email: string | null }> = {};
      (profs ?? []).forEach((p) => { m[p.id as string] = { name: p.name as string, email: p.email as string }; });
      setProfiles(m);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bottle_exchanges").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated");
    load();
  };

  const totals = {
    pending: rows.filter((r) => r.status === "pending").reduce((s, r) => s + r.quantity, 0),
    approved: rows.filter((r) => r.status === "approved").reduce((s, r) => s + r.quantity, 0),
    collected: rows.filter((r) => r.status === "collected").reduce((s, r) => s + r.quantity, 0),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Bottle exchanges</h1>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat label="Pending bottles" value={totals.pending} />
        <Stat label="Approved bottles" value={totals.approved} />
        <Stat label="Collected bottles" value={totals.collected} />
      </div>

      <select value={filter} onChange={(e) => setFilter(e.target.value)} className="mb-4 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="collected">Collected</option>
        <option value="rejected">Rejected</option>
      </select>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">Loading…</td></tr>}
            {!loading && !rows.length && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">No exchanges</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{profiles[r.user_id]?.name || profiles[r.user_id]?.email || r.user_id.slice(0, 8)}</td>
                <td className="px-4 py-3">{r.product_name}</td>
                <td className="px-4 py-3">{r.quantity}</td>
                <td className="px-4 py-3 text-slate-500">{r.notes || "—"}</td>
                <td className="px-4 py-3"><span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{r.status}</span></td>
                <td className="px-4 py-3 text-slate-500">{formatDate(r.created_at)}</td>
                <td className="px-4 py-3">
                  <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1 text-xs">
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                    <option value="collected">collected</option>
                    <option value="rejected">rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs uppercase text-slate-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
