import { createFileRoute } from "@tanstack/react-router";
import { RiderLayout } from "./RiderLayout";
import { AuthGuard } from "@/components/AuthGuard";

export const Route = createFileRoute("/rider")({
  component: RiderRouteComponent,
});

function RiderRouteComponent() {
  return (
    <AuthGuard requiredRole="rider">
      <RiderLayout />
    </AuthGuard>
  );
}
