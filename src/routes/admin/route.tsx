import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin } from "@/lib/admin-utils";
import { AdminLayout } from "./AdminLayout";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw redirect({ to: "/admin/login" });
    if (!(await isAdmin(session.user.id))) throw redirect({ to: "/admin/login" });
  },
  component: AdminLayout,
});
