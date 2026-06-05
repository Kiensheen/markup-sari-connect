import { useEffect, useState } from "react";
import { Star, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

interface Profile {
  name: string | null;
  email: string | null;
  phone: string | null;
}

export function RiderProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [profRes, countRes] = await Promise.all([
        supabase.from("profiles").select("name,email,phone").eq("id", user.id).maybeSingle(),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("rider_id", user.id)
          .eq("status", "delivered"),
      ]);
      setProfile(profRes.data as Profile | null);
      setCompletedCount(countRes.count ?? 0);
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return <p className="py-16 text-center text-muted-foreground">Loading profile…</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
          {(profile?.name ?? user?.email ?? "R").charAt(0).toUpperCase()}
        </div>
        <h2 className="mt-4 text-xl font-bold">{profile?.name ?? "Rider"}</h2>
        <p className="text-sm text-muted-foreground">{profile?.email ?? user?.email}</p>
        {profile?.phone && <p className="mt-1 text-sm text-muted-foreground">{profile.phone}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Truck className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-2 text-2xl font-bold">{completedCount}</p>
          <p className="text-xs text-muted-foreground">Deliveries completed</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="flex justify-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-primary text-primary" />
            ))}
          </div>
          <p className="mt-2 text-2xl font-bold">5.0</p>
          <p className="text-xs text-muted-foreground">Rating</p>
        </div>
      </div>
    </div>
  );
}
