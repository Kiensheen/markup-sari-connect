import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getNonAdminRedirect, isAdmin } from "@/lib/admin-utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

export const Route = createFileRoute("/admin_/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      console.log("[admin login] submitting", { email });
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      console.log("[admin login] signInWithPassword result", { authError, hasUser: !!data.user, userId: data.user?.id });
      if (authError) throw authError;
      if (!data.user) throw new Error("Sign in failed");

      console.log("[admin login] checking admin role", { userId: data.user.id });
      const adminOk = await isAdmin(data.user.id);
      console.log("[admin login] isAdmin", { adminOk });

      if (!adminOk) {
        await supabase.auth.signOut();
        console.log("[admin login] signed out (not admin)");

        const dest = await getNonAdminRedirect(data.user.id);
        setError(dest === "/rider/dashboard" ? "This account is a rider, not an admin." : "This account is not an admin.");
        return;
      }

      toast.success("Welcome, admin!");
      console.log("[admin login] redirecting to /admin/dashboard");
      navigate({ to: "/admin/dashboard" });
    } catch (err: unknown) {
      console.log("[admin login] error", err);
      const msg = err instanceof Error ? err.message : "Sign in failed";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">MarkUp Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to manage the platform</p>
        </div>
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}
        <div className="space-y-4">
          <GoogleLoginButton disabled={busy} />
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>Or continue with</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="h-11" />
            <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="h-11" />
            <Button type="submit" disabled={busy} className="h-11 w-full">
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
