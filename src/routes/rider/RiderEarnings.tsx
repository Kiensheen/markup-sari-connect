import { useCallback, useEffect, useState } from "react";
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

export function RiderEarnings() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<CompletedDelivery[]>([]);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [weekEarnings, setWeekEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    // Fetch today's earnings
    const { data: todayData } = await supabase
      .from("orders")
      .select("delivery_fee")
      .eq("rider_id", user.id)
      .eq("status", "delivered")
      .gte("created_at", startOfToday.toISOString());

    const todaySum = (todayData ?? []).reduce((s, d) => s + Number(d.delivery_fee), 0);
    setTodayEarnings(todaySum);

    // Fetch this week's earnings (last 7 days)
    const { data: weekData } = await supabase
      .from("orders")
      .select("delivery_fee")
      .eq("rider_id", user.id)
      .eq("status", "delivered")
      .gte("created_at", startOfWeek.toISOString());

    const weekSum = (weekData ?? []).reduce((s, d) => s + Number(d.delivery_fee), 0);
    setWeekEarnings(weekSum);

    // Fetch completed deliveries list
    const { data: listData } = await supabase
      .from("orders")
      .select("id,delivery_fee,created_at,delivery_address")
      .eq("rider_id", user.id)
      .eq("status", "delivered")
      .order("created_at", { ascending: false });

    setDeliveries((listData as CompletedDelivery[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

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
