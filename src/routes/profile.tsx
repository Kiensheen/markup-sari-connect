import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Award, Gift, HelpCircle, ChevronRight, FileText, Settings, X } from "lucide-react";
import { useMock } from "@/contexts/MockContext";
import { toast } from "sonner";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileEditForm, type ProfileEditValues } from "@/components/profile/ProfileEditForm";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

const REDEEM_COST = 500;
const REDEEM_NAME = "₱50 off coupon";
const REDEEM_VALUE = 50;

const menuItems = [
  {
    icon: Settings,
    label: "Settings",
    color: "text-gray-600",
    bg: "bg-gray-100",
    to: "/settings" as const,
  },
  {
    icon: HelpCircle,
    label: "Help & Support",
    color: "text-gray-600",
    bg: "bg-gray-100",
    to: "/support" as const,
  },
  {
    icon: FileText,
    label: "Terms of Service",
    color: "text-blue-600",
    bg: "bg-blue-50",
    to: "/terms" as const,
  },
];

function ProfilePage() {
  const { currentUser, updateUserProfile, adjustPoints } = useMock();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const handlePhotoSelected = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateUserProfile(currentUser.id, { avatar_url: reader.result as string });
      toast.success("Profile photo updated");
    };
    reader.onerror = () => toast.error("Could not read image");
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    updateUserProfile(currentUser.id, { avatar_url: null });
    toast.success("Profile photo removed");
  };

  const handleSaveProfile = (data: ProfileEditValues) => {
    setSaving(true);
    updateUserProfile(currentUser.id, data);
    setSaving(false);
    setIsEditing(false);
    toast.success("Profile updated");
  };

  const handleRedeem = () => {
    if (currentUser.points < REDEEM_COST) {
      toast.error("Not enough points");
      return;
    }
    setRedeeming(true);
    adjustPoints(currentUser.id, -REDEEM_COST);
    setRedeeming(false);
    toast.success(`Redeemed ${REDEEM_NAME}!`);
    setRedeemOpen(false);
  };

  return (
    <div className="space-y-5">
      <ProfileHeader
        user={currentUser}
        isEditing={isEditing}
        onEditToggle={() => setIsEditing((v) => !v)}
        onPhotoSelected={handlePhotoSelected}
        onRemovePhoto={handleRemovePhoto}
      />

      {isEditing && (
        <ProfileEditForm
          saving={saving}
          initial={{
            first_name: currentUser.first_name ?? "",
            middle_name: currentUser.middle_name ?? "",
            last_name: currentUser.last_name ?? "",
            age: currentUser.age ?? null,
            shopee_handle: currentUser.shopee_handle ?? "",
            lazada_handle: currentUser.lazada_handle ?? "",
            email: currentUser.email,
            phone: currentUser.phone,
            address: currentUser.address,
            store_name: currentUser.store_name ?? "",
            store_hours: currentUser.store_hours ?? "",
            name: currentUser.name,
          }}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
        />
      )}

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 p-5 text-white shadow-md">
        <div className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-emerald-100">
              <Award className="h-4 w-4" /> Points Balance
            </div>
            <p className="mt-1 text-4xl font-bold">{currentUser.points.toLocaleString()}</p>
            <p className="mt-1 text-xs text-emerald-100">Earn 1 point for every ₱100 spent</p>
          </div>
          <button
            type="button"
            onClick={() => setRedeemOpen(true)}
            disabled={currentUser.points < REDEEM_COST}
            className="rounded-xl bg-white/20 px-5 py-3 text-sm font-semibold backdrop-blur-sm transition-all hover:bg-white/30 disabled:opacity-50 active:scale-95"
          >
            <Gift className="mr-1.5 inline h-4 w-4" />
            Redeem
          </button>
        </div>
      </div>

      <section className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link
              key={i}
              to={item.to}
              className="flex w-full items-center gap-3 p-4 text-left text-sm transition hover:bg-gray-50"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.bg}`}>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <span className="flex-1 font-medium text-gray-700">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </Link>
          );
        })}
      </section>

      {redeemOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 md:items-center md:p-4"
          onClick={() => setRedeemOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl bg-white p-6 md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Redeem points</h2>
              <button type="button" onClick={() => setRedeemOpen(false)} aria-label="Close">
                <X className="h-5 w-5 text-gray-400 transition hover:text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Exchange your points for discounts on future orders.
            </p>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="rounded-lg bg-green-100 p-2 text-green-600">
                <Gift className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{REDEEM_NAME}</p>
                <p className="text-sm text-gray-500">
                  {REDEEM_COST} points = ₱{REDEEM_VALUE} off
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Your balance:{" "}
              <span className="font-semibold text-gray-800">
                {currentUser.points.toLocaleString()} pts
              </span>
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setRedeemOpen(false)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRedeem}
                disabled={redeeming || currentUser.points < REDEEM_COST}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {redeeming ? "Redeeming..." : "Confirm redeem"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

