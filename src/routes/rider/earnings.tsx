import { createFileRoute } from "@tanstack/react-router";
import { RiderEarnings } from "./RiderEarnings";

export const Route = createFileRoute("/rider/earnings")({
  component: RiderEarnings,
});
