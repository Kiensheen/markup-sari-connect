import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { isRider } from "@/lib/rider-utils";
import { RiderLayout } from "./RiderLayout";

export const Route = createFileRoute("/rider")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw redirect({ to: "/rider/login" });
    }
    if (!(await isRider(session.user.id))) {
      throw redirect({ to: "/rider/login" });
    }
  },
  component: RiderLayout,
});
