import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/inventory")({
  component: AdminInventory,
});

type Product = { id: string; name: string; category: string | null; stock: number };

function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [threshold, setThreshold] = useState(10);
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: settings } = await supabase.from("app_settings").select("value").eq("key", "low_stock_threshold").maybeSingle();
    if (settings?.value) setThreshold(Number(settings.value));
    const { data } = await supabase.from("products").select("id,name,category,stock").order("stock");
    setProducts((data ?? []) as Product[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (id: string) => {
    const v = edits[id];
    if (v === undefined) return;
    const { error } = await supabase.from("products").update({ stock: v }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Stock updated");
    setEdits((e) => { const n = { ...e }; delete n[id]; return n; });
    load();
  };

  const saveThreshold = async () => {
    const { error } = await supabase.from("app_settings").update({ value: threshold }).eq("key", "low_stock_threshold");
    if (error) { toast.error(error.message); return; }
    toast.success("Threshold saved");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>

      <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <label className="text-sm font-medium">Low stock threshold:</label>
        <input type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-24 rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        <button onClick={saveThreshold} className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm text-white hover:bg-slate-800">Save</button>
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
            {loading && <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">Loading…</td></tr>}
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
                      <input type="number" defaultValue={p.stock} onChange={(e) => setEdits((eds) => ({ ...eds, [p.id]: Number(e.target.value) }))} className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm" />
                      <button onClick={() => save(p.id)} disabled={edits[p.id] === undefined} className="rounded-lg bg-slate-900 px-3 py-1 text-xs text-white hover:bg-slate-800 disabled:opacity-40">Save</button>
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
