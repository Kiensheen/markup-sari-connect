import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/points")({
  component: PointsPage,
});

const rewards = [
  { id: "r1", name: "₱50 off coupon", cost: 50 },
  { id: "r2", name: "₱150 off coupon", cost: 140 },
  { id: "r3", name: "Free delivery", cost: 30 },
];

interface Txn { id: string; points_earned: number; points_redeemed: number; source: string; created_at: string; }

function PointsPage() {
  const { user, loading } = useAuth();
  const [balance, setBalance] = useState(0);
  const [txns, setTxns] = useState<Txn[]>([]);

  const refresh = async () => {
    if (!user) return;
    const { data: prof } = await supabase.from("profiles").select("points_balance").eq("id", user.id).maybeSingle();
    setBalance(prof?.points_balance ?? 0);
    const { data } = await supabase.from("points_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    setTxns((data as Txn[]) ?? []);
  };

  useEffect(() => { refresh(); }, [user]);

  const redeem = async (r: typeof rewards[number]) => {
    if (!user) return;
    if (balance < r.cost) { toast.error("Not enough points"); return; }
    await supabase.from("points_transactions").insert({ user_id: user.id, points_redeemed: r.cost, source: `Redeemed: ${r.name}` });
    await supabase.from("profiles").update({ points_balance: balance - r.cost }).eq("id", user.id);
    toast.success(`Redeemed ${r.name}!`);
    refresh();
  };

  if (loading) return <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>;
  if (!user) return (
    <div className="py-16 text-center">
      <h2 className="text-xl font-semibold">Sign in to view points</h2>
      <Link to="/auth" className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Sign in</Link>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-sm">
        <div className="flex items-center gap-2 text-sm text-primary-foreground/90"><Award className="h-4 w-4" /> Your Points</div>
        <p className="mt-1 text-4xl font-bold">{balance.toLocaleString()}</p>
        <p className="mt-1 text-xs text-primary-foreground/80">Earn 1 point for every ₱100 spent.</p>
      </div>

      <section>
        <h2 className="mb-2 font-semibold">Redeem rewards</h2>
        <div className="space-y-2">
          {rewards.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary-soft p-2 text-primary"><Gift className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.cost} pts</p>
                </div>
              </div>
              <button onClick={() => redeem(r)} disabled={balance < r.cost} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50">
                Redeem
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Recent activity</h2>
        {txns.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="space-y-1.5">
            {txns.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">{t.source}</p>
                  <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`font-semibold ${t.points_earned > 0 ? "text-success" : "text-destructive"}`}>
                  {t.points_earned > 0 ? `+${t.points_earned}` : `-${t.points_redeemed}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
