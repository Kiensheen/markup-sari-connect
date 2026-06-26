import { User, MapPin, Mail, Camera } from "lucide-react";

interface ReviewStepProps {
  formData: {
    firstName: string;
    middleName: string;
    lastName: string;
    province: string;
    city: string;
    barangay: string;
    street: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    avatarUrl: string;
  };
}

export function ReviewStep({ formData }: ReviewStepProps) {
  const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + " " : ""}${formData.lastName}`;
  const fullAddress = `${formData.street}, ${formData.barangay}, ${formData.city}, ${formData.province}`;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Review Your Information</h2>
        <p className="mt-1 text-sm text-gray-600">
          Please verify all details before creating your account
        </p>
      </div>

      <div className="space-y-4">
        {/* Personal Information */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#2563EB]">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Personal Information</h3>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Name:</span> {fullName}</p>
                {formData.middleName && (
                  <p><span className="font-medium">Middle Name:</span> {formData.middleName}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#2563EB]">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Delivery Address</h3>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>{fullAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Login */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#2563EB]">
              <Mail className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Contact & Login</h3>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Email:</span> {formData.email}</p>
                <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                <p><span className="font-medium">Password:</span> ••••••••</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Picture */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#2563EB]">
              <Camera className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Profile Picture</h3>
              <div className="mt-2">
                {formData.avatarUrl ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={formData.avatarUrl}
                      alt="Profile preview"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <p className="text-sm text-gray-600">Photo uploaded</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No photo uploaded (you can add one later)</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Terms Notice */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            By clicking "Create Account", you agree to our Terms of Service and Privacy Policy. 
            You will receive a verification email at <span className="font-semibold">{formData.email}</span>.
          </p>
        </div>
      </div>
    </div>
  );
}