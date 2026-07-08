import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Award, Gift, User as UserIcon } from "lucide-react";
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
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
          {currentUser.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold">{currentUser.name}</h1>
          <p className="truncate text-sm text-muted-foreground">{currentUser.email}</p>
          {currentUser.phone && <p className="text-xs text-muted-foreground">{currentUser.phone}</p>}
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/90">
              <Award className="h-4 w-4" /> Points Balance
            </div>
            <p className="mt-1 text-4xl font-bold">{currentUser.points.toLocaleString()}</p>
            <p className="mt-1 text-xs text-primary-foreground/80">Earn 1 point for every ₱100 spent</p>
          </div>
          <button
            type="button"
            onClick={() => setRedeemOpen(true)}
            disabled={currentUser.points < REDEEM_COST}
            className="rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/30 disabled:opacity-50"
          >
            Redeem
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <UserIcon className="h-4 w-4 text-primary" /> Account details
          </h2>
          {!editMode ? (
            <button
              type="button"
              onClick={() => {
                setEditName(currentUser.name);
                setEditPhone(currentUser.phone);
                setEditAddress(currentUser.address);
                setEditMode(true);
              }}
              className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-muted"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saveBusy}
                onClick={saveProfile}
                className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {saveBusy ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </div>
        {!editMode ? (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="text-right">{currentUser.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="text-right">{currentUser.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="text-right">{currentUser.phone || "Not set"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Address</dt>
              <dd className="text-right">{currentUser.address || "Not set"}</dd>
            </div>
          </dl>
        ) : (
          <div className="space-y-2 text-sm">
            <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full name *" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone *" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <textarea value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Address" rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Points history</h2>
        <div className="space-y-1.5">
          {txns.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm">
              <div>
                <p className="font-medium">{t.source}</p>
                <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`font-semibold ${t.points_earned > 0 ? "text-green-600" : "text-red-600"}`}>
                {t.points_earned > 0 ? `+${t.points_earned}` : `-${t.points_redeemed}`}
              </span>
            </div>
          ))}
        </div>
      </section>

      <Dialog open={redeemOpen} onOpenChange={setRedeemOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Redeem points</DialogTitle>
            <DialogDescription>
              Exchange your points for discounts on future orders.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <div className="rounded-lg bg-primary-soft p-2 text-primary"><Gift className="h-6 w-6" /></div>
            <div className="flex-1">
              <p className="font-semibold">{REDEEM_NAME}</p>
              <p className="text-sm text-muted-foreground">{REDEEM_COST} points = ₱{REDEEM_VALUE} off</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Your balance: <span className="font-semibold text-foreground">{currentUser.points.toLocaleString()} pts</span>
          </p>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setRedeemOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRedeem}
              disabled={redeeming || currentUser.points < REDEEM_COST}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {redeeming ? "Redeeming…" : "Confirm redeem"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
