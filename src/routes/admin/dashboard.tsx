import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { peso } from "@/lib/admin-utils";
import { ShoppingCart, Users, Truck, Package, TrendingUp, Wallet } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState({
    ordersToday: 0,
    revenueToday: 0,
    pendingOrders: 0,
    totalConsumers: 0,
    totalRiders: 0,
    totalProducts: 0,
    revenueAllTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const [ordersTodayRes, pendingRes, consumersRes, ridersRes, productsRes, allOrdersRes] = await Promise.all([
        supabase.from("orders").select("total,delivery_fee").gte("created_at", startOfToday.toISOString()).neq("status", "cancelled"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "consumer"),
        supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "rider"),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total").eq("status", "delivered"),
      ]);

      const ordersToday = ordersTodayRes.data ?? [];
      const revenueToday = ordersToday.reduce((s, o) => s + Number(o.total ?? 0), 0);
      const revenueAllTime = (allOrdersRes.data ?? []).reduce((s, o) => s + Number(o.total ?? 0), 0);

      setStats({
        ordersToday: ordersToday.length,
        revenueToday,
        pendingOrders: pendingRes.count ?? 0,
        totalConsumers: consumersRes.count ?? 0,
        totalRiders: ridersRes.count ?? 0,
        totalProducts: productsRes.count ?? 0,
        revenueAllTime,
      });
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: "Orders today", value: stats.ordersToday, icon: ShoppingCart, color: "bg-blue-500" },
    { label: "Revenue today", value: peso(stats.revenueToday), icon: TrendingUp, color: "bg-green-500" },
    { label: "Pending orders", value: stats.pendingOrders, icon: ShoppingCart, color: "bg-yellow-500" },
    { label: "Total revenue", value: peso(stats.revenueAllTime), icon: Wallet, color: "bg-emerald-600" },
    { label: "Consumers", value: stats.totalConsumers, icon: Users, color: "bg-indigo-500" },
    { label: "Riders", value: stats.totalRiders, icon: Truck, color: "bg-purple-500" },
    { label: "Products", value: stats.totalProducts, icon: Package, color: "bg-orange-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm text-slate-500 mb-6">Overview of your MarkUp platform</p>
      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${c.color} text-white mb-3`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">{c.value}</div>
                <div className="text-sm text-slate-500">{c.label}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
