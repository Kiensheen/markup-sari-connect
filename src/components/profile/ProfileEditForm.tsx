import { useState } from "react";
import { Check, Clock, Store, User as UserIcon, X } from "lucide-react";
import { toast } from "sonner";

export interface ProfileEditValues {
  name: string;
  email: string;
  phone: string;
  store_name: string | null;
  store_hours: string | null;
}

interface ProfileEditFormProps {
  initial: ProfileEditValues;
  saving?: boolean;
  onSave: (data: ProfileEditValues) => void;
  onCancel: () => void;
}

export function ProfileEditForm({ initial, saving, onSave, onCancel }: ProfileEditFormProps) {
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [storeName, setStoreName] = useState(initial.store_name ?? "");
  const [storeHours, setStoreHours] = useState(initial.store_hours ?? "");

  const handleSave = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    onSave({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      store_name: storeName.trim() || null,
      store_hours: storeHours.trim() || null,
    });
  };

  const inputCls =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-400";
  const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500";

  return (
    <section className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
          <UserIcon className="h-4 w-4 text-emerald-600" /> Personal information
        </h2>
        <div className="space-y-3">
          <label className="block">
            <span className={labelCls}>Full name</span>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={labelCls}>Email</span>
              <input
                type="email"
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
              />
            </label>
            <label className="block">
              <span className={labelCls}>Phone number</span>
              <input
                type="tel"
                className={inputCls}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
          <Store className="h-4 w-4 text-green-600" /> Store information
        </h2>
        <div className="space-y-3">
          <label className="block">
            <span className={labelCls}>Store name (optional)</span>
            <input
              className={inputCls}
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g., Maria's Sari-Sari Store"
            />
          </label>
          <label className="block">
            <span className={labelCls}>Store hours (optional)</span>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                className={`${inputCls} pl-9`}
                value={storeHours}
                onChange={(e) => setStoreHours(e.target.value)}
                placeholder="e.g., 8:00 AM – 8:00 PM"
              />
            </div>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-60 active:scale-[0.98]"
        >
          <Check className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </section>
  );
}
