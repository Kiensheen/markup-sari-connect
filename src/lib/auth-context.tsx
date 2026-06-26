import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { rememberMeIsEnabled } from "@/lib/remember-me";
import { APP_VERSION } from "@/lib/constants";

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
      
      // Only check remember me if there's NO active session
      // This prevents signing out users who just completed OAuth
      if (!sess?.user) {
        const rememberedEnabled = rememberMeIsEnabled();
        const rememberedAt = localStorage.getItem("marketup_remember_me_at");

        if (!rememberedEnabled) {
          console.log("AuthContext: remember me disabled, signing out");
          await supabase.auth.signOut();
        } else if (rememberedAt) {
          const at = Number(rememberedAt);
          if (!Number.isFinite(at) || at <= Date.now()) {
            console.log("AuthContext: remember me expired, signing out");
            localStorage.removeItem("marketup_remember_me");
            localStorage.removeItem("marketup_remember_me_at");
            await supabase.auth.signOut();
          }
        }
      } else {
        console.log("AuthContext: active session found, skipping remember me check");
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
