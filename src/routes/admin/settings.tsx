import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

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
    delivery_fee: 49,
    points_per_peso: 0.01,
    points_redeem_rate: 10,
    low_stock_threshold: 10,
    bottle_exchange_enabled: true,
    allow_cancellation: true,
  });

  const saveOne = (key: keyof SettingsMap, value: unknown) => {
    toast.success(`${key.replace(/_/g, ' ')} saved`);
  };

  const saveAll = () => {
    toast.success("All settings saved");
  };

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

      <button onClick={saveAll} className="mb-8 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
        Save all
      </button>
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
