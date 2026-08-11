import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "./AdminLayout";
import { AuthGuard } from "@/components/AuthGuard";

export const Route = createFileRoute("/admin")({
  component: AdminRouteComponent,
});

function AdminRouteComponent() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout />
    </AuthGuard>
  );
}
