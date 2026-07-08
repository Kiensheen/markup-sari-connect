// Rider utilities -- no Supabase dependency.
// Pure constants and helpers for rider pages.

import { formatPeso, statusLabel, RIDER_ACTIVE_STATUSES, STORE_ADDRESS } from "@/lib/mockData";

export { formatPeso, statusLabel, RIDER_ACTIVE_STATUSES, STORE_ADDRESS };

export async function isRider(_userId: string): Promise<boolean> {
  return false;
}
