import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw, XCircle, Package, Clock, CheckCircle, X } from "lucide-react";
import { useMock } from "@/contexts/MockContext";
import { OrderProgressBar } from "@/components/OrderProgressBar";
import { formatDate, peso, STATUS_COLORS } from "@/lib/mockData";
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

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    assigned: "bg-indigo-100 text-indigo-700 border-indigo-200",
    picked_up: "bg-purple-100 text-purple-700 border-purple-200",
    out_for_delivery: "bg-emerald-100 text-emerald-700 border-emerald-200",
    delivered: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    delivery_failed: "bg-red-100 text-red-700 border-red-200",
  };
  return map[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
};

const statusIcon = (status: string) => {
  const map: Record<string, React.ReactNode> = {
    delivered: <CheckCircle className="h-3.5 w-3.5" />,
    cancelled: <XCircle className="h-3.5 w-3.5" />,
  };
  return map[status] ?? <Clock className="h-3.5 w-3.5" />;
};

function OrdersPage() {
  const { orders, cancelOrder, currentUser, products, addToCart } = useMock();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  const userOrders = orders.filter((o) => o.consumer_id === currentUser.id);

  const handleCancel = (orderId: string) => {
    cancelOrder(orderId);
    setCancelConfirm(null);
    toast.success("Order cancelled");
  };

  const handleReorder = (orderId: string) => {
    const order = userOrders.find((o) => o.id === orderId);
    if (!order) return;
    order.items.forEach((item) => {
      const product = products.find((p) => p.name === item.name);
      if (product) addToCart(product);
    });
    toast.success("Items added to cart!");
    navigate({ to: "/cart" });
  };

  if (userOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-gray-100 p-6">
          <Package className="h-12 w-12 text-gray-300" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-800">No orders yet</h2>
        <p className="mt-1 text-sm text-gray-500">Place your first order to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
      <div className="space-y-3">
        {userOrders.map((o) => {
          const isOpen = expanded === o.id;
          const borderColor = o.status === "delivered" ? "border-l-green-500" : o.status === "cancelled" || o.status === "delivery_failed" ? "border-l-red-500" : "border-l-emerald-500";
          return (
            <div key={o.id} className={`overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 border-l-4 ${borderColor}`}>
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : o.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">Order #{o.id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-500">{formatDate(o.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusBadge(o.status)}`}>
                      {statusIcon(o.status)}
                      {o.status.replace("_", " ")}
                    </span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-500">{o.items?.length ?? 0} item(s)</span>
                  <span className="font-bold text-emerald-600">{peso(o.total)}</span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 px-4 pb-4">
                  {o.status !== "cancelled" && o.status !== "delivery_failed" && <OrderProgressBar status={o.status} />}

                  <div className="mt-3 space-y-1.5 text-sm">
                    {o.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="line-clamp-1 text-gray-600">{it.name} × {it.quantity}</span>
                        <span className="text-gray-800">{peso(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Delivery fee</span>
                      <span className="text-gray-800">{peso(o.delivery_fee)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-800">Total</span>
                      <span className="text-emerald-600">{peso(o.total)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {paymentLabel(o.payment_method)}
                    </p>
                    {o.delivery_address && (
                      <p className="flex items-start gap-1 text-xs text-gray-500 mt-1">
                        <span>📍</span> {o.delivery_address}
                      </p>
                    )}
                    {o.notes && (
                      <p className="text-xs text-gray-400 mt-1">Note: {o.notes}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {o.status === "delivered" && (
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => handleReorder(o.id)}
                          className="gap-1.5 border-green-200 text-green-700 hover:bg-green-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Reorder All
                        </Button>
                      )}
                      {["pending"].includes(o.status) && (
                        cancelConfirm === o.id ? (
                          <div className="flex gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              type="button"
                              onClick={() => handleCancel(o.id)}
                              className="gap-1.5"
                            >
                              <X className="h-3.5 w-3.5" /> Confirm Cancel
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => setCancelConfirm(null)}
                            >
                              Keep
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => setCancelConfirm(o.id)}
                            className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Cancel Order
                          </Button>
                        )
                      )}
                    </div>
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
