import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { OrderProgressBar } from "@/components/OrderProgressBar";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { jsPDF } from "jspdf";


export const Route = createFileRoute("/orders")({

  component: OrdersPage,
});

interface Order {
  id: string;
  rider_id: string | null;

  status: string;
  total: number;
  delivery_fee: number;
  payment_method: string;
  delivery_address: string | null;
  notes: string | null;
  created_at: string;
  order_items: { id: string; quantity: number; price: number; products: { name: string } | null }[];
}

const statusColor: Record<string, string> = {
  pending: "bg-warning/20 text-warning-foreground",
  confirmed: "bg-primary-soft text-primary",
  assigned: "bg-primary-soft text-primary",
  picked_up: "bg-accent text-accent-foreground",
  delivered: "bg-success/20 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};

const paymentLabel = (method: string) => {
  if (method === "cod") return "Cash on Delivery";
  if (method === "online") return "GCash";
  return method;
};

function OrdersPage() {
  const { user, loading } = useAuth();

  const [receiptBusyId, setReceiptBusyId] = useState<string | null>(null);

  const generateReceipt = async (order: Order) => {

    // Only for delivered orders (UI guard)
    const orderId = order.id;

    // Fetch rider name/email for receipt
    // Rider is stored in orders.rider_id, and rider profile is in profiles
    const { data: riderProfile } = await supabase
      .from("profiles")
      .select("name,email")
      .eq("id", order.rider_id)
      .maybeSingle();

    const riderName = riderProfile?.name ?? riderProfile?.email ?? "N/A";

    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();

    const left = 48;
    let y = 54;

    const centerText = (text: string, yy: number, size = 16) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(size);
      const textWidth = doc.getTextWidth(text);
      doc.text(text, (pageWidth - textWidth) / 2, yy);
    };

    const text = (t: string, yy: number, size = 10) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(size);
      doc.text(t, left, yy);
    };

    centerText("MARKETUP", y, 18);
    y += 18;
    centerText("Order Receipt", y, 14);
    y += 28;

    text(`Order ID: ${orderId}`, y);
    y += 14;
    text(`Date: ${new Date(order.created_at).toLocaleString()}`, y);
    y += 20;

    text("Items:", y);
    y += 14;

    const items = order.order_items ?? [];
    let subtotal = 0;

    for (const it of items) {
      const itemTotal = (it.price ?? 0) * (it.quantity ?? 0);
      subtotal += itemTotal;

      const line = `${it.products?.name ?? "Item"} x ${it.quantity} = ₱${Number(itemTotal).toLocaleString()}`;
      // naive wrapping
      const maxWidth = pageWidth - left * 2;
      const words = line.split(" ");
      let current = "";
      for (const w of words) {
        const next = current ? `${current} ${w}` : w;
        if (doc.getTextWidth(next) > maxWidth) {
          doc.text(current, left, y);
          y += 12;
          current = w;
        } else {
          current = next;
        }
      }
      if (current) {
        doc.text(current, left, y);
        y += 12;
      }
    }

    y += 8;

    const deliveryFee = Number(order.delivery_fee ?? 0);
    const total = Number(order.total ?? 0);

    text(`Subtotal: ₱${subtotal.toLocaleString()}`, y);
    y += 14;
    text(`Delivery Fee: ₱${deliveryFee.toLocaleString()}`, y);
    y += 14;
    text(`Total: ₱${total.toLocaleString()}`, y);
    y += 18;

    text(`Delivery Address: ${order.delivery_address ?? "N/A"}`, y);
    y += 14;
    text(`Rider: ${riderName}`, y);
    y += 22;

    centerText("Thank you for shopping at MarketUp!", y, 11);
    y += 18;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    centerText("", y);

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Receipt-${orderId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };
const [orders, setOrders] = useState<Order[]>([]);


  const [busy, setBusy] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);

  const openCancel = (orderId: string) => {
    setCancelingOrderId(orderId);
    setCancelOpen(true);
  };


  const confirmCancel = async () => {
    if (!user || !cancelingOrderId) return;
    setCancelBusy(true);
    try {
      const orderBeing = orders.find((o) => o.id === cancelingOrderId);
      console.log("[orders] cancel request", {
        orderId: cancelingOrderId,
        userId: user.id,
        status: orderBeing?.status,
        rider_id: orderBeing?.rider_id,
      });

      const { data: updated, error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", cancelingOrderId)
        .eq("consumer_id", user.id)
        .is("rider_id", null)
        .in("status", ["pending", "confirmed", "assigned"])
        .select("id");

      if (error) {
        console.error("[orders] cancel error", error);
        toast.error("Failed to cancel order: " + error.message);
        return;
      }
      if (!updated || updated.length === 0) {
        toast.error("Cannot cancel this order anymore.");
        return;
      }

      setCancelOpen(false);
      setCancelingOrderId(null);
      toast.success("Order cancelled successfully");

      const { data } = await supabase
        .from("orders")
        .select("id,rider_id,status,total,delivery_fee,payment_method,delivery_address,notes,created_at,order_items(id,quantity,price,products(name))")
        .eq("consumer_id", user.id)
        .order("created_at", { ascending: false });

      setOrders((data as unknown as Order[]) ?? []);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to cancel order";
      toast.error(message);
    } finally {
      setCancelBusy(false);
    }
  };

  useEffect(() => {
    if (!user) { setBusy(false); return; }

    supabase
      .from("orders")
      .select("id,status,total,delivery_fee,payment_method,delivery_address,notes,created_at,order_items(id,quantity,price,products(name))")
      .eq("consumer_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setOrders((data as unknown as Order[]) ?? []); setBusy(false); });
  }, [user]);

  if (loading || busy) return <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>;
  if (!user) return (
    <div className="py-16 text-center">
      <h2 className="text-xl font-semibold">Sign in to view orders</h2>
      <Link to="/auth" className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Sign in</Link>
    </div>
  );

  return (
    <div className="space-y-4">
      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel order?"
        description="This will cancel your pending order. You will not be charged."
        confirmLabel="Yes, cancel"
        cancelLabel="No"
        destructive
        loading={cancelBusy}
        onConfirm={confirmCancel}
      />

      <h1 className="text-2xl font-bold">My Orders</h1>
      {orders.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-3">

          {orders.map((o) => {
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
                      <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusColor[o.status] ?? "bg-muted"}`}>
                        {o.status.replace("_", " ")}
                      </span>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">{o.order_items?.length ?? 0} item(s)</span>
                    <span className="font-bold text-primary">₱{Number(o.total).toLocaleString()}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-border px-4 pb-4">
                    {o.status !== "cancelled" && <OrderProgressBar status={o.status} />}

                    <div className="mt-3 space-y-1 text-sm">
                      {o.order_items?.map((it) => (
                        <div key={it.id} className="flex justify-between text-muted-foreground">
                          <span className="line-clamp-1">{it.products?.name ?? "Item"} × {it.quantity}</span>
                          <span>₱{(it.price * it.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Delivery fee</span><span>₱{Number(o.delivery_fee).toLocaleString()}</span></div>
                      <div className="flex justify-between font-semibold"><span>Total</span><span className="text-primary">₱{Number(o.total).toLocaleString()}</span></div>
                      <p className="text-xs text-muted-foreground">{paymentLabel(o.payment_method)}</p>
                      {o.delivery_address && (
                        <p className="text-xs text-muted-foreground">📍 {o.delivery_address}</p>
                      )}
                      {o.notes && (
                      <p className="text-xs text-muted-foreground">Note: {o.notes}</p>
                      )}
                      {o.status === "pending" && o.rider_id === null && (
                        <div className="mt-3">
                          <Button
                            variant="destructive"
                            size="sm"
                            type="button"
                            onClick={() => openCancel(o.id)}
                          >
                            Cancel Order
                          </Button>
                        </div>
                      )}
                      {o.status === "delivered" && (
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            disabled={receiptBusyId === o.id}
                            onClick={async () => {
                              setReceiptBusyId(o.id);
                              try { await generateReceipt(o); } catch (e) {
                                toast.error(e instanceof Error ? e.message : "Failed to generate receipt");
                              } finally { setReceiptBusyId(null); }
                            }}
                          >
                            {receiptBusyId === o.id ? "Generating…" : "Download Receipt"}
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
      )}
    </div>
  );
}
