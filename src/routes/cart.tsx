import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CheckCircle } from "lucide-react";
import { useMock } from "@/contexts/MockContext";
import { DELIVERY_FEE } from "@/lib/mockData";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  validateSearch: (search: Record<string, unknown>): { success?: boolean } => ({
    success: search.success === "true",
  }),
});

function CartPage() {
  const { cartItems, cartTotal, updateCartQty, removeFromCart } = useMock();
  const navigate = useNavigate();
  const search = useSearch({ from: "/cart" });
  const [showSuccess, setShowSuccess] = useState(false);

  // Show success message when returning from checkout
  useEffect(() => {
    if (search.success) {
      setShowSuccess(true);
      // Clear the success param from URL
      navigate({ to: "/cart", replace: true });
      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [search.success, navigate]);

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        {showSuccess && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-green-700 ring-1 ring-green-200">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Order placed successfully! 🎉</span>
          </div>
        )}
        <div className="rounded-full bg-gray-100 p-6">
          <ShoppingBag className="h-12 w-12 text-gray-300" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-800">Your cart is empty</h2>
        <p className="mt-1 text-sm text-gray-500">Browse products and add items to get started.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-28 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
        <span className="text-sm text-gray-500">{cartItems.reduce((s, c) => s + c.quantity, 0)} items</span>
      </div>

      <div className="space-y-3">
        {cartItems.map(({ product, quantity }) => (
          <div key={product.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <PackageIcon />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold text-gray-800">{product.name}</p>
              <p className="mt-1 text-sm font-bold text-emerald-600">₱{product.wholesale_price.toLocaleString()}</p>
              <p className="mt-0.5 text-xs text-green-600 font-medium">
                Subtotal: ₱{(product.wholesale_price * quantity).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => updateCartQty(product.id, quantity - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-7 text-center text-sm font-bold text-gray-800">{quantity}</span>
                <button
                  type="button"
                  onClick={() => updateCartQty(product.id, quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeFromCart(product.id)}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-semibold text-gray-800">₱{cartTotal.toLocaleString()}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-gray-500">Delivery fee</span>
          <span className="font-semibold text-gray-800">₱{DELIVERY_FEE}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-gray-100 pt-3">
          <span className="font-semibold text-gray-800">Total</span>
          <span className="text-lg font-bold text-emerald-600">₱{(cartTotal + DELIVERY_FEE).toLocaleString()}</span>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-gray-200 bg-white px-4 py-3 shadow-lg md:static md:border md:rounded-xl md:shadow-sm md:ring-1 md:ring-gray-100">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="hidden md:block">
            <span className="text-xs text-gray-500">Total</span>
            <div className="text-lg font-bold text-emerald-600">₱{(cartTotal + DELIVERY_FEE).toLocaleString()}</div>
          </div>
          <button
            onClick={() => navigate({ to: "/checkout" })}
            disabled={cartItems.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-50 md:w-auto"
          >
            Proceed to Checkout
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PackageIcon() {
  return <div className="flex h-full w-full items-center justify-center text-xl text-gray-300">📦</div>;
}
