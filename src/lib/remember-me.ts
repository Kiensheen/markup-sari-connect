import { supabase } from "@/integrations/supabase/client";

const FLAG_KEY = "marketup_remember_me";
const AT_KEY = "marketup_remember_me_at";

/**
 * Persist a "remember me" flag + an expiry timestamp (ms since epoch).
 * We rely on Supabase session validity for the real auth; this just controls
 * whether we keep the user opted-in across reloads.
 */
export function rememberMeEnable(expiresAt?: string | null) {
  // If we know session expires_at, set expiry slightly before it.
  const expiry = expiresAt ? new Date(expiresAt).getTime() : Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 days fallback
  // Store a conservative expiry (1 min earlier)
  const at = Math.max(0, expiry - 60_000);
  localStorage.setItem(FLAG_KEY, "1");
  localStorage.setItem(AT_KEY, String(at));
}

export function rememberMeDisable() {
  localStorage.removeItem(FLAG_KEY);
  localStorage.removeItem(AT_KEY);
}

export function rememberMeIsEnabled() {
  return localStorage.getItem(FLAG_KEY) === "1";
}

export async function getRememberedSessionOrNull() {
  const flag = rememberMeIsEnabled();
  if (!flag) return null;

  const { data } = await supabase.auth.getSession();
  const sess = data.session;
  if (!sess || !sess.expires_at) return null;
  if (new Date(sess.expires_at).getTime() <= Date.now()) return null;
  return sess;
}

