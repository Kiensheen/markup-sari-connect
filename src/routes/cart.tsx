import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useMock } from "@/contexts/MockContext";
import { DELIVERY_FEE } from "@/lib/mockData";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { cartItems, cartTotal, updateCartQty, removeFromCart } = useMock();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <p className="mt-2 text-sm text-muted-foreground">Browse products and add items to get started.</p>
        <Link to="/" className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Shop now</Link>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-4">
      <h1 className="text-2xl font-bold">Your Cart</h1>
      <div className="space-y-2">
        {cartItems.map(({ product, quantity }) => (
          <div key={product.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">📦</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold">{product.name}</p>
              <p className="text-sm font-bold text-primary">₱{product.wholesale_price.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Subtotal: ₱{(product.wholesale_price * quantity).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-0.5">
              <button type="button" onClick={() => updateCartQty(product.id, quantity - 1)} className="rounded-md p-1.5 hover:bg-muted"><Minus className="h-3.5 w-3.5" /></button>
              <span className="min-w-6 text-center text-sm font-semibold">{quantity}</span>
              <button type="button" onClick={() => updateCartQty(product.id, quantity + 1)} className="rounded-md p-1.5 hover:bg-muted"><Plus className="h-3.5 w-3.5" /></button>
            </div>
            <button type="button" onClick={() => removeFromCart(product.id)} className="rounded-md p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">₱{cartTotal.toLocaleString()}</span></div>
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery fee</span><span className="font-semibold">₱{DELIVERY_FEE}</span></div>
        <div className="mt-3 flex justify-between border-t border-border pt-3"><span className="font-semibold">Total</span><span className="text-lg font-bold text-primary">₱{(cartTotal + DELIVERY_FEE).toLocaleString()}</span></div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground">Total</span>
            <div className="text-lg font-bold text-primary">₱{(cartTotal + DELIVERY_FEE).toLocaleString()}</div>
          </div>
          <button
            onClick={() => navigate({ to: "/checkout" })}
            className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
