import { createFileRoute } from "@tanstack/react-router";
import { RiderLayout } from "./RiderLayout";

export const Route = createFileRoute("/rider")({
  component: RiderLayout,
});
