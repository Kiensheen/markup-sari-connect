import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

export function RiderLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (!data.user) throw new Error("Sign in failed");

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (roleData?.role !== "rider") {
        await supabase.auth.signOut();
        setError("Not authorized as rider");
        return;
      }

      if (data.session) {
        if (rememberMe) {
          localStorage.setItem("marketup_remember_me", "1");
          localStorage.setItem("marketup_remember_me_at", String(Date.now() + 1000 * 60 * 60 * 24 * 30));
        } else {
          localStorage.removeItem("marketup_remember_me");
          localStorage.removeItem("marketup_remember_me_at");
        }
      }

      toast.success("Welcome, rider!");

      navigate({ to: "/rider/dashboard" });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center space-y-6 py-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Truck className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold">MarketUp Rider</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to start delivering</p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <GoogleLoginButton disabled={busy} />

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>Or continue with</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full rounded-xl border border-input bg-card px-4 py-3.5 text-base outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            className="w-full rounded-xl border border-input bg-card px-4 py-3.5 text-base outline-none focus:ring-2 focus:ring-ring"
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Remember Me
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >

            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
