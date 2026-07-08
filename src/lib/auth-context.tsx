import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { rememberMeIsEnabled } from "@/lib/remember-me";
import { APP_VERSION } from "@/lib/constants";
import { GUEST_MODE_KEY, GUEST_USER_KEY, clearGuestMode, guestUser, isGuestMode } from "@/lib/mockData";

const APP_VERSION_KEY = "marketup_app_version";

if (typeof window !== "undefined") {
  try {
    const stored = window.localStorage.getItem(APP_VERSION_KEY);
    if (stored !== APP_VERSION) {
      window.localStorage.clear();
      window.sessionStorage.clear();
      window.localStorage.setItem(APP_VERSION_KEY, APP_VERSION);
      if (stored !== null) {
        window.location.reload();
      }
    }
  } catch {
    // ignore
  }
}

type Role = "consumer" | "rider" | "admin";


interface AuthCtx {
  user: User | null;
  session: Session | null;
  role: Role | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) {
        console.log("Setting user:", s.user.id);
        setUser(s.user);
        setTimeout(async () => {
          const { data } = await supabase.from("user_roles").select("role").eq("user_id", s.user.id).maybeSingle();
          const userRole = (data?.role as Role) ?? "consumer";
          console.log("Setting role:", userRole);
          setRole(userRole);
        }, 0);
      } else {
        console.log("Clearing user");
        setUser(null);
        setRole(null);
      }
    });

    const boot = async () => {
      console.log("AuthContext: booting...");
      
      // First, check if there's already a session (e.g., from OAuth callback)
      const { data } = await supabase.auth.getSession();
      const sess = data.session;
      
      console.log("AuthContext: initial session:", sess?.user?.id || "none");
      
      // NOTE: Do NOT auto-signOut here based on the remember-me flag.
      // On a fresh OAuth callback, Supabase may still be finalizing the
      // URL-hash session when boot() runs, so getSession() can transiently
      // return null and a signOut() would fire SIGNED_OUT and kick the user
      // right back out (this is the "logs in and immediately logs out" bug).
      // The remember-me flag is now advisory; Supabase's own token expiry
      // handles stale sessions, and the sign-out button ends sessions explicitly.
      if (!sess?.user) {
        const rememberedAt = localStorage.getItem("marketup_remember_me_at");
        if (rememberedAt) {
          const at = Number(rememberedAt);
          if (!Number.isFinite(at) || at <= Date.now()) {
            localStorage.removeItem("marketup_remember_me");
            localStorage.removeItem("marketup_remember_me_at");
          }
        }
      }

      // Get final session state
      const { data: finalData } = await supabase.auth.getSession();
      const finalSession = finalData.session;
      setSession(finalSession);
      setUser(finalSession?.user ?? null);
      setLoading(false);
      
      console.log("AuthContext: boot complete, user:", finalSession?.user?.id || "none");
    };

    boot();

    return () => sub.subscription.unsubscribe();
  }, []);



  return (
    <Ctx.Provider
      value={{
        user,
        session,
        role,
        loading,
        signOut: async () => {
          console.log("Signing out");
          localStorage.removeItem("marketup_remember_me");
          localStorage.removeItem("marketup_remember_me_at");
          await supabase.auth.signOut();
        },

      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
