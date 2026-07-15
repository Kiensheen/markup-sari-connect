import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Award,
  Gift,
  User as UserIcon,
  Package,
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  ChevronRight,
  LogOut,
  Edit3,
} from "lucide-react";
import { useMock } from "@/contexts/MockContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

const REDEEM_COST = 500;
const REDEEM_NAME = "₱50 off coupon";
const REDEEM_VALUE = 50;

const menuItems = [
  { icon: Package, label: "My Orders", href: "/orders", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: MapPin, label: "Saved Addresses", href: "#", color: "text-green-600", bg: "bg-green-50" },
  { icon: CreditCard, label: "Payment Methods", href: "#", color: "text-purple-600", bg: "bg-purple-50" },
  { icon: Bell, label: "Notifications", href: "#", color: "text-amber-600", bg: "bg-amber-50" },
  { icon: HelpCircle, label: "Help & Support", href: "#", color: "text-gray-600", bg: "bg-gray-100" },
];

function ProfilePage() {
  const { currentUser, updateUserProfile, adjustPoints } = useMock();
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);

  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone);
  const [editAddress, setEditAddress] = useState(currentUser.address);

  const txns = [
    { id: 't1', source: 'Order #o1 completed', points_earned: 2, points_redeemed: 0, created_at: '2026-07-01T10:00:00Z' },
    { id: 't2', source: 'Order #o3 completed', points_earned: 2, points_redeemed: 0, created_at: '2026-07-03T09:15:00Z' },
    { id: 't3', source: 'Signup bonus', points_earned: 50, points_redeemed: 0, created_at: '2026-01-15T08:00:00Z' },
  ];

  const saveProfile = () => {
    if (!editName.trim() || !editPhone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    setSaveBusy(true);
    updateUserProfile(currentUser.id, { name: editName.trim(), phone: editPhone.trim(), address: editAddress.trim() });
    setSaveBusy(false);
    toast.success("Profile updated");
    setEditMode(false);
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white shadow-md">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10" />
        <div className="absolute bottom-0 left-1/2 h-24 w-24 -translate-x-1/2 translate-y-8 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl font-bold text-white ring-2 ring-white/30 backdrop-blur-sm">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold">{currentUser.name}</h1>
            <p className="truncate text-sm text-blue-100">{currentUser.email}</p>
            {currentUser.phone && (
              <p className="flex items-center gap-1 text-xs text-blue-100 mt-0.5">
                📞 {currentUser.phone}
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setEditName(currentUser.name);
                setEditPhone(currentUser.phone);
                setEditAddress(currentUser.address);
                setEditMode(!editMode);
              }}
              className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white hover:bg-white/30 transition-colors"
            >
              <Edit3 className="h-3 w-3" /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-green-600 to-green-500 p-5 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-green-100">
              <Award className="h-4 w-4" /> Points Balance
            </div>
            <p className="mt-1 text-4xl font-bold">{currentUser.points.toLocaleString()}</p>
            <p className="mt-1 text-xs text-green-100">Earn 1 point for every ₱100 spent</p>
          </div>
          <button
            type="button"
            onClick={() => setRedeemOpen(true)}
            disabled={currentUser.points < REDEEM_COST}
            className="rounded-xl bg-white/20 px-5 py-3 text-sm font-semibold backdrop-blur-sm hover:bg-white/30 transition-all disabled:opacity-50 active:scale-95"
          >
            <Gift className="mr-1.5 inline h-4 w-4" />
            Redeem
          </button>
        </div>
      </div>

      {editMode && (
        <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <UserIcon className="h-4 w-4 text-blue-600" /> Edit details
          </h2>
          <div className="space-y-2 text-sm">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
            <input
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="Phone number"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
            <textarea
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              placeholder="Address"
              rows={2}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saveBusy}
                onClick={saveProfile}
                className="flex-1 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {saveBusy ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </section>
      )}

      {!editMode && (
        <section className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 divide-y divide-gray-100">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={i}
                to={item.href as any}
                className="flex items-center gap-3 p-4 text-sm hover:bg-gray-50 transition-colors"
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
      )}

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Award className="h-4 w-4 text-blue-600" /> Points history
        </h2>
        <div className="space-y-1.5">
          {txns.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-800">{t.source}</p>
                <p className="text-xs text-gray-500">{new Date(t.created_at).toLocaleDateString()}</p>
              </div>
              <span
                className={`text-sm font-bold ${
                  t.points_earned > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {t.points_earned > 0 ? `+${t.points_earned}` : `-${t.points_redeemed}`}
              </span>
            </div>
          ))}
        </div>
      </section>

      <Dialog open={redeemOpen} onOpenChange={setRedeemOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Redeem points</DialogTitle>
            <DialogDescription>
              Exchange your points for discounts on future orders.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="rounded-lg bg-green-100 p-2 text-green-600">
              <Gift className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{REDEEM_NAME}</p>
              <p className="text-sm text-gray-500">{REDEEM_COST} points = ₱{REDEEM_VALUE} off</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Your balance:{" "}
            <span className="font-semibold text-gray-800">{currentUser.points.toLocaleString()} pts</span>
          </p>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setRedeemOpen(false)}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRedeem}
              disabled={redeeming || currentUser.points < REDEEM_COST}
              className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {redeeming ? "Redeeming..." : "Confirm redeem"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
