import { MapPin, Phone, Plus, Star, Trash2 } from "lucide-react";
import type { SavedAddress } from "@/lib/mockData";

interface AddressesCardProps {
  addresses: SavedAddress[];
  onAdd: () => void;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AddressesCard({ addresses, onAdd, onSetDefault, onDelete }: AddressesCardProps) {
  return (
    <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800">
          <MapPin className="h-4 w-4 text-blue-600" /> Saved addresses
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">
            {addresses.length}
          </span>
        </h2>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" /> Add New
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {addresses.length === 0 && (
          <p className="px-5 py-6 text-center text-sm text-gray-500">
            No saved addresses yet. Add one for faster checkout.
          </p>
        )}
        {addresses.map((a) => (
          <div key={a.id} className="flex items-start gap-3 px-5 py-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                a.is_default ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
              }`}
            >
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">{a.label}</span>
                {a.is_default && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                    DEFAULT
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-gray-600">{a.address}</p>
              {a.phone && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                  <Phone className="h-3 w-3" /> {a.phone}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              {!a.is_default && (
                <button
                  type="button"
                  onClick={() => onSetDefault(a.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-green-200 px-2.5 py-1 text-[11px] font-semibold text-green-700 transition hover:bg-green-50"
                >
                  <Star className="h-3 w-3" /> Set default
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete(a.id)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 transition hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
