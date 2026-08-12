import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { AdminLayout } from "./AdminLayout";
import { AuthGuard } from "@/components/AuthGuard";

export const Route = createFileRoute("/admin")({
  component: AdminRouteComponent,
});

function AdminRouteComponent() {
  const { pathname } = useLocation();
  const isLogin = pathname === "/admin/login";

  // Login page renders bare (no auth guard, no layout shell)
  if (isLogin) {
    return <Outlet />;
  }

  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout />
    </AuthGuard>
  );
}
