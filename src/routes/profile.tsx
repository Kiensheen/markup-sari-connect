import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Award, Gift, Package, CreditCard, Bell, HelpCircle, ChevronRight, X } from "lucide-react";
import { useMock } from "@/contexts/MockContext";
import { toast } from "sonner";
import type { SavedAddress } from "@/lib/mockData";
import { formatDate, peso } from "@/lib/mockData";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileEditForm, type ProfileEditValues } from "@/components/profile/ProfileEditForm";
import { AddressesCard } from "@/components/profile/AddressesCard";
import { AddAddressModal, type NewAddressInput } from "@/components/profile/AddAddressModal";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

const REDEEM_COST = 500;
const REDEEM_NAME = "₱50 off coupon";
const REDEEM_VALUE = 50;

const menuItems = [
  {
    icon: Package,
    label: "My Orders",
    to: "/orders" as const,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: CreditCard,
    label: "Payment Methods",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  { icon: Bell, label: "Notifications", color: "text-amber-600", bg: "bg-amber-50" },
  {
    icon: HelpCircle,
    label: "Help & Support",
    color: "text-gray-600",
    bg: "bg-gray-100",
  },
];

function ProfilePage() {
  const { currentUser, updateUserProfile, adjustPoints, orders } = useMock();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [addresses, setAddresses] = useState<SavedAddress[]>(currentUser.addresses ?? []);
  const [addOpen, setAddOpen] = useState(false);

  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    setAddresses(currentUser.addresses ?? []);
  }, [currentUser.id, currentUser.addresses]);

  const txns = [
    {
      id: "t1",
      source: "Order #o1 completed",
      points_earned: 2,
      points_redeemed: 0,
      created_at: "2026-07-01T10:00:00Z",
    },
    {
      id: "t2",
      source: "Order #o3 completed",
      points_earned: 2,
      points_redeemed: 0,
      created_at: "2026-07-03T09:15:00Z",
    },
    {
      id: "t3",
      source: "Signup bonus",
      points_earned: 50,
      points_redeemed: 0,
      created_at: "2026-01-15T08:00:00Z",
    },
  ];

  const persistAddresses = (next: SavedAddress[]) => {
    setAddresses(next);
    const def = next.find((a) => a.is_default);
    updateUserProfile(currentUser.id, { addresses: next, address: def ? def.address : "" });
  };

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

  const handleAddAddress = (data: NewAddressInput) => {
    const id = `a${Date.now().toString(36)}`;
    const next =
      addresses.length === 0
        ? [{ ...data, id, is_default: true }]
        : [...addresses, { ...data, id }];
    persistAddresses(next);
    setAddOpen(false);
    toast.success("Address added");
  };

  const handleSetDefault = (id: string) => {
    persistAddresses(addresses.map((a) => ({ ...a, is_default: a.id === id })));
    toast.success("Default address updated — used at checkout");
  };

  const handleDeleteAddress = (id: string) => {
    let next = addresses.filter((a) => a.id !== id);
    if (next.length > 0 && !next.some((a) => a.is_default)) {
      next = next.map((a, i) => (i === 0 ? { ...a, is_default: true } : a));
    }
    persistAddresses(next);
    toast.success("Address deleted");
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
            name: currentUser.name,
            email: currentUser.email,
            phone: currentUser.phone,
            store_name: currentUser.store_name ?? "",
            store_hours: currentUser.store_hours ?? "",
          }}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
        />
      )}

      <AddressesCard
        addresses={addresses}
        onAdd={() => setAddOpen(true)}
        onSetDefault={handleSetDefault}
        onDelete={handleDeleteAddress}
      />

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
          const inner = (
            <>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.bg}`}>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <span className="flex-1 font-medium text-gray-700">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </>
          );
          return item.to ? (
            <Link
              key={i}
              to={item.to}
              className="flex items-center gap-3 p-4 text-sm transition hover:bg-gray-50"
            >
              {inner}
            </Link>
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => toast.info(`${item.label} coming soon`)}
              className="flex w-full items-center gap-3 p-4 text-left text-sm transition hover:bg-gray-50"
            >
              {inner}
            </button>
          );
        })}
      </section>

      {/* Order history */}
      <section>
        <Link to="/orders" className="mb-3 flex items-center justify-between group">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 group-hover:text-emerald-600 transition-colors">
            <Package className="h-4 w-4 text-emerald-600" /> Order History
          </h2>
          <span className="text-xs text-emerald-600 font-medium group-hover:underline">View all</span>
        </Link>
        <OrderHistory />
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Award className="h-4 w-4 text-emerald-600" /> Points history
        </h2>
        <div className="space-y-1.5">
          {txns.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{t.source}</p>
                <p className="text-xs text-gray-500">
                  {new Date(t.created_at).toLocaleDateString()}
                </p>
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

      <AddAddressModal open={addOpen} onClose={() => setAddOpen(false)} onSave={handleAddAddress} />

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

function OrderHistory() {
  const { orders, currentUser } = useMock();

  const userOrders = orders
    .filter((o) => o.consumer_id === currentUser.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  if (userOrders.length === 0) {
    return (
      <div className="rounded-2xl bg-white py-8 text-center shadow-sm ring-1 ring-gray-100">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Package className="h-6 w-6 text-gray-300" />
        </div>
        <p className="mt-3 text-sm font-medium text-gray-600">No orders yet</p>
        <p className="mt-0.5 text-xs text-gray-400">Place your first order and it will show up here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <ul className="divide-y divide-gray-100">
        {userOrders.map((o) => (
          <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-800">
                Order #{o.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">{formatDate(o.created_at)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              <span className="text-sm font-bold text-gray-800">{peso(o.total)}</span>
              <StatusPill status={o.status} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const blue = new Set(["pending", "confirmed", "assigned", "picked_up", "out_for_delivery"]);
  const red = new Set(["cancelled", "delivery_failed"]);
  const cls = blue.has(status)
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : red.has(status)
      ? "bg-red-50 text-red-600 ring-red-200"
      : "bg-green-50 text-green-700 ring-green-200";

  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${cls}`}>
      {status.replace("_", " ")}
    </span>
  );
}
