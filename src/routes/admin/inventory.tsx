import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMock } from "@/contexts/MockContext";
import { toast } from "sonner";
import { AlertTriangle, Save } from "lucide-react";

export const Route = createFileRoute("/admin/inventory")({
  component: AdminInventory,
});

function AdminInventory() {
  const { products, updateProduct } = useMock();
  const [threshold, setThreshold] = useState(10);
  const [edits, setEdits] = useState<Record<string, number>>({});

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>

      <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <label className="text-sm font-medium">Low stock threshold:</label>
        <input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-24 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Update</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const low = p.stock < threshold;
              const out = p.stock === 0;
              return (
                <tr key={p.id} className={`border-t border-slate-100 ${out ? "bg-red-50" : low ? "bg-yellow-50" : ""}`}>
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    {(out || low) && <AlertTriangle className={`h-4 w-4 ${out ? "text-red-600" : "text-yellow-600"}`} />}
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.category || "—"}</td>
                  <td className="px-4 py-3 font-semibold">{p.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        defaultValue={p.stock}
                        onChange={(e) => setEdits((eds) => ({ ...eds, [p.id]: Number(e.target.value) }))}
                        className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() => save(p.id)}
                        disabled={edits[p.id] === undefined}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1 text-xs text-white hover:bg-slate-800 disabled:opacity-40"
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
  );
}
