import { useCallback, useEffect, useState } from "react";
import { MapPin, Package, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { formatPeso, RIDER_ACTIVE_STATUSES, statusLabel, STORE_ADDRESS } from "@/lib/rider-utils";
import { toast } from "sonner";
import { DeliveryFailureDialog, type DeliveryFailureReasonCode } from "@/components/rider/DeliveryFailureDialog";
import { DELIVERY_FAILURE_REASON_OPTIONS } from "@/components/rider/DeliveryFailureDialog";


interface RiderOrder {
  id: string;
  status: string;
  total: number;
  delivery_fee: number;
  delivery_address: string | null;
  created_at: string;
}

export function RiderDashboard() {
  const { user } = useAuth();
  const [available, setAvailable] = useState<RiderOrder[]>([]);
  const [active, setActive] = useState<RiderOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [failureOpen, setFailureOpen] = useState(false);
  const [failureOrderId, setFailureOrderId] = useState<string | null>(null);


  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [availRes, activeRes] = await Promise.all([
      supabase
        .from("orders")
        .select("id,status,total,delivery_fee,delivery_address,created_at")
        .eq("status", "pending")
        .is("rider_id", null)
        .order("created_at", { ascending: true }),
      supabase
        .from("orders")
        .select("id,status,total,delivery_fee,delivery_address,created_at")
        .eq("rider_id", user.id)
        .in("status", [...RIDER_ACTIVE_STATUSES])
        .order("created_at", { ascending: false }),
    ]);

    setAvailable((availRes.data as RiderOrder[]) ?? []);
    setActive((activeRes.data as RiderOrder[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const accept = async (orderId: string) => {
    if (!user) return;
    setBusyId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ rider_id: user.id, status: "confirmed" })
      .eq("id", orderId)
      .is("rider_id", null);
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Delivery accepted!");
    load();
  };

  const markPickedUp = async (orderId: string) => {
    setBusyId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: "picked_up" })
      .eq("id", orderId);
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Marked as picked up");
    load();
  };






  const markOnTheWay = async (orderId: string) => {
    setBusyId(orderId);



    const { error } = await supabase
      .from("orders")
      .update({ status: "out_for_delivery" })
      .eq("id", orderId);
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Marked as on the way");
    load();
  };

  const markDelivered = async (orderId: string) => {
    setBusyId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: "delivered" })
      .eq("id", orderId);
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Delivery completed!");
    load();
  };

  const onConfirmFailure = async ({
    reasonCode,
    notes,
  }: {
    reasonCode: DeliveryFailureReasonCode;
    notes: string | null;
  }) => {
    if (!user) return;
    if (!failureOrderId) return;

    const reasonOpt = DELIVERY_FAILURE_REASON_OPTIONS.find((o) => o.code === reasonCode);
    const reasonText = reasonOpt?.label ?? reasonCode;

    setBusyId(failureOrderId);
    try {
      const { error: updateErr } = await supabase
        .from("orders")
        .update({
          status: "delivery_failed",
          delivery_failure_reason: reasonCode,
          delivery_failure_notes: notes,
          delivery_failure_at: new Date().toISOString(),
        })
        .eq("id", failureOrderId);

      if (updateErr) throw updateErr;

      const { error: insertErr } = await supabase.from("delivery_attempts").insert({
        order_id: failureOrderId,
        rider_id: user.id,
        status: "failed",
        reason_code: reasonCode,
        reason_text: reasonText,
        notes,
      });

      if (insertErr) throw insertErr;

      toast.error("Delivery marked as unsuccessful.");
      setFailureOpen(false);
      setFailureOrderId(null);
      load();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to submit delivery failure";
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <p className="py-16 text-center text-muted-foreground">Loading deliveries…</p>;
  }

  return (
    <div className="space-y-6">
      <DeliveryFailureDialog
        open={failureOpen}
        onOpenChange={(v) => {
          setFailureOpen(v);
          if (!v) {
            setFailureOrderId(null);
          }
        }}
        onConfirm={onConfirmFailure}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Package className="h-5 w-5 text-primary" />
          Available Deliveries
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{available.length}</span>
        </h2>
        {available.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No available deliveries right now.
          </div>
        ) : (
          available.map((o) => (
            <OrderCard key={o.id} order={o} pickup={STORE_ADDRESS}>
              <button
                type="button"
                disabled={busyId === o.id}
                onClick={() => accept(o.id)}
                className="mt-4 w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {busyId === o.id ? "Accepting…" : "Accept Delivery"}
              </button>
            </OrderCard>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <MapPin className="h-5 w-5 text-primary" />
          My Active Deliveries
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{active.length}</span>
        </h2>
        {active.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No active deliveries. Accept one from above.
          </div>
        ) : (
          active.map((o) => (
            <OrderCard key={o.id} order={o} pickup={STORE_ADDRESS} badge={statusLabel(o.status)}>
              <div className="mt-4 flex flex-col gap-2">
                {(o.status === "assigned" || o.status === "confirmed") && (
                  <button
                    type="button"
                    disabled={busyId === o.id}
                    onClick={() => markPickedUp(o.id)}
                    className="w-full rounded-xl border-2 border-primary bg-primary/5 py-3.5 text-base font-semibold text-primary hover:bg-primary/10 disabled:opacity-60"
                  >
                    Mark as Picked Up
                  </button>
                )}
                {o.status === "picked_up" && (
                  <button
                    type="button"
                    disabled={busyId === o.id}
                    onClick={() => markOnTheWay(o.id)}
                    className="w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                  >
                    Mark as On the Way
                  </button>
                )}
                {o.status === "out_for_delivery" && (
                  <>
                    <button
                      type="button"
                      disabled={busyId === o.id}
                      onClick={() => markDelivered(o.id)}
                      className="w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                    >
                      Mark as Delivered
                    </button>
                    <button
                      type="button"
                      disabled={busyId === o.id}
                      onClick={() => {
                        setFailureOrderId(o.id);
                        setFailureOpen(true);
                      }}
                      className="w-full rounded-xl border-2 border-destructive bg-destructive/5 py-3.5 text-base font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60"
                    >
                      Mark as Unsuccessful
                    </button>
                  </>
                )}

              </div>
            </OrderCard>
          ))
        )}
      </section>
    </div>
  );
}

function OrderCard({
  order,
  pickup,
  badge,
  children,
}: {
  order: RiderOrder;
  pickup: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
          <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        {badge && (
          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pickup</p>
          <p className="mt-0.5 font-medium">MarketUp Store — {pickup}</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dropoff</p>
          <p className="mt-0.5 font-medium">{order.delivery_address ?? "No address provided"}</p>
        </div>
      </div>

      <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm">
        <div>
          <span className="text-muted-foreground">Order total </span>
          <span className="font-bold text-foreground">{formatPeso(order.total)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Your fee </span>
          <span className="font-bold text-primary">{formatPeso(order.delivery_fee)}</span>
        </div>
      </div>

      {children}
    </div>
  );
}
