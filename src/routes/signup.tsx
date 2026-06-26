import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

// Step components
import { PersonalInfoStep } from "@/components/signup/PersonalInfoStep";
import { AddressStep } from "@/components/signup/AddressStep";
import { ContactLoginStep } from "@/components/signup/ContactLoginStep";
import { ProfilePictureStep } from "@/components/signup/ProfilePictureStep";
import { ReviewStep } from "@/components/signup/ReviewStep";

interface SignupData {
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
}

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [formData, setFormData] = useState<SignupData>({
    firstName: "",
    middleName: "",
    lastName: "",
    province: "",
    city: "",
    barangay: "",
    street: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    avatarUrl: "",
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (data: Partial<SignupData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          toast.error("First name and last name are required");
          return false;
        }
        return true;
      case 2:
        if (!formData.province.trim() || !formData.city.trim() || !formData.barangay.trim() || !formData.street.trim()) {
          toast.error("Please complete your address");
          return false;
        }
        return true;
      case 3:
        if (!formData.email.trim() || !formData.password.trim()) {
          toast.error("Email and password are required");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          return false;
        }
        if (formData.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          return false;
        }
        return true;
      case 4:
        // Avatar is optional
        return true;
      case 5:
        // Review step
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setBusy(true);
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            middle_name: formData.middleName,
            last_name: formData.lastName,
            account_type: "consumer",
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Failed to create user");
      }

      // Step 2: Update profile with additional data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.firstName,
          middle_name: formData.middleName || null,
          last_name: formData.lastName,
          province: formData.province,
          city: formData.city,
          barangay: formData.barangay,
          street: formData.street,
          phone: formData.phone || null,
          email: formData.email,
          avatar_url: formData.avatarUrl || null,
          name: `${formData.firstName} ${formData.lastName}`,
        })
        .eq("id", authData.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        // Don't throw - user is created, profile will be updated by trigger
      }

      toast.success("Account created successfully! Please check your email to verify.");
      
      // Redirect to login after short delay
      setTimeout(() => {
        navigate({ to: "/auth" });
      }, 2000);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create account");
      console.error("Signup error:", err);
    } finally {
      setBusy(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            firstName={formData.firstName}
            middleName={formData.middleName}
            lastName={formData.lastName}
            onChange={updateFormData}
          />
        );
      case 2:
        return (
          <AddressStep
            province={formData.province}
            city={formData.city}
            barangay={formData.barangay}
            street={formData.street}
            onChange={updateFormData}
          />
        );
      case 3:
        return (
          <ContactLoginStep
            email={formData.email}
            phone={formData.phone}
            password={formData.password}
            confirmPassword={formData.confirmPassword}
            onChange={updateFormData}
          />
        );
      case 4:
        return (
          <ProfilePictureStep
            avatarUrl={formData.avatarUrl}
            onChange={(avatarUrl: string) => updateFormData({ avatarUrl })}
          />
        );
      case 5:
        return <ReviewStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8 px-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Join MarketUp and start shopping wholesale
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        
        {/* Step Indicators */}
        <div className="flex justify-between">
          {["Personal", "Address", "Contact", "Photo", "Review"].map((label, idx) => (
            <div
              key={label}
              className={`flex flex-col items-center text-xs ${
                idx + 1 <= currentStep ? "text-primary font-semibold" : "text-gray-400"
              }`}
            >
              <div
                className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  idx + 1 < currentStep
                    ? "bg-primary text-white"
                    : idx + 1 === currentStep
                    ? "border-2 border-primary bg-primary/10"
                    : "border-2 border-gray-300"
                }`}
              >
                {idx + 1 < currentStep ? <Check className="h-3 w-3" /> : idx + 1}
              </div>
              <span className="hidden sm:block">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1 || busy}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {currentStep < totalSteps ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={busy}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#2563EB]/90"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={busy}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#2563EB]/90"
          >
            {busy ? "Creating Account..." : "Create Account"}
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Login Link */}
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button
          onClick={() => navigate({ to: "/auth" })}
          className="font-semibold text-[#2563EB] hover:underline"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}