import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Recycle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { ADDRESS_STORAGE_KEY, DELIVERY_FEE } from "@/lib/constants";
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
  const [bottleExchange, setBottleExchange] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(ADDRESS_STORAGE_KEY);
    if (saved) setAddress(saved);
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("address,phone").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.address && !localStorage.getItem(ADDRESS_STORAGE_KEY)) setAddress(data.address);
      if (data?.phone) setPhone(data.phone);
    });
  }, [user]);

  const handleAddressChange = (value: string) => {
    setAddress(value);
    localStorage.setItem(ADDRESS_STORAGE_KEY, value);
  };

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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("Checkout session exists:", !!session);
      console.log("Access token exists:", !!session?.access_token);
      console.log("Token preview:", session?.access_token ? `${session.access_token.substring(0, 20)}...` : "none");
      if (sessionError || !session) {
        console.error("No valid session:", sessionError);
        toast.error("Please login again");
        return;
      }

      const userId = session.user.id;
      console.log("Checkout user ID:", userId);

      const orderTotal = Number(total) + DELIVERY_FEE;

      const orderData = {
        consumer_id: userId,
        total: orderTotal,
        delivery_fee: DELIVERY_FEE,
        delivery_address: address,
        payment_method: payment,
        status: "pending" as const,
        notes: bottleExchange ? "Bottle-to-bottle exchange requested" : null,
      };

      console.log("Checkout insert payload:", orderData);

      const { data: order, error } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();
      if (error) throw error;

      const orderItems = items.map((i) => ({
        order_id: order.id,
        product_id: i.id,
        quantity: i.quantity,
        price: Number(i.price),
      }));

      const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
      if (itemsErr) throw itemsErr;

      const { data: earned } = await supabase.rpc("award_order_points", { _order_id: order.id });
      await supabase.from("profiles").update({ address, phone }).eq("id", userId);

      clear();
      toast.success(`Order placed! ${earned && earned > 0 ? `+${earned} points earned` : ""}`);
      navigate({ to: "/orders" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to place order";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <section className="space-y-2 rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Order summary</h2>
        {items.map((i) => (
          <div key={i.id} className="flex justify-between text-sm">
            <span className="line-clamp-1">{i.name} × {i.quantity}</span>
            <span>₱{(i.price * i.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div className="border-t border-border pt-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₱{total.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Delivery fee</span><span>₱{DELIVERY_FEE}</span></div>
          <div className="mt-1 flex justify-between text-base font-bold"><span>Total</span><span className="text-primary">₱{(total + DELIVERY_FEE).toLocaleString()}</span></div>
        </div>
      </section>

      <section className="space-y-2 rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Delivery address</h2>
        <textarea
          required
          value={address}
          onChange={(e) => handleAddressChange(e.target.value)}
          placeholder="Complete delivery address"
          rows={2}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Contact phone"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Delivery notes (optional)"
          rows={2}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </section>

      <section className="space-y-2 rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Payment method</h2>
        <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${payment === "cod" ? "border-primary bg-primary-soft" : "border-border"}`}>
          <input type="radio" name="pm" checked={payment === "cod"} onChange={() => setPayment("cod")} className="accent-primary" />
          <div>
            <p className="text-sm font-semibold">Cash on Delivery (COD)</p>
            <p className="text-xs text-muted-foreground">Pay with cash when the rider arrives</p>
          </div>
        </label>
        <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${payment === "online" ? "border-primary bg-primary-soft" : "border-border"}`}>
          <input type="radio" name="pm" checked={payment === "online"} onChange={() => setPayment("online")} className="accent-primary" />
          <div>
            <p className="text-sm font-semibold">GCash</p>
            <p className="text-xs text-muted-foreground">Pay via GCash e-wallet</p>
          </div>
        </label>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-soft p-2 text-primary"><Recycle className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-semibold">Bottle-to-bottle exchange</p>
              <p className="text-xs text-muted-foreground">Return empty bottles when your order is delivered</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={bottleExchange}
            onClick={() => setBottleExchange((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${bottleExchange ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${bottleExchange ? "translate-x-5" : ""}`} />
          </button>
        </label>
      </section>

      <button disabled={busy} type="submit" className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
        {busy ? "Placing order…" : "Place Order"}
      </button>
    </form>
  );
}
