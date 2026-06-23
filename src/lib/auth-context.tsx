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
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(async () => {
          const { data } = await supabase.from("user_roles").select("role").eq("user_id", s.user.id).maybeSingle();
          setRole((data?.role as Role) ?? "consumer");
        }, 0);
      } else {
        setRole(null);
      }
    });

    const boot = async () => {
      const rememberedEnabled = rememberMeIsEnabled();
      const rememberedAt = localStorage.getItem("marketup_remember_me_at");

      if (!rememberedEnabled) {
        await supabase.auth.signOut();
      } else if (rememberedAt) {
        const at = Number(rememberedAt);
        if (!Number.isFinite(at) || at <= Date.now()) {
          localStorage.removeItem("marketup_remember_me");
          localStorage.removeItem("marketup_remember_me_at");
          await supabase.auth.signOut();
        }
      }


      const { data } = await supabase.auth.getSession();
      const sess = data.session;
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false);
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
