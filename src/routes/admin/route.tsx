import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "./AdminLayout";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});
