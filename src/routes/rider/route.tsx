import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { RiderLayout } from "./RiderLayout";
import { AuthGuard } from "@/components/AuthGuard";

export const Route = createFileRoute("/rider")({
  component: RiderRouteComponent,
});

function RiderRouteComponent() {
  const { pathname } = useLocation();
  const isLogin = pathname === "/rider/login";

  // Login page renders bare (no auth guard, no layout shell)
  if (isLogin) {
    return <Outlet />;
  }

  return (
    <AuthGuard requiredRole="rider">
      <RiderLayout />
    </AuthGuard>
  );
}
