import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMock } from "@/contexts/MockContext";
import { toast } from "sonner";
import { AlertTriangle, Boxes, PackageX, CheckCircle2, Save, Settings2 } from "lucide-react";

export const Route = createFileRoute("/admin/inventory")({
  component: AdminInventory,
});

function AdminInventory() {
  const { products, updateProduct } = useMock();
  const [threshold, setThreshold] = useState(10);
  const [edits, setEdits] = useState<Record<string, number>>({});

  const summary = useMemo(() => {
    const totalUnits = products.reduce((s, p) => s + p.stock, 0);
    const low = products.filter((p) => p.stock > 0 && p.stock < threshold).length;
    const out = products.filter((p) => p.stock === 0).length;
    return { totalUnits, low, out };
  }, [products, threshold]);

  const save = (id: string) => {
    const v = edits[id];
    if (v === undefined) return;
    const product = products.find((p) => p.id === id);
    if (!product) return;
    updateProduct({ ...product, stock: v });
    toast.success("Stock updated");
    setEdits((e) => {
      const n = { ...e };
      delete n[id];
      return n;
    });
  };

  const summaryCards = [
    { label: "Product SKUs", value: String(products.length), icon: Boxes, tint: "from-blue-500 to-blue-600" },
    { label: "Total units", value: summary.totalUnits.toLocaleString(), icon: CheckCircle2, tint: "from-emerald-500 to-teal-600" },
    { label: "Low stock", value: String(summary.low), icon: AlertTriangle, tint: "from-amber-500 to-orange-500" },
    { label: "Out of stock", value: String(summary.out), icon: PackageX, tint: "from-red-500 to-rose-600" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Inventory</h2>
        <p className="text-sm text-slate-500">Manage stock levels across your catalog</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${c.tint} text-white shadow-sm`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-800">{c.value}</div>
                <div className="text-xs font-medium text-slate-500">{c.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Threshold */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <Settings2 className="h-5 w-5 text-blue-600" />
        <label className="text-sm font-medium text-slate-700">Low stock threshold:</label>
        <input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-24 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        />
        <span className="text-xs text-slate-400">Products at or below this are flagged in yellow.</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Update</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const low = p.stock < threshold;
                const out = p.stock === 0;
                return (
                  <tr key={p.id} className={`border-t border-slate-100 ${out ? "bg-red-50/60" : low ? "bg-amber-50/60" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-medium text-slate-800">
                        {(out || low) && <AlertTriangle className={`h-4 w-4 shrink-0 ${out ? "text-red-600" : "text-amber-600"}`} />}
                        <span className={out ? "text-red-700" : low ? "text-amber-700" : ""}>{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.category || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        out ? "bg-red-100 text-red-700" : low ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          defaultValue={p.stock}
                          onChange={(e) => setEdits((eds) => ({ ...eds, [p.id]: Number(e.target.value) }))}
                          className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                        />
                        <button
                          onClick={() => save(p.id)}
                          disabled={edits[p.id] === undefined}
                          className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40"
                        >
                          <Save className="h-3 w-3" /> Save
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
