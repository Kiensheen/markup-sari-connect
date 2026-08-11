import { useState } from "react";
import { MapPin, X } from "lucide-react";
import { toast } from "sonner";

export interface NewAddressInput {
  label: string;
  address: string;
  phone?: string;
}

interface AddAddressModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: NewAddressInput) => void;
}

export function AddAddressModal({ open, onClose, onSave }: AddAddressModalProps) {
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  if (!open) return null;

  const reset = () => {
    setLabel("");
    setAddress("");
    setPhone("");
  };

  const handleSave = () => {
    if (!label.trim() || !address.trim()) {
      toast.error("Label and address are required");
      return;
    }
    onSave({ label: label.trim(), address: address.trim(), phone: phone.trim() || undefined });
    reset();
  };

  const inputCls =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400";
  const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 md:items-center md:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-white p-6 md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Add new address</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-gray-400 transition hover:text-gray-600" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className={labelCls}>Label</span>
            <input
              className={inputCls}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Home, Store, Warehouse"
            />
          </label>
          <label className="block">
            <span className={labelCls}>Full address</span>
            <textarea
              rows={3}
              className={inputCls}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/Unit No., Street, Barangay, City, Province"
            />
          </label>
          <label className="block">
            <span className={labelCls}>Phone (optional)</span>
            <input
              type="tel"
              className={inputCls}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contact number"
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 active:scale-[0.98]"
            >
              Save address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
