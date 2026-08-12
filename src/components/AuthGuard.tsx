import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMock } from "@/contexts/MockContext";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGuardProps {
  requiredRole: "rider" | "admin";
  children: ReactNode;
}

/**
 * Auth guard component that redirects users without the required role.
 * Used to protect /rider and /admin routes.
 *
 * The access-control decision reads the role from the current user record
 * (currentUser.role) — never from the URL path. Visiting /admin alone does
 * not grant admin access.
 */
export function AuthGuard({ requiredRole, children }: AuthGuardProps) {
  const { currentUser } = useMock();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Small delay so MockContext's user-switch effect can settle first
    const timer = setTimeout(() => {
      if (!isLoggedIn(requiredRole)) {
        // Not logged in → send to the role's login page
        navigate({
          to: requiredRole === "rider" ? "/rider/login" : "/admin/login",
          replace: true,
        });
      } else if (currentUser.role !== requiredRole) {
        // Logged in but wrong role → home
        navigate({ to: "/", replace: true });
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [currentUser.role, requiredRole, isLoggedIn, navigate]);

  // Don't render children if not logged in or wrong role
  if (!isLoggedIn(requiredRole) || currentUser.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
