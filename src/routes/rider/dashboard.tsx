import { createFileRoute } from "@tanstack/react-router";
import { RiderDashboard } from "./RiderDashboard";

export const Route = createFileRoute("/rider/dashboard")({
  component: RiderDashboard,
});
