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
      console.log("Callback: processing...");
      setBusy(true);
      setError(null);

      try {
        // Supabase stores the OAuth result in the URL fragment (#access_token=...)
        // getSession() will automatically parse the fragment and establish the session
        const { data: sessionRes, error: sessionErr } = await supabase.auth.getSession();
        
        const hasSession = !!sessionRes.session;
        console.log("Callback: session exists:", hasSession);
        
        if (sessionErr) {
          console.error("Callback: session error:", sessionErr);
          throw sessionErr;
        }

        if (!hasSession) {
          console.log("Callback: no session found, redirecting to login");
          navigate({ to: "/auth" });
          return;
        }

        const userId = sessionRes.session.user.id;
        console.log("Callback: user ID:", userId);

        // Remember Me for Google sessions too
        const sess = sessionRes.session;
        if (sess) {
          localStorage.setItem("marketup_remember_me", "1");
          if (sess.expires_at) {
            localStorage.setItem("marketup_remember_me_at", String(new Date(sess.expires_at).getTime() - 60_000));
          } else {
            localStorage.setItem("marketup_remember_me_at", String(Date.now() + 1000 * 60 * 60 * 24 * 30));
          }
        }


        // Check user role
        const adminOk = await isAdmin(userId);
        console.log("Callback: checking admin role:", adminOk);
        
        if (adminOk) {
          console.log("Callback: user role: admin");
          toast.success("Welcome, admin!");
          navigate({ to: "/admin/dashboard" });
          return;
        }

        const riderOk = await isRider(userId);
        console.log("Callback: checking rider role:", riderOk);
        
        if (riderOk) {
          console.log("Callback: user role: rider");
          toast.success("Welcome, rider!");
          navigate({ to: "/rider/dashboard" });
          return;
        }

        // Default to consumer
        console.log("Callback: user role: consumer");
        toast.success("Welcome!");
        navigate({ to: "/" });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Google sign-in failed";
        console.error("Callback: error:", e);
        setError(msg);
        toast.error(msg);
        // Redirect to login page on error
        navigate({ to: "/auth" });
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

