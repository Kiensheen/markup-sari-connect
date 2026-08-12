import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

// ── Types ──────────────────────────────────────────────
export type AuthRole = "consumer" | "rider" | "admin";

export interface AuthSession {
  username: string;
  remember: boolean;
}

// ── External module store ──────────────────────────────
// This store lives outside React so route beforeLoad/loaders
// can read auth state synchronously on both server and client.
const STORAGE_PREFIX = "marketup_auth_";
const EMPTY_SESSIONS: Record<AuthRole, AuthSession | null> = {
  consumer: null,
  rider: null,
  admin: null,
};

function loadFromStorage(): Record<AuthRole, AuthSession | null> {
  const s: Record<AuthRole, AuthSession | null> = { consumer: null, rider: null, admin: null };
  if (typeof window === "undefined") return s;
  try {
    for (const role of ["consumer", "rider", "admin"] as AuthRole[]) {
      const raw = localStorage.getItem(STORAGE_PREFIX + role);
      if (raw) s[role] = JSON.parse(raw) as AuthSession;
    }
  } catch {
    /* ignore */
  }
  return s;
}

let sessions: Record<AuthRole, AuthSession | null> = loadFromStorage();
const listeners = new Set<() => void>();

function persistToStorage(): void {
  if (typeof window === "undefined") return;
  try {
    for (const role of ["consumer", "rider", "admin"] as AuthRole[]) {
      const key = STORAGE_PREFIX + role;
      if (sessions[role]?.remember) {
        localStorage.setItem(key, JSON.stringify(sessions[role]));
      } else {
        localStorage.removeItem(key);
      }
    }
  } catch {
    /* ignore */
  }
}

function updateSessions(
  next: Record<AuthRole, AuthSession | null>,
): void {
  sessions = next;
  persistToStorage();
  listeners.forEach((l) => l());
}

// useSyncExternalStore plumbing
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Record<AuthRole, AuthSession | null> {
  return sessions;
}

function getServerSnapshot(): Record<AuthRole, AuthSession | null> {
  return EMPTY_SESSIONS;
}

/**
 * Synchronous read of auth sessions — safe to call in route
 * beforeLoad / load functions (both server and client).
 */
export function getAuthSessions(): Record<AuthRole, AuthSession | null> {
  return sessions;
}

// ── React context ──────────────────────────────────────
interface AuthContextValue {
  sessions: Record<AuthRole, AuthSession | null>;
  isLoggedIn: (role: AuthRole) => boolean;
  getUsername: (role: AuthRole) => string;
  login: (role: AuthRole, username: string, remember: boolean) => void;
  logout: (role: AuthRole) => void;
}

const Ctx = createContext<AuthContextValue>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const login = useCallback(
    (role: AuthRole, username: string, remember: boolean) => {
      updateSessions({ ...sessions, [role]: { username, remember } });
    },
    [],
  );

  const logout = useCallback((role: AuthRole) => {
    updateSessions({ ...sessions, [role]: null });
  }, []);

  const isLoggedIn = useCallback(
    (role: AuthRole) => current[role] !== null,
    [current],
  );

  const getUsername = useCallback(
    (role: AuthRole) => current[role]?.username ?? "",
    [current],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      sessions: current,
      isLoggedIn,
      getUsername,
      login,
      logout,
    }),
    [current, isLoggedIn, getUsername, login, logout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
