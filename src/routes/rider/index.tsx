import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/rider/")({
  beforeLoad: () => {
    throw redirect({ to: "/rider/dashboard" });
  },
});
