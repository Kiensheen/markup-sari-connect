import { Calendar, TrendingUp, Wallet } from "lucide-react";
import { useMock } from "@/contexts/MockContext";
import { formatPeso } from "@/lib/mockData";

export function RiderEarnings() {
  const { orders, currentUser } = useMock();

  const delivered = orders.filter((o) => o.rider_id === currentUser.id && o.status === "delivered");

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  const todayEarnings = delivered
    .filter((d) => new Date(d.created_at) >= startOfToday)
    .reduce((s, d) => s + d.delivery_fee, 0);

  const weekEarnings = delivered
    .filter((d) => new Date(d.created_at) >= startOfWeek)
    .reduce((s, d) => s + d.delivery_fee, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Earnings</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="h-4 w-4 text-primary" /> Today
          </div>
          <p className="mt-2 text-2xl font-bold text-primary">{formatPeso(todayEarnings)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-primary" /> This week
          </div>
          <p className="mt-2 text-2xl font-bold text-primary">{formatPeso(weekEarnings)}</p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <Calendar className="h-4 w-4 text-primary" />
          Completed deliveries
        </h2>
        {delivered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No completed deliveries yet.
          </div>
        ) : (
          delivered.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">Order #{d.id.slice(0, 8)}</p>
                <p className="truncate text-xs text-muted-foreground">{d.delivery_address ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
              </div>
              <span className="ml-3 shrink-0 text-lg font-bold text-primary">{formatPeso(d.delivery_fee)}</span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
