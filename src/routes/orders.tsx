import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw, XCircle, Package, Clock, CheckCircle, X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useMock } from "@/contexts/MockContext";
import { OrderProgressBar } from "@/components/OrderProgressBar";
import { formatDate, peso } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
});

const PAGE_SIZE = 5;

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
  const { orders, cancelOrder, deleteOrder, currentUser, products, addToCart } = useMock();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const userOrders = orders.filter((o) => o.consumer_id === currentUser.id);
  const totalPages = Math.max(1, Math.ceil(userOrders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = userOrders.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleCancel = (orderId: string) => {
    cancelOrder(orderId);
    setCancelConfirm(null);
    setExpanded(null);
    toast.success("Order cancelled");
  };

  const handleDelete = (orderId: string) => {
    const ok = window.confirm("Delete this completed order from your history?");
    if (!ok) return;
    deleteOrder(orderId);
    setExpanded(null);
    toast.success("Order deleted");
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">My Orders</h1>
        <span className="text-xs text-gray-400">{userOrders.length} total</span>
      </div>

      <div className="space-y-2">
        {pageItems.map((o) => {
          const isOpen = expanded === o.id;
          const borderColor =
            o.status === "delivered"
              ? "border-l-green-500"
              : o.status === "cancelled" || o.status === "delivery_failed"
                ? "border-l-red-500"
                : "border-l-emerald-500";
          return (
            <div key={o.id} className={`rounded-xl bg-white shadow-sm ring-1 ring-gray-100 border-l-4 ${borderColor}`}>
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : o.id)}
                className="w-full p-3 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{o.id}</p>
                    <p className="text-[11px] text-gray-400">{formatDate(o.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${statusBadge(o.status)}`}>
                      {statusIcon(o.status)}
                      {o.status.replace("_", " ")}
                    </span>
                    {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />}
                  </div>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className="text-gray-500">{o.items?.length ?? 0} item{(o.items?.length ?? 0) === 1 ? "" : "s"}</span>
                  <span className="font-bold text-emerald-600">{peso(o.total)}</span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100">
                  {/* Scrollable content */}
                  <div className="max-h-[50vh] overflow-y-auto px-3 pt-3">
                    {o.status !== "cancelled" && o.status !== "delivery_failed" && (
                      <OrderProgressBar status={o.status} />
                    )}

                    <div className="mt-2 space-y-1 text-xs">
                      {o.items?.map((it, idx) => {
                        const product = products.find((p) => p.id === it.product_id);
                        const stock = product?.stock ?? 0;
                        return (
                          <div key={idx} className="flex items-center justify-between gap-2 py-1">
                            <span className="line-clamp-1 text-gray-600">{it.name} × {it.quantity}</span>
                            <span className="shrink-0 text-gray-500">
                              {peso(it.price * it.quantity)}  ·  Stock: {stock}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-2 space-y-0.5 border-t border-gray-100 pt-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Delivery fee</span>
                        <span className="text-gray-800">{peso(o.delivery_fee)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-800">Total</span>
                        <span className="text-emerald-600">{peso(o.total)}</span>
                      </div>
                      <p className="pt-0.5 text-[11px] text-gray-400">{paymentLabel(o.payment_method)}</p>
                      {o.delivery_address && (
                        <p className="flex items-start gap-1 pt-0.5 text-[11px] text-gray-400">
                          <span>📍</span> <span className="line-clamp-1">{o.delivery_address}</span>
                        </p>
                      )}
                      {o.notes && <p className="pt-0.5 text-[11px] text-gray-400">Note: {o.notes}</p>}
                    </div>
                  </div>

                  {/* Sticky action buttons */}
                  {(o.status === "delivered" || o.status === "pending") && (
                    <div className="sticky bottom-0 border-t border-gray-100 bg-white px-3 py-2.5">
                      <div className="flex flex-wrap gap-2">
                        {o.status === "delivered" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => handleReorder(o.id)}
                              className="gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            >
                              <RotateCcw className="h-3 w-3" /> Reorder
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => handleDelete(o.id)}
                              className="gap-1 border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" /> Delete
                            </Button>
                          </>
                        )}
                        {o.status === "pending" &&
                          (cancelConfirm === o.id ? (
                            <div className="flex gap-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                type="button"
                                onClick={() => handleCancel(o.id)}
                                className="gap-1"
                              >
                                <X className="h-3.5 w-3.5" /> Confirm
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
                              className="gap-1 border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-3 w-3" /> Cancel
                            </Button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-medium text-gray-500">
            {safePage} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
