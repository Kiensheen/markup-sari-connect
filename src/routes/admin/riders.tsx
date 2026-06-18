import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, peso } from "@/lib/admin-utils";
import { Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/riders")({
  component: AdminRiders,
});

type Rider = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
};

type Stats = { deliveries: number; earnings: number };
type DeliveryRow = { id: string; delivery_fee: number; total: number; status: string; created_at: string };

function AdminRiders() {
  const [rows, setRows] = useState<Rider[]>([]);
  const [stats, setStats] = useState<Record<string, Stats>>({});
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Rider | null>(null);
  const [history, setHistory] = useState<DeliveryRow[]>([]);
  const [addEmail, setAddEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "rider");
    const ids = (roles ?? []).map((r) => r.user_id as string);
    if (!ids.length) { setRows([]); setLoading(false); return; }
    const { data: profs } = await supabase.from("profiles").select("id,name,email,phone,created_at").in("id", ids);
    const riders = (profs ?? []) as Rider[];
    setRows(riders);

    const { data: ords } = await supabase.from("orders").select("rider_id,delivery_fee,status").in("rider_id", ids).eq("status", "delivered");
    const st: Record<string, Stats> = {};
    ids.forEach((id) => { st[id] = { deliveries: 0, earnings: 0 }; });
    (ords ?? []).forEach((o) => {
      const rid = o.rider_id as string;
      if (!st[rid]) st[rid] = { deliveries: 0, earnings: 0 };
      st[rid].deliveries += 1;
      st[rid].earnings += Number(o.delivery_fee ?? 0);
    });
    setStats(st);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return rows;
    return rows.filter((r) => r.name?.toLowerCase().includes(s) || r.email?.toLowerCase().includes(s));
  }, [rows, search]);

  const open = async (r: Rider) => {
    setSelected(r);
    const { data } = await supabase.from("orders").select("id,delivery_fee,total,status,created_at").eq("rider_id", r.id).order("created_at", { ascending: false });
    setHistory((data ?? []) as DeliveryRow[]);
  };

  const addRider = async () => {
    const email = addEmail.trim().toLowerCase();
    if (!email) return;
    const { data: prof } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
    if (!prof) { toast.error("No user with that email — they must sign up first"); return; }
    const { error } = await supabase.from("user_roles").insert({ user_id: prof.id, role: "rider" });
    if (error) { toast.error(error.message); return; }
    toast.success("Rider role added");
    setAddEmail("");
    load();
  };

  const removeRider = async (id: string) => {
    if (!confirm("Remove rider role from this user?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", id).eq("role", "rider");
    if (error) { toast.error(error.message); return; }
    toast.success("Rider role removed");
    setSelected(null);
    load();
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
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Loading…</td></tr>}
            {!loading && !filtered.length && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No riders</td></tr>}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{r.name || "—"}</td>
                <td className="px-4 py-3">{r.email}</td>
                <td className="px-4 py-3">{stats[r.id]?.deliveries ?? 0}</td>
                <td className="px-4 py-3">{peso(stats[r.id]?.earnings ?? 0)}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(r.created_at)}</td>
                <td className="px-4 py-3"><button onClick={() => open(r)} className="text-blue-600 hover:underline">View</button></td>
              </tr>
            ))}
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
              <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">Deliveries</div><div className="text-xl font-bold">{stats[selected.id]?.deliveries ?? 0}</div></div>
              <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">Earnings</div><div className="text-xl font-bold">{peso(stats[selected.id]?.earnings ?? 0)}</div></div>
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
