import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useMock } from "@/contexts/MockContext";
import { OrderProgressBar } from "@/components/OrderProgressBar";
import { STATUS_COLORS, formatDate, peso } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
});

const paymentLabel = (method: string) => {
  if (method === "cod") return "Cash on Delivery";
  if (method === "gcash") return "GCash";
  return method;
};

function OrdersPage() {
  const { orders, cancelOrder, currentUser } = useMock();
  const [expanded, setExpanded] = useState<string | null>(null);

  const userOrders = orders.filter((o) => o.consumer_id === currentUser.id);

  const handleCancel = (orderId: string) => {
    if (!window.confirm("Cancel this order?")) return;
    cancelOrder(orderId);
    toast.success("Order cancelled");
  };

  if (userOrders.length === 0) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-semibold">No orders yet</h2>
        <p className="text-sm text-muted-foreground">Place your first order to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Orders</h1>
      <div className="space-y-3">
        {userOrders.map((o) => {
          const isOpen = expanded === o.id;
          return (
            <div key={o.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : o.id)}
                className="w-full p-4 text-left hover:bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Order #{o.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[o.status] ?? "bg-muted"}`}>
                      {o.status.replace("_", " ")}
                    </span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">{o.items?.length ?? 0} item(s)</span>
                  <span className="font-bold text-primary">{peso(o.total)}</span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border px-4 pb-4">
                  {o.status !== "cancelled" && <OrderProgressBar status={o.status} />}

                  <div className="mt-3 space-y-1 text-sm">
                    {o.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-muted-foreground">
                        <span className="line-clamp-1">{it.name} × {it.quantity}</span>
                        <span>{peso(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Delivery fee</span><span>{peso(o.delivery_fee)}</span></div>
                    <div className="flex justify-between font-semibold"><span>Total</span><span className="text-primary">{peso(o.total)}</span></div>
                    <p className="text-xs text-muted-foreground">{paymentLabel(o.payment_method)}</p>
                    {o.delivery_address && (
                      <p className="text-xs text-muted-foreground">📍 {o.delivery_address}</p>
                    )}
                    {o.notes && (
                      <p className="text-xs text-muted-foreground">Note: {o.notes}</p>
                    )}
                    {o.rider_id === null && ["pending"].includes(o.status) && (
                      <div className="mt-3">
                        <Button
                          variant="destructive"
                          size="sm"
                          type="button"
                          onClick={() => handleCancel(o.id)}
                        >
                          Cancel Order
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
