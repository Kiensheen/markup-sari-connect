import { Link } from "@tanstack/react-router";
import { Bell, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin-utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  type: "order" | "stock";
  message: string;
  href: string;
}

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    (async () => {
      const [pendingRes, stockRes] = await Promise.all([
        supabase.from("orders").select("id,created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
        supabase.from("products").select("id,name,stock").lte("stock", LOW_STOCK_THRESHOLD).order("stock").limit(5),
      ]);

      const items: Notification[] = [];
      (pendingRes.data ?? []).forEach((o) => {
        items.push({
          id: `order-${o.id}`,
          type: "order",
          message: `New pending order #${o.id.slice(0, 8)}`,
          href: "/admin/orders",
        });
      });
      (stockRes.data ?? []).forEach((p) => {
        items.push({
          id: `stock-${p.id}`,
          type: "stock",
          message: `Low stock: ${p.name} (${p.stock} left)`,
          href: "/admin/inventory",
        });
      });
      setNotifications(items);
    })();
  }, []);

  const count = notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-primary px-1 text-[10px]">
              {count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">All clear — no alerts</div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem key={n.id} asChild>
              <Link to={n.href} className="flex cursor-pointer items-start gap-2">
                <Package className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm">{n.message}</span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
