import { useEffect, type ReactNode } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useMock } from "@/contexts/MockContext";

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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Small delay to allow role switching to complete first
    // The role gets set by MockContext's useEffect on location change
    const timer = setTimeout(() => {
      if (role !== requiredRole) {
        // Redirect to home if user doesn't have the required role
        navigate({ to: "/" });
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [role, requiredRole, navigate, location.pathname]);

  // Don't render children if wrong role
  if (role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
