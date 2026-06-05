import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
});

interface Order {
  id: string;
  status: string;
  total: number;
  delivery_fee: number;
  payment_method: string;
  created_at: string;
  order_items: { id: string; quantity: number; price: number; products: { name: string } | null }[];
}

const statusColor: Record<string, string> = {
  pending: "bg-warning/20 text-warning-foreground",
  confirmed: "bg-primary-soft text-primary",
  assigned: "bg-primary-soft text-primary",
  picked_up: "bg-accent text-accent-foreground",
  delivered: "bg-success/20 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};

function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!user) { setBusy(false); return; }
    supabase
      .from("orders")
      .select("id,status,total,delivery_fee,payment_method,created_at,order_items(id,quantity,price,products(name))")
      .eq("consumer_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setOrders((data as any) ?? []); setBusy(false); });
  }, [user]);

  if (loading || busy) return <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>;
  if (!user) return (
    <div className="py-16 text-center">
      <h2 className="text-xl font-semibold">Sign in to view orders</h2>
      <Link to="/auth" className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Sign in</Link>
    </div>
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My orders</h1>
      {orders.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusColor[o.status] ?? "bg-muted"}`}>{o.status.replace("_", " ")}</span>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                {o.order_items?.map((it) => (
                  <div key={it.id} className="flex justify-between text-muted-foreground">
                    <span className="line-clamp-1">{it.products?.name ?? "Item"} × {it.quantity}</span>
                    <span>₱{(it.price * it.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-semibold">
                <span>Total</span><span className="text-primary">₱{Number(o.total).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground capitalize">{o.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
