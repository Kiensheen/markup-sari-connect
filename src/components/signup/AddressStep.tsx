interface AddressStepProps {
  province: string;
  city: string;
  barangay: string;
  street: string;
  onChange: (data: { province: string; city: string; barangay: string; street: string }) => void;
}

export function AddressStep({ province, city, barangay, street, onChange }: AddressStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
        <p className="mt-1 text-sm text-gray-600">
          Where should we deliver your orders?
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="province" className="mb-1.5 block text-sm font-medium text-gray-700">
            Province <span className="text-red-500">*</span>
          </label>
          <input
            id="province"
            type="text"
            value={province}
            onChange={(e) => onChange({ province: e.target.value, city, barangay, street })}
            placeholder="Metro Manila"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          />
        </div>

        <div>
          <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-gray-700">
            City/Municipality <span className="text-red-500">*</span>
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => onChange({ province, city: e.target.value, barangay, street })}
            placeholder="Quezon City"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          />
        </div>

        <div>
          <label htmlFor="barangay" className="mb-1.5 block text-sm font-medium text-gray-700">
            Barangay <span className="text-red-500">*</span>
          </label>
          <input
            id="barangay"
            type="text"
            value={barangay}
            onChange={(e) => onChange({ province, city, barangay: e.target.value, street })}
            placeholder="Kamuning"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          />
        </div>

        <div>
          <label htmlFor="street" className="mb-1.5 block text-sm font-medium text-gray-700">
            Street No./Block No./House No. <span className="text-red-500">*</span>
          </label>
          <input
            id="street"
            type="text"
            value={street}
            onChange={(e) => onChange({ province, city, barangay, street: e.target.value })}
            placeholder="123 Main St, Block 4, Lot 5"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          />
        </div>
      </div>
    </div>
  );
}