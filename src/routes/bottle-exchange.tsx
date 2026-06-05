import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Recycle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/bottle-exchange")({
  component: BottlePage,
});

interface Req { id: string; product_name: string; quantity: number; status: string; notes: string | null; created_at: string; }

function BottlePage() {
  const { user, loading } = useAuth();
  const [requests, setRequests] = useState<Req[]>([]);
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    if (!user) return;
    supabase.from("bottle_exchanges").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setRequests((data as Req[]) ?? []));
  };

  useEffect(refresh, [user]);

  if (loading) return <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>;
  if (!user) return (
    <div className="py-16 text-center">
      <h2 className="text-xl font-semibold">Sign in to request exchange</h2>
      <Link to="/auth" className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Sign in</Link>
    </div>
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("bottle_exchanges").insert({
      user_id: user.id, product_name: name, quantity: qty, notes,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Exchange requested! Our rider will pick up the bottles.");
    setName(""); setQty(1); setNotes(""); refresh();
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-primary"><Recycle className="h-5 w-5" /><h1 className="text-xl font-bold">Bottle Exchange</h1></div>
        <p className="mt-1 text-sm text-muted-foreground">Return empty bottles and get a discount on your next order.</p>
      </div>

      <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">New exchange request</h2>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Bottle product (e.g. Coca-Cola 1.5L)"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <input required type="number" min={1} value={qty} onChange={(e) => setQty(parseInt(e.target.value || "1"))} placeholder="Number of empty bottles"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Pickup notes (optional)" rows={2}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <button disabled={busy} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {busy ? "Submitting…" : "Request pickup"}
        </button>
      </form>

      <section>
        <h2 className="mb-2 font-semibold">Your requests</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No requests yet.</p>
        ) : (
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <div>
                  <p className="text-sm font-semibold">{r.product_name} × {r.quantity}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold capitalize text-primary">{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
