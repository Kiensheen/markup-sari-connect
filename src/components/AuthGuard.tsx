import { useEffect, type ReactNode } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useMock } from "@/contexts/MockContext";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGuardProps {
  requiredRole: "rider" | "admin";
  children: ReactNode;
}

/**
 * Auth guard component that redirects users without the required role.
 * Used to protect /rider and /admin routes.
 */
export function AuthGuard({ requiredRole, children }: AuthGuardProps) {
  const { role } = useMock();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Small delay to allow role switching to complete first
    // The role gets set by MockContext's useEffect on location change
    const timer = setTimeout(() => {
      if (!isLoggedIn(requiredRole)) {
        // Not logged in → send to the role's login page
        navigate({
          to: requiredRole === "rider" ? "/rider/login" : "/admin/login",
          replace: true,
        });
      } else if (role !== requiredRole) {
        // Logged in but wrong role → home
        navigate({ to: "/", replace: true });
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [role, requiredRole, isLoggedIn, navigate, location.pathname]);

  // Don't render children if not logged in or wrong role
  if (!isLoggedIn(requiredRole) || role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
