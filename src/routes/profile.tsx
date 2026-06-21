import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Gift, LogOut, User as UserIcon } from "lucide-react";
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
}

function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

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
      .select("name,email,phone,address,points_balance")
      .eq("id", user.id)
      .maybeSingle();
    setProfile(prof as Profile | null);
    const { data } = await supabase
      .from("points_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setTxns((data as Txn[]) ?? []);
  };

  useEffect(() => { refresh(); }, [user]);

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
        <h2 className="mb-3 flex items-center gap-2 font-semibold">
          <UserIcon className="h-4 w-4 text-primary" /> Account details
        </h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Address</dt>
            <dd className="text-right">{profile?.address ?? "Not set"}</dd>
          </div>
        </dl>
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
