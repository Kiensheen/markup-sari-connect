import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Truck, Coins, Package, Recycle, Save, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";

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
    void value;
    toast.success(`${key.replace(/_/g, " ")} saved`);
  };

  const saveAll = () => {
    toast.success("All settings saved");
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Settings</h2>
        <p className="text-sm text-slate-500">Configure how your MarketUp store operates</p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>Settings are applied immediately as you change them. Values are simulated for this demo.</p>
      </div>

      <Section title="Delivery" icon={Truck}>
        <NumField label="Default delivery fee (₱)" value={s.delivery_fee} onChange={(v) => { setS({ ...s, delivery_fee: v }); saveOne("delivery_fee", v); }} />
        <ToggleField label="Allow order cancellation" description="Consumers can cancel pending orders" value={s.allow_cancellation} onChange={(v) => { setS({ ...s, allow_cancellation: v }); saveOne("allow_cancellation", v); }} />
      </Section>

      <Section title="Loyalty points" icon={Coins}>
        <NumField label="Points earned per peso spent" value={s.points_per_peso} step="0.001" onChange={(v) => { setS({ ...s, points_per_peso: v }); saveOne("points_per_peso", v); }} />
        <NumField label="Pesos discount per 100 points" value={s.points_redeem_rate} onChange={(v) => { setS({ ...s, points_redeem_rate: v }); saveOne("points_redeem_rate", v); }} />
      </Section>

      <Section title="Inventory" icon={Package}>
        <NumField label="Low stock threshold" value={s.low_stock_threshold} onChange={(v) => { setS({ ...s, low_stock_threshold: v }); saveOne("low_stock_threshold", v); }} />
      </Section>

      <Section title="Bottle exchange" icon={Recycle}>
        <ToggleField label="Enable bottle exchange feature" description="Allow consumers to return bottles for credit" value={s.bottle_exchange_enabled} onChange={(v) => { setS({ ...s, bottle_exchange_enabled: v }); saveOne("bottle_exchange_enabled", v); }} />
      </Section>

      <button
        onClick={saveAll}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-transform hover:scale-[1.02]"
      >
        <Save className="h-4 w-4" /> Save all settings
      </button>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Truck; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function NumField({ label, value, onChange, step }: { label: string; value: number; onChange: (v: number) => void; step?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-700">{label}</span>
      <input
        type="number"
        step={step ?? "1"}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-32 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      />
    </div>
  );
}

function ToggleField({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm text-slate-700">{label}</div>
        <div className="text-xs text-slate-400">{description}</div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
