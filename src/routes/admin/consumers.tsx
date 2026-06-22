import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { downloadCSV, formatDate, peso } from "@/lib/admin-utils";
import { Search, X, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/consumers")({
  component: AdminConsumers,
});

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  points_balance: number;
  is_blocked?: boolean;
  blocked_until?: string | null;
  created_at: string;
};

type OrderRow = { id: string; total: number; status: string; created_at: string };

function AdminConsumers() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [pointsDelta, setPointsDelta] = useState("");
  const [pointsNote, setPointsNote] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "consumer");
    const ids = (roles ?? []).map((r) => r.user_id as string);
    if (!ids.length) { setRows([]); setLoading(false); return; }
    const { data } = await supabase.from("profiles").select("*").in("id", ids).order("created_at", { ascending: false });
    setRows((data ?? []) as Profile[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return rows;
    return rows.filter((r) => r.name?.toLowerCase().includes(s) || r.email?.toLowerCase().includes(s));
  }, [rows, search]);

  const open = async (p: Profile) => {
    setSelected(p);
    setPointsDelta(""); setPointsNote("");
    const { data } = await supabase.from("orders").select("id,total,status,created_at").eq("consumer_id", p.id).order("created_at", { ascending: false });
    setOrders((data ?? []) as OrderRow[]);
  };

  const saveProfile = async () => {
    if (!selected) return;
    const { error } = await supabase.from("profiles").update({
      name: selected.name, phone: selected.phone, address: selected.address, is_blocked: selected.is_blocked,
    }).eq("id", selected.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    load();
  };

  const adjustPoints = async () => {
    if (!selected) return;
    const n = Number(pointsDelta);
    if (!n || Number.isNaN(n)) { toast.error("Enter a number (use negative to deduct)"); return; }
    const { error } = await supabase.rpc("admin_adjust_points", { _user_id: selected.id, _delta: n, _note: pointsNote || "Admin adjustment" });
    if (error) { toast.error(error.message); return; }
    toast.success("Points updated");
    setPointsDelta(""); setPointsNote("");
    const { data } = await supabase.from("profiles").select("*").eq("id", selected.id).maybeSingle();
    if (data) setSelected(data as Profile);
    load();
  };

  const isCurrentlyBlocked = (p: Profile | null) =>
    !!p && (p.is_blocked === true || (!!p.blocked_until && new Date(p.blocked_until).getTime() > Date.now()));

  const applyBlock = async (mode: "24h" | "7d" | "permanent") => {
    if (!selected) return;
    const updates: { is_blocked: boolean; blocked_until: string | null } =
      mode === "permanent"
        ? { is_blocked: true, blocked_until: null }
        : { is_blocked: true, blocked_until: new Date(Date.now() + (mode === "24h" ? 24 : 24 * 7) * 60 * 60 * 1000).toISOString() };
    const { error } = await supabase.from("profiles").update(updates).eq("id", selected.id);
    if (error) { toast.error(error.message); return; }
    toast.success(mode === "permanent" ? "Consumer blocked permanently" : `Consumer blocked for ${mode === "24h" ? "24 hours" : "7 days"}`);
    setSelected({ ...selected, ...updates });
    load();
  };

  const unblock = async () => {
    if (!selected) return;
    const { error } = await supabase.from("profiles").update({ is_blocked: false, blocked_until: null }).eq("id", selected.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Consumer unblocked");
    setSelected({ ...selected, is_blocked: false, blocked_until: null });
    load();
  };

  const exportCSV = () => downloadCSV(`consumers-${Date.now()}.csv`, filtered.map((r) => ({
    id: r.id, name: r.name ?? "", email: r.email ?? "", phone: r.phone ?? "", address: r.address ?? "",
    points: r.points_balance, blocked: isCurrentlyBlocked(r) ? "yes" : "no", blocked_until: r.blocked_until ?? "", joined: r.created_at,
  })));

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
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">Loading…</td></tr>}
            {!loading && !filtered.length && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">No consumers</td></tr>}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{r.name || "—"}</td>
                <td className="px-4 py-3">{r.email}</td>
                <td className="px-4 py-3">{r.phone || "—"}</td>
                <td className="px-4 py-3">{r.points_balance}</td>
                <td className="px-4 py-3">
                  {isCurrentlyBlocked(r) ? (
                    <span className="text-red-600">
                      Blocked{r.blocked_until ? ` · until ${formatDate(r.blocked_until)}` : ""}
                    </span>
                  ) : (
                    <span className="text-green-600">Active</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(r.created_at)}</td>
                <td className="px-4 py-3"><button onClick={() => open(r)} className="text-blue-600 hover:underline">Manage</button></td>
              </tr>
            ))}
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
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!selected.is_blocked} onChange={(e) => setSelected({ ...selected, is_blocked: e.target.checked })} />
                Block this consumer (prevent placing orders — enforced via order policies)
              </label>
              <button onClick={saveProfile} className="w-full rounded-lg bg-slate-900 py-2 font-semibold text-white hover:bg-slate-800">Save profile</button>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 mb-6">
              <div className="text-sm font-semibold mb-2">Points balance: {selected.points_balance}</div>
              <div className="flex gap-2">
                <input type="number" placeholder="+100 or -50" value={pointsDelta} onChange={(e) => setPointsDelta(e.target.value)} className={inp + " flex-1"} />
                <input placeholder="Reason" value={pointsNote} onChange={(e) => setPointsNote(e.target.value)} className={inp + " flex-1"} />
                <button onClick={adjustPoints} className="rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">Apply</button>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">Order history ({orders.length})</div>
              <div className="rounded-lg border border-slate-200 max-h-64 overflow-y-auto">
                {orders.map((o) => (
                  <div key={o.id} className="flex justify-between border-b border-slate-100 px-3 py-2 text-sm last:border-0">
                    <span className="font-mono text-xs">#{o.id.slice(0, 8)} · {o.status}</span>
                    <span>{peso(o.total)} · {formatDate(o.created_at)}</span>
                  </div>
                ))}
                {!orders.length && <div className="px-3 py-4 text-center text-sm text-slate-500">No orders</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inp = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs uppercase text-slate-500">{label}</span><div className="mt-1">{children}</div></label>;
}
