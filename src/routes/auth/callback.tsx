import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin } from "@/lib/admin-utils";
import { isRider } from "@/lib/rider-utils";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      console.log("[auth callback] start");
      setBusy(true);
      setError(null);

      try {
        // Supabase stores the OAuth result in the URL, so we must
        // fetch the session here after redirect.
        const { data: sessionRes, error: sessionErr } = await supabase.auth.getSession();
        console.log("[auth callback] getSession", { sessionErr, userId: sessionRes.session?.user?.id });
        if (sessionErr) throw sessionErr;

        const userId = sessionRes.session?.user?.id;
        if (!userId) {
          throw new Error("No active session after OAuth.");
        }

        const adminOk = await isAdmin(userId);
        console.log("[auth callback] isAdmin", { userId, adminOk });
        if (adminOk) {
          toast.success("Welcome, admin!");
          navigate({ to: "/admin/dashboard" });
          return;
        }

        const riderOk = await isRider(userId);
        console.log("[auth callback] isRider", { userId, riderOk });
        if (riderOk) {
          toast.success("Welcome, rider!");
          navigate({ to: "/rider/dashboard" });
          return;
        }

        // Default to consumer.
        // If you want strict checks (role must exist), we can update to query user_roles for consumer.
        toast.success("Welcome!");
        navigate({ to: "/" });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Google sign-in failed";
        console.log("[auth callback] error", e);
        setError(msg);
        toast.error(msg);
        navigate({ to: "/auth", search: { error: msg } as any });
      } finally {
        setBusy(false);
      }
    })();
  }, [navigate]);

  return (
    <div className="mx-auto flex min-h-screen max-w-sm items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-border bg-card p-6 text-center">
        <div className="text-lg font-semibold">Signing you in…</div>
        {error && <div className="mt-3 text-sm text-destructive">{error}</div>}
        {busy && <div className="mt-4 text-sm text-muted-foreground">Please wait.</div>}
      </div>
    </div>
  );
}

