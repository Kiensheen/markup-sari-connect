import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";

import { useMock } from "@/contexts/MockContext";
import { DELIVERY_FEE } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { cartItems, cartTotal, createOrder, currentUser } = useMock();
  const navigate = useNavigate();
  const [address, setAddress] = useState(currentUser.address);
  const [phone, setPhone] = useState(currentUser.phone);
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<"cod" | "gcash">("cod");
  const [busy, setBusy] = useState(false);

  if (cartItems.length === 0) return <p className="py-10 text-center text-sm text-muted-foreground">Your cart is empty.</p>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      createOrder(address, phone, payment, notes);
      toast.success("Order placed successfully!");
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
        {cartItems.map((c) => (
          <div key={c.product.id} className="flex justify-between text-sm">
            <span className="line-clamp-1">{c.product.name} × {c.quantity}</span>
            <span>₱{(c.product.wholesale_price * c.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div className="border-t border-border pt-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₱{cartTotal.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Delivery fee</span><span>₱{DELIVERY_FEE}</span></div>
          <div className="mt-1 flex justify-between text-base font-bold"><span>Total</span><span className="text-primary">₱{(cartTotal + DELIVERY_FEE).toLocaleString()}</span></div>
        </div>
      </section>

      <section className="space-y-2 rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Delivery address</h2>
        <textarea
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
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
        <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${payment === "gcash" ? "border-primary bg-primary-soft" : "border-border"}`}>
          <input type="radio" name="pm" checked={payment === "gcash"} onChange={() => setPayment("gcash")} className="accent-primary" />
          <div>
            <p className="text-sm font-semibold">GCash</p>
            <p className="text-xs text-muted-foreground">Pay via GCash e-wallet</p>
          </div>
        </label>
      </section>

      <button disabled={busy} type="submit" className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
        {busy ? "Placing order…" : "Place Order"}
      </button>
    </form>
  );
}
