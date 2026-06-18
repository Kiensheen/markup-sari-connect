import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import { isAdmin } from "@/lib/admin-utils";
import { isRider } from "@/lib/rider-utils";
import { toast } from "sonner";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";


export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to verify.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        if (data.user && await isAdmin(data.user.id)) {
          navigate({ to: "/admin/dashboard" });
        } else if (data.user && await isRider(data.user.id)) {
          navigate({ to: "/rider/dashboard" });
        } else {
          navigate({ to: "/" });
        }
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  // Google OAuth is handled by <GoogleLoginButton />


  return (
    <div className="mx-auto max-w-sm space-y-6 py-4">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg">M</div>
        <h1 className="text-2xl font-bold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{mode === "signin" ? "Sign in to keep stocking up" : "Join MarkUp and shop wholesale"}</p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        )}
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
          className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6}
          className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <button disabled={busy} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <GoogleLoginButton disabled={busy} />

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
      </div>


      <p className="text-center text-sm text-muted-foreground">
        {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="font-semibold text-primary hover:underline">
          {mode === "signin" ? "Create account" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
