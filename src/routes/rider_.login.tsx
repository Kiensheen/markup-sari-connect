import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { isRider } from "@/lib/rider-utils";
import { RiderLogin } from "./rider/RiderLogin";

export const Route = createFileRoute("/rider_/login")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && await isRider(session.user.id)) {
      throw redirect({ to: "/rider/dashboard" });
    }
  },
  component: RiderLogin,
});
