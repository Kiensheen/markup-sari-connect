import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMock } from "@/contexts/MockContext";
import { peso, PRODUCT_CATEGORIES } from "@/lib/mockData";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

const CATEGORIES = PRODUCT_CATEGORIES.filter((c) => c !== "All");
const PAGE_SIZE = 10;

function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useMock();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [editing, setEditing] = useState<Partial<(typeof products)[0]> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    const list = products.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (!s) return true;
      return p.name.toLowerCase().includes(s) || (p.category?.toLowerCase().includes(s) ?? false);
    });
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [products, search, cat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const stockBadge = (stock: number) => {
    if (stock === 0) return <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Out of stock</span>;
    if (stock < 10) return <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">{stock} low</span>;
    return <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">{stock} in stock</span>;
  };

  const save = () => {
    if (!editing) return;
    const payload = {
      name: editing.name ?? "",
      description: editing.description ?? null,
      price: Number(editing.price ?? 0),
      wholesale_price: Number(editing.wholesale_price ?? 0),
      stock: Number(editing.stock ?? 0),
      category: editing.category ?? null,
      image_url: editing.image_url ?? null,
    };
    if (!payload.name) { toast.error("Name required"); return; }
    if (editing.id) {
      updateProduct({ ...payload, id: editing.id });
    } else {
      addProduct(payload);
    }
    toast.success(editing.id ? "Product updated" : "Product added");
    setEditing(null);
  };

  const remove = () => {
    if (!deleteId) return;
    setDeleting(true);
    deleteProduct(deleteId);
    setDeleting(false);
    toast.success("Product deleted");
    setDeleteId(null);
  };

  const inp = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Products</h2>
          <p className="text-sm text-slate-500">{filtered.length} product{filtered.length === 1 ? "" : "s"} in catalog</p>
        </div>
        <button
          onClick={() => { setEditing({}); }}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={cat} onChange={(e) => { setCat(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30">
          <Search className="h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search products" className="flex-1 bg-transparent outline-none" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Wholesale</th>
                <th className="px-4 py-3 font-semibold">Retail</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 transition-colors hover:bg-blue-50/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><Package className="h-5 w-5" /></div>
                      )}
                      <div>
                        <div className="font-medium text-slate-800">{p.name}</div>
                        {p.description && <div className="text-xs text-slate-400 line-clamp-1">{p.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.category || "—"}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{peso(p.wholesale_price)}</td>
                  <td className="px-4 py-3 text-slate-700">{peso(p.price)}</td>
                  <td className="px-4 py-3">{stockBadge(p.stock)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => setEditing(p)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(p.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!pageItems.length && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <span className="text-xs text-slate-500">Page {safePage} of {totalPages} · {filtered.length} results</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / edit dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <Field label="Name"><input className={inp} value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
              <Field label="Description"><textarea className={inp} rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
              <Field label="Category">
                <select className={inp} value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                  <option value="">—</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Wholesale price (₱)"><input type="number" step="0.01" className={inp} value={editing.wholesale_price ?? ""} onChange={(e) => setEditing({ ...editing, wholesale_price: Number(e.target.value) })} /></Field>
                <Field label="Retail price (₱)"><input type="number" step="0.01" className={inp} value={editing.price ?? ""} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></Field>
              </div>
              <Field label="Stock"><input type="number" className={inp} value={editing.stock ?? ""} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} /></Field>
              <Field label="Image URL"><input className={inp} value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} /></Field>
            </div>
          )}
          <DialogFooter>
            <DialogClose>
              <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">Cancel</button>
            </DialogClose>
            <button onClick={save} className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-transform hover:scale-[1.02]">
              Save product
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete product?"
        description="This action cannot be undone. The product will be permanently removed from the catalog."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={remove}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}
