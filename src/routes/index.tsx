import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Package, Plus, Minus, Search, Tag, AlertTriangle } from "lucide-react";
import { useMock } from "@/contexts/MockContext";
import { PRODUCT_CATEGORIES } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MarketUp — Shop wholesale" },
      { name: "description", content: "Browse wholesale goods for your sari-sari store at the best prices." },
    ],
  }),
  component: Index,
});

function Index() {
  const { products, addToCart, cartItems, updateCartQty, removeFromCart } = useMock();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const getQty = (productId: string) => {
    const item = cartItems.find((c) => c.product.id === productId);
    return item?.quantity ?? 0;
  };

  const filtered = useMemo(() => products.filter((p) => {
    const matchQ = !q || p.name.toLowerCase().includes(q.toLowerCase());
    const matchC = cat === "All" || p.category === cat;
    return matchQ && matchC;
  }), [products, q, cat]);

  const handleIncrement = (p: (typeof products)[0]) => {
    addToCart(p);
    toast.success(`${p.name} added to cart`);
  };

  const handleDecrement = (productId: string) => {
    const qty = getQty(productId);
    if (qty <= 1) {
      removeFromCart(productId);
      toast.success("Removed from cart");
    } else {
      updateCartQty(productId, qty - 1);
    }
  };

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 p-5 text-white shadow-md">
        <div className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-tight">Wholesale made simple</h1>
            <p className="mt-1 text-sm text-emerald-100">Best prices. Fast delivery. Earn points on every order.</p>
          </div>
          <div className="hidden rounded-xl bg-white/20 p-3 backdrop-blur-sm sm:block">
            <Package className="h-8 w-8 text-white" />
          </div>
        </div>
      </section>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products, brands, categories..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm outline-none shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div className="sticky top-14 z-20 -mx-4 bg-gray-50 px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
          {PRODUCT_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                cat === c
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-600 shadow-sm"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {filtered.map((p) => {
          const qty = getQty(p.id);
          const savings = p.price - p.wholesale_price;
          const isLowStock = p.stock > 0 && p.stock <= 10;
          return (
            <div key={p.id} className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:shadow-md">
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-gray-50">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                ) : (
                  <Package className="h-10 w-10 text-gray-300" />
                )}
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                  <Tag className="h-3 w-3" />
                  Wholesale
                </span>
                {p.stock <= 0 && (
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                    <AlertTriangle className="h-3 w-3" />
                    Out of Stock
                  </span>
                )}
                {isLowStock && p.stock > 0 && (
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                    Low Stock
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-3">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800">{p.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-emerald-600">₱{Number(p.wholesale_price).toLocaleString()}</span>
                  <span className="text-xs text-gray-400 line-through">₱{Number(p.price).toLocaleString()}</span>
                </div>
                {savings > 0 && (
                  <span className="text-[11px] font-medium text-green-600">
                    Save ₱{savings.toLocaleString()}
                  </span>
                )}
                <div className="mt-auto pt-1">
                  {p.stock <= 0 ? (
                    <button disabled className="flex w-full items-center justify-center gap-1 rounded-lg bg-red-50 px-2 py-2.5 text-xs font-semibold text-red-500">
                      Out of Stock
                    </button>
                  ) : qty === 0 ? (
                    <button
                      onClick={() => handleIncrement(p)}
                      className="flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add to Cart
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-1.5 shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleDecrement(p.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-bold text-gray-800">{qty}</span>
                      <button
                        type="button"
                        onClick={() => handleIncrement(p)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors active:scale-95"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-gray-500">No products found. Try a different search or category.</p>
        )}
      </div>
    </div>
  );
}
