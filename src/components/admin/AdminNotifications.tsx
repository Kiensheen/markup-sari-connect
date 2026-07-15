import { Link } from "@tanstack/react-router";
import { Bell, Package } from "lucide-react";
import { useMock } from "@/contexts/MockContext";
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
  const { orders, products } = useMock();

  const LOW_STOCK_THRESHOLD = 10;

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const lowStock = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD);

  const notifications: Notification[] = [
    ...pendingOrders.slice(0, 5).map((o) => ({
      id: `order-${o.id}`,
      type: "order" as const,
      message: `New pending order #${o.id.slice(0, 8)}`,
      href: "/admin/orders" as const,
    })),
    ...lowStock.slice(0, 5).map((p) => ({
      id: `stock-${p.id}`,
      type: "stock" as const,
      message: `Low stock: ${p.name} (${p.stock} left)`,
      href: "/admin/inventory" as const,
    })),
  ];

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
