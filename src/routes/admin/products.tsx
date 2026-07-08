import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMock } from "@/contexts/MockContext";
import { peso } from "@/lib/mockData";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

const CATEGORIES = ["Soft Drinks", "Snacks", "Rice", "Canned Goods", "Dairy", "Other"];

function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useMock();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [editing, setEditing] = useState<Partial<typeof products[0]> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return products.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (!s) return true;
      return p.name.toLowerCase().includes(s) || (p.category?.toLowerCase().includes(s) ?? false);
    });
  }, [products, search, cat]);

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
    toast.success("Saved");
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

  const inp = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={() => setEditing({})} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" className="flex-1 outline-none bg-transparent" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Wholesale</th>
              <th className="px-4 py-3">Retail</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  {p.image_url ? <img src={p.image_url} alt="" className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-slate-100" />}
                </td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-slate-500">{p.category || "—"}</td>
                <td className="px-4 py-3">{peso(p.wholesale_price)}</td>
                <td className="px-4 py-3">{peso(p.price)}</td>
                <td className="px-4 py-3"><span className={p.stock === 0 ? "text-red-600 font-medium" : p.stock < 10 ? "text-yellow-600 font-medium" : ""}>{p.stock}</span></td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => setEditing(p)} className="text-blue-600 hover:text-blue-800"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteId(p.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">No products</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-0 md:p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-lg rounded-t-2xl md:rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editing.id ? "Edit product" : "New product"}</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>
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
                <Field label="Wholesale price"><input type="number" step="0.01" className={inp} value={editing.wholesale_price ?? ""} onChange={(e) => setEditing({ ...editing, wholesale_price: Number(e.target.value) })} /></Field>
                <Field label="Retail price"><input type="number" step="0.01" className={inp} value={editing.price ?? ""} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></Field>
              </div>
              <Field label="Stock"><input type="number" className={inp} value={editing.stock ?? ""} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} /></Field>
              <Field label="Image URL"><input className={inp} value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} /></Field>
              <button onClick={save} className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90">Save</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete product?"
        description="This action cannot be undone. The product will be permanently removed."
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
      <span className="text-xs uppercase text-slate-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
