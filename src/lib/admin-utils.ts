import { supabase } from "@/integrations/supabase/client";
import { isRider } from "@/lib/rider-utils";

export async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

/** Redirect path for authenticated non-admin users */
export async function getNonAdminRedirect(userId: string): Promise<"/rider/dashboard" | "/"> {
  if (await isRider(userId)) return "/rider/dashboard";
  return "/";
}

export function peso(n: number | string | null | undefined) {
  const v = Number(n ?? 0);
  return `₱${v.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(d: string | Date) {
  return new Date(d).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
}

export const ORDER_STATUSES = ["pending", "confirmed", "assigned", "picked_up", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  assigned: "bg-indigo-100 text-indigo-800",
  picked_up: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export const LOW_STOCK_THRESHOLD = 10;

export function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
