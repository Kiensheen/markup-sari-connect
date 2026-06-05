import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { user, loading } = useAuth();
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<"cod" | "online">("cod");
  const [busy, setBusy] = useState(false);
  const deliveryFee = 50;

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("address,phone").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.address) setAddress(data.address);
      if (data?.phone) setPhone(data.phone);
    });
  }, [user]);

  if (loading) return <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>;
  if (!user) return (
    <div className="py-16 text-center">
      <h2 className="text-xl font-semibold">Sign in to check out</h2>
      <Link to="/auth" className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Sign in</Link>
    </div>
  );
  if (items.length === 0) return <p className="py-10 text-center text-sm text-muted-foreground">Your cart is empty.</p>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data: order, error } = await supabase.from("orders").insert({
        consumer_id: user.id,
        status: "pending",
        total: total + deliveryFee,
        delivery_fee: deliveryFee,
        payment_method: payment,
        delivery_address: address,
        notes,
      }).select().single();
      if (error) throw error;

      const { error: itemsErr } = await supabase.from("order_items").insert(
        items.map((i) => ({ order_id: order.id, product_id: i.id, quantity: i.quantity, price: i.price }))
      );
      if (itemsErr) throw itemsErr;

      // Earn points: 1 point per ₱100 spent
      const earned = Math.floor(total / 100);
      if (earned > 0) {
        await supabase.from("points_transactions").insert({
          user_id: user.id, points_earned: earned, source: `Order ${order.id.slice(0,8)}`,
        });
        const { data: prof } = await supabase.from("profiles").select("points_balance").eq("id", user.id).maybeSingle();
        await supabase.from("profiles").update({ points_balance: (prof?.points_balance ?? 0) + earned }).eq("id", user.id);
      }
      // Save address/phone
      await supabase.from("profiles").update({ address, phone }).eq("id", user.id);

      clear();
      toast.success(`Order placed! ${earned > 0 ? `+${earned} points` : ""}`);
      navigate({ to: "/orders" });
    } catch (err: any) {
      toast.error(err.message ?? "Failed to place order");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <section className="space-y-2 rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Delivery details</h2>
        <textarea required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Complete delivery address" rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Contact phone" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery notes (optional)" rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
      </section>

      <section className="space-y-2 rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Payment method</h2>
        {(["cod", "online"] as const).map((m) => (
          <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${payment === m ? "border-primary bg-primary-soft" : "border-border"}`}>
            <input type="radio" name="pm" checked={payment === m} onChange={() => setPayment(m)} className="accent-primary" />
            <div>
              <p className="text-sm font-semibold">{m === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
              <p className="text-xs text-muted-foreground">{m === "cod" ? "Pay with cash when the rider arrives" : "Pay using e-wallet or bank transfer"}</p>
            </div>
          </label>
        ))}
      </section>

      <section className="space-y-2 rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Order summary</h2>
        {items.map((i) => (
          <div key={i.id} className="flex justify-between text-sm">
            <span className="line-clamp-1">{i.name} × {i.quantity}</span>
            <span>₱{(i.price * i.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div className="border-t border-border pt-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>₱{total.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>₱{deliveryFee}</span></div>
          <div className="mt-1 flex justify-between text-base font-bold"><span>Total</span><span className="text-primary">₱{(total + deliveryFee).toLocaleString()}</span></div>
        </div>
      </section>

      <button disabled={busy} className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
        {busy ? "Placing order…" : `Place order — ₱${(total + deliveryFee).toLocaleString()}`}
      </button>
    </form>
  );
}
