interface ContactLoginStepProps {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  onChange: (data: { email: string; phone: string; password: string; confirmPassword: string }) => void;
}

export function ContactLoginStep({ email, phone, password, confirmPassword, onChange }: ContactLoginStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Contact & Login</h2>
        <p className="mt-1 text-sm text-gray-600">
          Create your login credentials
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Email Address / Username <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onChange({ email: e.target.value, phone, password, confirmPassword })}
            placeholder="your.email@gmail.com"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          />
          <p className="mt-1 text-xs text-gray-500">
            Use your Gmail or any email address
          </p>
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => onChange({ email, phone: e.target.value, password, confirmPassword })}
            placeholder="09XXXXXXXXX"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter your mobile number for order updates
          </p>
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => onChange({ email, phone, password: e.target.value, confirmPassword })}
            placeholder="At least 6 characters"
            required
            minLength={6}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => onChange({ email, phone, password, confirmPassword: e.target.value })}
            placeholder="Re-enter your password"
            required
            minLength={6}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          />
          {password && confirmPassword && password !== confirmPassword && (
            <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
          )}
        </div>
      </div>
    </div>
  );
}