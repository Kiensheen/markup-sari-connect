import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, TrendingUp, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { formatPeso } from "@/lib/rider-utils";

interface CompletedDelivery {
  id: string;
  delivery_fee: number;
  created_at: string;
  delivery_address: string | null;
}

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isThisWeek(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  return d >= start;
}

export function RiderEarnings() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<CompletedDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("id,delivery_fee,created_at,delivery_address")
      .eq("rider_id", user.id)
      .eq("status", "delivered")
      .order("created_at", { ascending: false });
    setDeliveries((data as CompletedDelivery[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const todayEarnings = useMemo(
    () => deliveries.filter((d) => isToday(d.created_at)).reduce((s, d) => s + Number(d.delivery_fee), 0),
    [deliveries],
  );

  const weekEarnings = useMemo(
    () => deliveries.filter((d) => isThisWeek(d.created_at)).reduce((s, d) => s + Number(d.delivery_fee), 0),
    [deliveries],
  );

  if (loading) {
    return <p className="py-16 text-center text-muted-foreground">Loading earnings…</p>;
  }

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
        {deliveries.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No completed deliveries yet.
          </div>
        ) : (
          deliveries.map((d) => (
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
