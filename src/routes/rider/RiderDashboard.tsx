import { useState } from "react";
import { MapPin, Package, RefreshCw } from "lucide-react";
import { useMock } from "@/contexts/MockContext";
import { RIDER_ACTIVE_STATUSES, STORE_ADDRESS } from "@/lib/mockData";
import { formatPeso, statusLabel } from "@/lib/mockData";
import { toast } from "sonner";

interface DisplayOrder {
  id: string;
  status: string;
  total: number;
  delivery_fee: number;
  delivery_address: string | null;
  created_at: string;
  items: { name: string; quantity: number }[];
}

export function RiderDashboard() {
  const { orders, currentUser, acceptDelivery, markPickedUp, markOnTheWay, markDelivered } = useMock();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const available: DisplayOrder[] = orders
    .filter((o) => o.status === "pending" && !o.rider_id)
    .map((o) => ({ ...o, items: o.items ?? [] }));

  const active: DisplayOrder[] = orders
    .filter((o) => o.rider_id === currentUser.id && (RIDER_ACTIVE_STATUSES as readonly string[]).includes(o.status))
    .map((o) => ({ ...o, items: o.items ?? [] }));

  const refresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleAccept = async (orderId: string) => {
    setBusyId(orderId);
    acceptDelivery(orderId);
    setBusyId(null);
    toast.success("Delivery accepted!");
    refresh();
  };

  const handlePickedUp = async (orderId: string) => {
    setBusyId(orderId);
    markPickedUp(orderId);
    setBusyId(null);
    toast.success("Marked as picked up");
    refresh();
  };

  const handleOnTheWay = async (orderId: string) => {
    setBusyId(orderId);
    markOnTheWay(orderId);
    setBusyId(null);
    toast.success("Marked as on the way");
    refresh();
  };

  const handleDelivered = async (orderId: string) => {
    setBusyId(orderId);
    markDelivered(orderId);
    setBusyId(null);
    toast.success("Delivery completed!");
    refresh();
  };

  return (
    <div className="space-y-6" key={refreshKey}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          type="button"
          onClick={refresh}
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
                onClick={() => handleAccept(o.id)}
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
                    onClick={() => handlePickedUp(o.id)}
                    className="w-full rounded-xl border-2 border-primary bg-primary/5 py-3.5 text-base font-semibold text-primary hover:bg-primary/10 disabled:opacity-60"
                  >
                    Mark as Picked Up
                  </button>
                )}
                {o.status === "picked_up" && (
                  <button
                    type="button"
                    disabled={busyId === o.id}
                    onClick={() => handleOnTheWay(o.id)}
                    className="w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                  >
                    Mark as On the Way
                  </button>
                )}
                {o.status === "out_for_delivery" && (
                  <button
                    type="button"
                    disabled={busyId === o.id}
                    onClick={() => handleDelivered(o.id)}
                    className="w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                  >
                    Mark as Delivered
                  </button>
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
  order: DisplayOrder;
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
          {order.items.length > 0 && (
            <div className="mt-1 text-xs text-muted-foreground">
              {order.items.map((it, i) => (
                <span key={i}>{it.name} × {it.quantity}{i < order.items.length - 1 ? ', ' : ''}</span>
              ))}
            </div>
          )}
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
