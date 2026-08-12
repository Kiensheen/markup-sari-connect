import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/consumer")({
  component: ConsumerLayoutRoute,
});

function ConsumerLayoutRoute() {
  return <Outlet />;
}
