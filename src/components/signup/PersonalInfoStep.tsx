interface PersonalInfoStepProps {
  firstName: string;
  middleName: string;
  lastName: string;
  onChange: (data: { firstName: string; middleName: string; lastName: string }) => void;
}

export function PersonalInfoStep({ firstName, middleName, lastName, onChange }: PersonalInfoStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
        <p className="mt-1 text-sm text-gray-600">
          Tell us your name
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-gray-700">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => onChange({ firstName: e.target.value, middleName, lastName })}
            placeholder="Juan"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          />
        </div>

        <div>
          <label htmlFor="middleName" className="mb-1.5 block text-sm font-medium text-gray-700">
            Middle Name <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="middleName"
            type="text"
            value={middleName}
            onChange={(e) => onChange({ firstName, middleName: e.target.value, lastName })}
            placeholder="Dela"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-gray-700">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => onChange({ firstName, middleName, lastName: e.target.value })}
            placeholder="Cruz"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          />
        </div>
      </div>
    </div>
  );
}