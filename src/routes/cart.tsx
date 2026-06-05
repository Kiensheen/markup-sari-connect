import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { DELIVERY_FEE } from "@/lib/constants";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <p className="mt-2 text-sm text-muted-foreground">Browse products and add items to get started.</p>
        <Link to="/" className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Shop now</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Your Cart</h1>
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
              {i.image_url ? (
                <img src={i.image_url} alt={i.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground">No img</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold">{i.name}</p>
              <p className="text-sm font-bold text-primary">₱{i.price.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-0.5">
              <button type="button" onClick={() => setQty(i.id, i.quantity - 1)} className="rounded-md p-1.5 hover:bg-muted"><Minus className="h-3.5 w-3.5" /></button>
              <span className="min-w-6 text-center text-sm font-semibold">{i.quantity}</span>
              <button type="button" onClick={() => setQty(i.id, i.quantity + 1)} className="rounded-md p-1.5 hover:bg-muted"><Plus className="h-3.5 w-3.5" /></button>
            </div>
            <button type="button" onClick={() => remove(i.id)} className="rounded-md p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">₱{total.toLocaleString()}</span></div>
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery fee</span><span className="font-semibold">₱{DELIVERY_FEE}</span></div>
        <div className="mt-3 flex justify-between border-t border-border pt-3"><span className="font-semibold">Total</span><span className="text-lg font-bold text-primary">₱{(total + DELIVERY_FEE).toLocaleString()}</span></div>
      </div>

      <Link to="/checkout" className="block w-full rounded-lg bg-primary py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90">
        Proceed to Checkout
      </Link>
    </div>
  );
}
