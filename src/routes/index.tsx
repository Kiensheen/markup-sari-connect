import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Package, Plus, Search } from "lucide-react";
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
  const { products, addToCart } = useMock();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const filtered = useMemo(() => products.filter((p) => {
    const matchQ = !q || p.name.toLowerCase().includes(q.toLowerCase());
    const matchC = cat === "All" || p.category === cat;
    return matchQ && matchC;
  }), [products, q, cat]);

  const handleAdd = (p: typeof products[0]) => {
    addToCart(p);
    toast.success(`${p.name} added to cart`);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-sm">
        <h1 className="text-2xl font-bold leading-tight">Wholesale made simple</h1>
        <p className="mt-1 text-sm text-primary-foreground/90">Best prices. Fast delivery. Earn points on every order.</p>
      </section>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
        {PRODUCT_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              cat === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary/40"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {filtered.map((p) => (
          <div key={p.id} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md">
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-muted">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
              ) : (
                <Package className="h-10 w-10 text-muted-foreground/40" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-3">
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{p.name}</h3>
              <div className="mt-auto">
                <div className="text-xs text-muted-foreground">Wholesale</div>
                <div className="text-base font-bold text-primary">₱{Number(p.wholesale_price).toLocaleString()}</div>
              </div>
              <button
                onClick={() => handleAdd(p)}
                disabled={p.stock <= 0}
                className="flex items-center justify-center gap-1 rounded-lg bg-primary px-2 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" /> Add to Cart
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">No products found.</p>
        )}
      </div>
    </div>
  );
}
