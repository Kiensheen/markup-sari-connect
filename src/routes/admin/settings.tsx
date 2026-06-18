import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

type SettingsMap = {
  delivery_fee: number;
  points_per_peso: number;
  points_redeem_rate: number;
  low_stock_threshold: number;
  bottle_exchange_enabled: boolean;
  allow_cancellation: boolean;
};

function AdminSettings() {
  const [s, setS] = useState<SettingsMap>({
    delivery_fee: 49, points_per_peso: 0.01, points_redeem_rate: 10,
    low_stock_threshold: 10, bottle_exchange_enabled: true, allow_cancellation: true,
  });
  const [admins, setAdmins] = useState<{ id: string; email: string | null; name: string | null }[]>([]);
  const [newAdmin, setNewAdmin] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("app_settings").select("key,value");
    const out: Partial<SettingsMap> = {};
    (data ?? []).forEach((r) => {
      const k = r.key as keyof SettingsMap;
      (out as Record<string, unknown>)[k] = r.value;
    });
    setS((prev) => ({ ...prev, ...out }));

    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
    const ids = (roles ?? []).map((r) => r.user_id as string);
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id,email,name").in("id", ids);
      setAdmins((profs ?? []) as never);
    } else setAdmins([]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveOne = async (key: keyof SettingsMap, value: unknown) => {
    const { error } = await supabase.from("app_settings").upsert({ key, value }, { onConflict: "key" });
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
  };

  const saveAll = async () => {
    const entries = Object.entries(s);
    for (const [k, v] of entries) {
      await supabase.from("app_settings").upsert({ key: k, value: v }, { onConflict: "key" });
    }
    toast.success("All settings saved");
  };

  const addAdmin = async () => {
    const email = newAdmin.trim().toLowerCase();
    if (!email) return;
    const { data: prof } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
    if (!prof) { toast.error("No user with that email"); return; }
    const { error } = await supabase.from("user_roles").insert({ user_id: prof.id, role: "admin" });
    if (error) { toast.error(error.message); return; }
    toast.success("Admin added");
    setNewAdmin("");
    load();
  };

  const removeAdmin = async (id: string) => {
    if (!confirm("Remove admin role?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", id).eq("role", "admin");
    if (error) { toast.error(error.message); return; }
    toast.success("Removed");
    load();
  };

  if (loading) return <div className="text-slate-500">Loading…</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Section title="Delivery">
        <NumField label="Default delivery fee (₱)" value={s.delivery_fee} onChange={(v) => { setS({ ...s, delivery_fee: v }); saveOne("delivery_fee", v); }} />
        <Toggle label="Allow order cancellation" value={s.allow_cancellation} onChange={(v) => { setS({ ...s, allow_cancellation: v }); saveOne("allow_cancellation", v); }} />
      </Section>

      <Section title="Points">
        <NumField label="Points earned per peso spent" value={s.points_per_peso} step="0.001" onChange={(v) => { setS({ ...s, points_per_peso: v }); saveOne("points_per_peso", v); }} />
        <NumField label="Pesos discount per 100 points" value={s.points_redeem_rate} onChange={(v) => { setS({ ...s, points_redeem_rate: v }); saveOne("points_redeem_rate", v); }} />
      </Section>

      <Section title="Inventory">
        <NumField label="Low stock threshold" value={s.low_stock_threshold} onChange={(v) => { setS({ ...s, low_stock_threshold: v }); saveOne("low_stock_threshold", v); }} />
      </Section>

      <Section title="Bottle exchange">
        <Toggle label="Enable bottle-to-bottle feature" value={s.bottle_exchange_enabled} onChange={(v) => { setS({ ...s, bottle_exchange_enabled: v }); saveOne("bottle_exchange_enabled", v); }} />
      </Section>

      <button onClick={saveAll} className="mb-8 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">Save all</button>

      <Section title="Admin accounts">
        <div className="space-y-2 mb-3">
          {admins.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <span>{a.name || a.email}</span>
              <button onClick={() => removeAdmin(a.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newAdmin} onChange={(e) => setNewAdmin(e.target.value)} placeholder="user@email.com (must have account)" className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <button onClick={addAdmin} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-4 text-sm text-white"><Plus className="h-4 w-4" />Add</button>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-4">
      <div className="font-semibold mb-3">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function NumField({ label, value, onChange, step }: { label: string; value: number; onChange: (v: number) => void; step?: string }) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      <input type="number" step={step ?? "1"} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-32 rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
    </label>
  );
}
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5" />
    </label>
  );
}
