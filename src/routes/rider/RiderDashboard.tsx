import { Fragment, useState } from "react";
import { MapPin, Package, RefreshCw, Store, Check } from "lucide-react";
import { useMock } from "@/contexts/MockContext";
import { RIDER_ACTIVE_STATUSES } from "@/lib/mockData";
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

const STATUS_BADGE: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-700",
  assigned: "bg-indigo-100 text-indigo-700",
  picked_up: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-blue-100 text-blue-700",
};

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

  // Earnings used in the hero summary card
  const delivered = orders.filter((o) => o.rider_id === currentUser.id && o.status === "delivered");
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  const todayEarnings = delivered
    .filter((d) => new Date(d.created_at) >= startOfToday)
    .reduce((s, d) => s + d.delivery_fee, 0);

  const weekEarnings = delivered
    .filter((d) => new Date(d.created_at) >= startOfWeek)
    .reduce((s, d) => s + d.delivery_fee, 0);

  const refresh = () => setRefreshKey((k) => k + 1);

  const run = (fn: () => void, message: string) => {
    fn();
    setBusyId(null);
    toast.success(message);
    refresh();
  };

  const handleAccept = async (orderId: string) => {
    setBusyId(orderId);
    run(() => acceptDelivery(orderId), "Delivery accepted!");
  };
  const handlePickedUp = async (orderId: string) => {
    setBusyId(orderId);
    run(() => markPickedUp(orderId), "Marked as picked up");
  };
  const handleOnTheWay = async (orderId: string) => {
    setBusyId(orderId);
    run(() => markOnTheWay(orderId), "Marked as on the way");
  };
  const handleDelivered = async (orderId: string) => {
    setBusyId(orderId);
    run(() => markDelivered(orderId), "Delivery completed!");
  };

  return (
    <div className="space-y-5" key={refreshKey}>
      {/* Hero: rider name + earnings summary */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-blue-500 p-5 text-white shadow-lg shadow-blue-600/20">
        <div className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl font-bold ring-2 ring-white/30 backdrop-blur-sm">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-blue-100">Magandang araw! 👋</p>
            <h1 className="truncate text-lg font-bold">{currentUser.name}</h1>
            <p className="text-xs text-blue-100">
              {active.length} active delivery{active.length === 1 ? "" : "ies"}
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/25 active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        <div className="relative mt-4 grid grid-cols-2 divide-x divide-white/15 rounded-xl bg-white/10 py-3 text-center backdrop-blur-sm">
          <div>
            <p className="text-[11px] font-medium text-blue-100">EARNINGS TODAY</p>
            <p className="mt-0.5 text-xl font-bold">{formatPeso(todayEarnings)}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-blue-100">THIS WEEK</p>
            <p className="mt-0.5 text-xl font-bold">{formatPeso(weekEarnings)}</p>
          </div>
        </div>
      </section>

      {/* Available deliveries */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Package className="h-4 w-4" />
            </span>
            Available Deliveries
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
              {available.length}
            </span>
          </h2>
        </div>

        {available.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
            <Package className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No available deliveries right now.</p>
            <p className="text-xs text-gray-400">New orders will appear here as stores place them.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {available.map((o) => (
              <OrderCard key={o.id} order={o}>
                <button
                  type="button"
                  disabled={busyId === o.id}
                  onClick={() => handleAccept(o.id)}
                  className="mt-4 w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60"
                >
                  {busyId === o.id ? "Accepting…" : "Accept Delivery"}
                </button>
              </OrderCard>
            ))}
          </div>
        )}
      </section>

      {/* Active deliveries */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <MapPin className="h-4 w-4" />
          </span>
          My Active Deliveries
          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
            {active.length}
          </span>
        </h2>

        {active.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
            <MapPin className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No active deliveries.</p>
            <p className="text-xs text-gray-400">Accept one from above to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {active.map((o) => (
              <OrderCard key={o.id} order={o} badge={statusLabel(o.status)}>
                <div className="mt-4">
                  <DeliveryProgress status={o.status} />
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  {(o.status === "assigned" || o.status === "confirmed") && (
                    <button
                      type="button"
                      disabled={busyId === o.id}
                      onClick={() => handlePickedUp(o.id)}
                      className="w-full rounded-xl border-2 border-blue-600 bg-blue-50 py-3.5 text-base font-semibold text-blue-700 transition hover:bg-blue-100 active:scale-[0.99] disabled:opacity-60"
                    >
                      Mark as Picked Up
                    </button>
                  )}
                  {o.status === "picked_up" && (
                    <button
                      type="button"
                      disabled={busyId === o.id}
                      onClick={() => handleOnTheWay(o.id)}
                      className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60"
                    >
                      Mark as On the Way
                    </button>
                  )}
                  {o.status === "out_for_delivery" && (
                    <button
                      type="button"
                      disabled={busyId === o.id}
                      onClick={() => handleDelivered(o.id)}
                      className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60"
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              </OrderCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const DELIVERY_STEPS = ["Accepted", "Picked up", "On the way", "Delivered"];
const STEP_INDEX: Record<string, number> = {
  confirmed: 0,
  assigned: 0,
  picked_up: 1,
  out_for_delivery: 2,
};

function DeliveryProgress({ status }: { status: string }) {
  const current = STEP_INDEX[status] ?? 0;
  return (
    <div className="flex items-center">
      {DELIVERY_STEPS.map((label, i) => (
        <Fragment key={label}>
          {i > 0 && (
            <div
              className={`mx-1 mb-4 h-0.5 flex-1 rounded-full ${i <= current ? "bg-blue-500" : "bg-gray-200"}`}
            />
          )}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                i < current
                  ? "bg-blue-600 text-white"
                  : i === current
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {i < current ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            <span
              className={`whitespace-nowrap text-[9px] font-semibold ${
                i <= current ? "text-blue-700" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

function OrderCard({
  order,
  badge,
  children,
}: {
  order: DisplayOrder;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Package className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Order #{order.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-[11px] text-gray-400">{timeAgo(order.created_at)}</p>
          </div>
        </div>
        {badge && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[order.status] ?? "bg-gray-100 text-gray-700"}`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="px-4 py-3.5">
        {order.items.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {order.items.map((it, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600 ring-1 ring-gray-100"
              >
                {it.quantity}× {it.name}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="flex items-start gap-2.5 rounded-xl bg-gray-50 p-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Store className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Pickup</p>
              <p className="truncate text-xs font-medium text-gray-700">MarketUp Store</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-xl bg-gray-50 p-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Dropoff</p>
              <p className="line-clamp-2 text-xs font-medium text-gray-700">
                {order.delivery_address ?? "No address provided"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl bg-blue-50/60 px-3.5 py-2.5">
          <div className="text-xs text-gray-500">
            Order total{" "}
            <span className="font-bold text-gray-800">{formatPeso(order.total)}</span>
          </div>
          <div className="text-xs text-gray-500">
            Your fee <span className="font-bold text-blue-700">{formatPeso(order.delivery_fee)}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">{children}</div>
    </div>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
