import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Package, Plus, Minus, Search, Tag, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 8;

  const getQty = (productId: string) => {
    const item = cartItems.find((c) => c.product.id === productId);
    return item?.quantity ?? 0;
  };

  const filtered = useMemo(() => products.filter((p) => {
    const matchQ = !q || p.name.toLowerCase().includes(q.toLowerCase());
    const matchC = cat === "All" || p.category === cat;
    return matchQ && matchC;
  }), [products, q, cat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Search products, brands, categories..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm outline-none shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div className="sticky top-14 z-20 -mx-4 bg-gray-50 px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
          {PRODUCT_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => { setCat(c); setPage(1); }}
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

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {pageItems.map((p) => {
          const qty = getQty(p.id);
          const isLowStock = p.stock > 0 && p.stock <= 10;
          return (
            <div key={p.id} className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:shadow-md">
              <div className="relative flex h-24 w-full items-center justify-center overflow-hidden bg-gray-50">
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
              <div className="flex flex-1 flex-col gap-1 p-2">
                <h3 className="line-clamp-2 text-[11px] font-medium leading-tight text-gray-800">{p.name}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-emerald-600">₱{Number(p.wholesale_price).toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 line-through">₱{Number(p.price).toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-gray-500">Stock: {p.stock}</div>
                <div className="mt-auto pt-0.5">
                  {p.stock <= 0 ? (
                    <button disabled className="flex w-full items-center justify-center gap-1 rounded-lg bg-red-50 px-2 py-2 text-xs font-semibold text-red-500">
                      Out of Stock
                    </button>
                  ) : qty === 0 ? (
                    <button
                      onClick={() => handleIncrement(p)}
                      className="flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add to Cart
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white py-1 shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleDecrement(p.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-7 text-center text-[11px] font-bold text-gray-800">{qty}</span>
                      <button
                        type="button"
                        onClick={() => handleIncrement(p)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors active:scale-95"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-medium text-gray-500">
            {safePage} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
