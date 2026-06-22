import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Award, Camera, Gift, LogOut, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { REDEEM_REWARD } from "@/lib/constants";
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

interface Txn {
  id: string;
  points_earned: number;
  points_redeemed: number;
  source: string;
  created_at: string;
}

interface Profile {
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  points_balance: number;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  province?: string | null;
  city?: string | null;
  barangay?: string | null;
  street?: string | null;
  avatar_url?: string | null;
}

function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [avatarSignedUrl, setAvatarSignedUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);

  const [editFirstName, setEditFirstName] = useState("");
  const [editMiddleName, setEditMiddleName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editProvince, setEditProvince] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editBarangay, setEditBarangay] = useState("");
  const [editStreet, setEditStreet] = useState("");


  const refresh = async () => {
    if (!user) return;
    const { data: prof } = await supabase
      .from("profiles")
      .select("name,email,phone,address,points_balance,first_name,middle_name,last_name,province,city,barangay,street")
      .eq("id", user.id)
      .maybeSingle();
    const p = prof as Profile | null;
    setProfile(p);
    if (p) {
      setEditFirstName(p.first_name ?? "");
      setEditMiddleName(p.middle_name ?? "");
      setEditLastName(p.last_name ?? "");
      setEditPhone(p.phone ?? "");
      setEditProvince(p.province ?? "");
      setEditCity(p.city ?? "");
      setEditBarangay(p.barangay ?? "");
      setEditStreet(p.street ?? "");
    }
    const { data } = await supabase
      .from("points_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setTxns((data as Txn[]) ?? []);
  };

  useEffect(() => { refresh(); }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    if (!editFirstName.trim() || !editLastName.trim() || !editPhone.trim()) {
      toast.error("First name, last name, and phone are required");
      return;
    }
    setSaveBusy(true);
    const fullName = [editFirstName, editMiddleName, editLastName].filter(Boolean).join(" ").trim();
    const address = [editStreet, editBarangay, editCity, editProvince].filter(Boolean).join(", ");
    const updates: Record<string, unknown> = {
      first_name: editFirstName.trim(),
      middle_name: editMiddleName.trim() || null,
      last_name: editLastName.trim(),
      phone: editPhone.trim(),
      province: editProvince.trim() || null,
      city: editCity.trim() || null,
      barangay: editBarangay.trim() || null,
      street: editStreet.trim() || null,
      name: fullName,
      address: address || null,
    };
    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
    setSaveBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated successfully");
    setEditMode(false);
    refresh();
  };


  const handleRedeem = async () => {
    if (!user || !profile) return;
    if (profile.points_balance < REDEEM_REWARD.cost) {
      toast.error("Not enough points");
      return;
    }
    setRedeeming(true);
    const { error } = await supabase.rpc("redeem_points", {
      _cost: REDEEM_REWARD.cost,
      _source: `Redeemed: ${REDEEM_REWARD.name}`,
    });
    setRedeeming(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Redeemed ${REDEEM_REWARD.name}! Use it on your next order.`);
    setRedeemOpen(false);
    refresh();
  };

  if (loading) return <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>;
  if (!user) return (
    <div className="py-16 text-center">
      <h2 className="text-xl font-semibold">Sign in to view your profile</h2>
      <Link to="/auth" className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Sign in</Link>
    </div>
  );

  const balance = profile?.points_balance ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
          {(profile?.name ?? user.email ?? "U").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold">{profile?.name ?? "Store Owner"}</h1>
          <p className="truncate text-sm text-muted-foreground">{profile?.email ?? user.email}</p>
          {profile?.phone && <p className="text-xs text-muted-foreground">{profile.phone}</p>}
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/90">
              <Award className="h-4 w-4" /> Points Balance
            </div>
            <p className="mt-1 text-4xl font-bold">{balance.toLocaleString()}</p>
            <p className="mt-1 text-xs text-primary-foreground/80">Earn 1 point for every ₱100 spent</p>
          </div>
          <button
            type="button"
            onClick={() => setRedeemOpen(true)}
            disabled={balance < REDEEM_REWARD.cost}
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
              onClick={() => setEditMode(true)}
              className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-muted"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setEditMode(false); refresh(); }}
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
              <dd className="text-right">{[profile?.first_name, profile?.middle_name, profile?.last_name].filter(Boolean).join(" ") || profile?.name || "Not set"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="text-right">{profile?.phone ?? "Not set"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Address</dt>
              <dd className="text-right">{profile?.address ?? "Not set"}</dd>
            </div>
          </dl>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} placeholder="First name *" className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
              <input value={editMiddleName} onChange={(e) => setEditMiddleName(e.target.value)} placeholder="Middle name" className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
              <input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} placeholder="Last name *" className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone *" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input value={editProvince} onChange={(e) => setEditProvince(e.target.value)} placeholder="Province" className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
              <input value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder="City" className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
              <input value={editBarangay} onChange={(e) => setEditBarangay(e.target.value)} placeholder="Barangay" className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
              <input value={editStreet} onChange={(e) => setEditStreet(e.target.value)} placeholder="Street" className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <p className="text-xs text-muted-foreground">* required</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Points history</h2>
        {txns.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet. Place an order to start earning!</p>
        ) : (
          <div className="space-y-1.5">
            {txns.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">{t.source}</p>
                  <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`font-semibold ${t.points_earned > 0 ? "text-success" : "text-destructive"}`}>
                  {t.points_earned > 0 ? `+${t.points_earned}` : `-${t.points_redeemed}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={signOut}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-3 text-sm font-medium text-destructive hover:bg-destructive/5"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>

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
              <p className="font-semibold">{REDEEM_REWARD.name}</p>
              <p className="text-sm text-muted-foreground">{REDEEM_REWARD.cost} points = ₱{REDEEM_REWARD.value} off</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Your balance: <span className="font-semibold text-foreground">{balance.toLocaleString()} pts</span>
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
              disabled={redeeming || balance < REDEEM_REWARD.cost}
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
