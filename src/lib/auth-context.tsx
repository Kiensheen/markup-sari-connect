// Auth context is no longer used in the mock/frontend-only version.
// All auth is handled by MockContext.
// This file is kept as a stub to avoid breaking imports from unused routes.

import { createContext, useContext, type ReactNode } from "react";

interface AuthCtx {
  user: null;
  session: null;
  role: null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  role: null,
  loading: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={{ user: null, session: null, role: null, loading: false, signOut: async () => {} }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
