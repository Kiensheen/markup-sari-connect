import { supabase } from "@/integrations/supabase/client";

export const STORE_ADDRESS =
  import.meta.env.VITE_MARKUP_STORE_ADDRESS ?? "123 Wholesale Ave, Quezon City, Metro Manila";

/** Active rider statuses (maps accepted → confirmed, out_for_delivery → assigned) */
export const RIDER_ACTIVE_STATUSES = ["confirmed", "assigned", "picked_up"] as const;

export async function isRider(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.role === "rider";
}

export function formatPeso(amount: number) {
  return `₱${Number(amount).toLocaleString()}`;
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Accepted",
    assigned: "Out for delivery",
    picked_up: "Picked up",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[status] ?? status.replace("_", " ");
}
