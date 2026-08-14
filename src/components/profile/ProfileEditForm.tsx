import { useState } from "react";
import { Check, Clock, Store, User as UserIcon, X, MapPin, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export interface ProfileEditValues {
  first_name: string;
  middle_name: string | null;
  last_name: string;
  age: number | null;
  shopee_handle: string | null;
  lazada_handle: string | null;
  email: string;
  phone: string;
  address: string;
  store_name: string | null;
  store_hours: string | null;
  name: string;
}

interface ProfileEditFormProps {
  initial: ProfileEditValues;
  saving?: boolean;
  onSave: (data: ProfileEditValues) => void;
  onCancel: () => void;
}

export function ProfileEditForm({ initial, saving, onSave, onCancel }: ProfileEditFormProps) {
  const [firstName, setFirstName] = useState(initial.first_name);
  const [middleName, setMiddleName] = useState(initial.middle_name ?? "");
  const [lastName, setLastName] = useState(initial.last_name);
  const [age, setAge] = useState(initial.age?.toString() ?? "");
  const [shopeeHandle, setShopeeHandle] = useState(initial.shopee_handle ?? "");
  const [lazadaHandle, setLazadaHandle] = useState(initial.lazada_handle ?? "");
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [address, setAddress] = useState(initial.address);
  const [storeName, setStoreName] = useState(initial.store_name ?? "");
  const [storeHours, setStoreHours] = useState(initial.store_hours ?? "");

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      toast.error("First name, surname, and phone are required");
      return;
    }
    const trimmedMiddle = middleName.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const computedName = [trimmedFirstName, trimmedMiddle, trimmedLastName]
      .filter(Boolean)
      .join(" ");
    const ageNum = age.trim() ? Number(age.trim()) : null;
    if (age.trim() && (Number.isNaN(ageNum) || ageNum! < 0 || ageNum! > 130)) {
      toast.error("Please enter a valid age");
      return;
    }
    onSave({
      first_name: trimmedFirstName,
      middle_name: trimmedMiddle || null,
      last_name: trimmedLastName,
      age: ageNum,
      shopee_handle: shopeeHandle.trim() || null,
      lazada_handle: lazadaHandle.trim() || null,
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      store_name: storeName.trim() || null,
      store_hours: storeHours.trim() || null,
      name: computedName,
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={labelCls}>First name</span>
              <input
                className={inputCls}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </label>
            <label className="block">
              <span className={labelCls}>Middle name (optional)</span>
              <input
                className={inputCls}
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Middle name"
              />
            </label>
            <label className="block">
              <span className={labelCls}>Surname / last name</span>
              <input
                className={inputCls}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Surname"
              />
            </label>
            <label className="block">
              <span className={labelCls}>Age (optional)</span>
              <input
                type="number"
                min={0}
                max={130}
                className={inputCls}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 35"
              />
            </label>
          </div>
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
          <ShoppingBag className="h-4 w-4 text-emerald-600" /> Other platforms (optional)
        </h2>
        <div className="space-y-3">
          <label className="block">
            <span className={labelCls}>Shopee handle / store link</span>
            <input
              className={inputCls}
              value={shopeeHandle}
              onChange={(e) => setShopeeHandle(e.target.value)}
              placeholder="e.g., shopee.ph/mystore"
            />
          </label>
          <label className="block">
            <span className={labelCls}>Lazada handle / store link</span>
            <input
              className={inputCls}
              value={lazadaHandle}
              onChange={(e) => setLazadaHandle(e.target.value)}
              placeholder="e.g., lazada.com.ph/shop/mystore"
            />
          </label>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
          <MapPin className="h-4 w-4 text-emerald-600" /> Address
        </h2>
        <label className="block">
          <span className={labelCls}>Delivery address</span>
          <textarea
            rows={3}
            className={inputCls}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="House/Unit No., Street, Barangay, City, Province"
          />
        </label>
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
