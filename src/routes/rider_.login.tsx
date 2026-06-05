import { createFileRoute } from "@tanstack/react-router";
import { RiderLogin } from "./rider/RiderLogin";

export const Route = createFileRoute("/rider_/login")({
  component: RiderLogin,
});
