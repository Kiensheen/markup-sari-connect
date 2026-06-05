import { createFileRoute } from "@tanstack/react-router";
import { RiderProfile } from "./RiderProfile";

export const Route = createFileRoute("/rider/profile")({
  component: RiderProfile,
});
