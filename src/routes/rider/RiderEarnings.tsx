import { CheckCircle2, TrendingUp, Truck } from "lucide-react";
import { useMock } from "@/contexts/MockContext";
import { formatDate, formatPeso, DELIVERY_FEE } from "@/lib/mockData";

export function RiderEarnings() {
  const { orders, currentUser } = useMock();

  const delivered = orders.filter((o) => o.rider_id === currentUser.id && o.status === "delivered");

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const sum = (list: typeof delivered) => list.reduce((s, d) => s + d.delivery_fee, 0);

  const todayEarnings = sum(delivered.filter((d) => new Date(d.created_at) >= startOfToday));
  const weekEarnings = sum(delivered.filter((d) => new Date(d.created_at) >= startOfWeek));
  const monthEarnings = sum(delivered.filter((d) => new Date(d.created_at) >= startOfMonth));

  // Last 7 days bar chart data
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    const total = sum(
      delivered.filter((d) => {
        const dt = new Date(d.created_at);
        return (
          dt.getFullYear() === day.getFullYear() &&
          dt.getMonth() === day.getMonth() &&
          dt.getDate() === day.getDate()
        );
      }),
    );
    return {
      label: day.toLocaleDateString("en-PH", { weekday: "short" }),
      total,
      isToday: i === chartDayIndex(now, startOfWeek),
    };
  });

  const max = Math.max(...chartData.map((c) => c.total), 1);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Earnings</h1>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {delivered.length} delivery{delivered.length === 1 ? "" : "ies"}
        </span>
      </div>

      {/* Summary hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-blue-500 p-5 text-white shadow-lg shadow-blue-600/20">
        <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-14 -left-8 h-40 w-40 rounded-full bg-white/5" />

        <div className="relative">
          <p className="text-xs font-medium text-blue-100">Total earnings this month</p>
          <p className="mt-1 text-4xl font-bold">{formatPeso(monthEarnings)}</p>
          <p className="mt-1 text-xs text-blue-100">
            {delivered.length} completed delivery{delivered.length === 1 ? "" : "ies"} · {formatPeso(DELIVERY_FEE)} per delivery
          </p>
        </div>

        <div className="relative mt-4 grid grid-cols-3 divide-x divide-white/15 rounded-xl bg-white/10 py-3 text-center backdrop-blur-sm">
          <div>
            <p className="text-[11px] text-blue-100">Today</p>
            <p className="text-base font-bold">{formatPeso(todayEarnings)}</p>
          </div>
          <div>
            <p className="text-[11px] text-blue-100">Week</p>
            <p className="text-base font-bold">{formatPeso(weekEarnings)}</p>
          </div>
          <div>
            <p className="text-[11px] text-blue-100">Month</p>
            <p className="text-base font-bold">{formatPeso(monthEarnings)}</p>
          </div>
        </div>
      </section>

      {/* Weekly chart */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <TrendingUp className="h-4 w-4 text-blue-600" /> Last 7 days
          </h2>
          <span className="text-xs text-gray-400">₱ per day</span>
        </div>
        <div className="flex items-end justify-between gap-2">
          {chartData.map((c, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[9px] font-semibold text-gray-500">
                {c.total > 0 ? formatPeso(c.total) : ""}
              </span>
              <div className="flex h-24 w-full items-end justify-center">
                <div
                  className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                    c.isToday ? "bg-blue-500" : "bg-blue-200"
                  }`}
                  style={{ height: `${Math.max((c.total / max) * 100, 4)}%` }}
                />
              </div>
              <span
                className={`text-[10px] font-medium ${c.isToday ? "font-bold text-blue-700" : "text-gray-400"}`}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Completed deliveries */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
          <CheckCircle2 className="h-4 w-4 text-blue-600" /> Completed deliveries
        </h2>
        {delivered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
            <Truck className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No completed deliveries yet.</p>
            <p className="text-xs text-gray-400">Your finished deliveries will show up here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {delivered.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-800">
                      Order {d.id}
                    </p>
                    <p className="truncate text-xs text-gray-400">{d.delivery_address ?? "—"}</p>
                    <p className="text-[11px] text-gray-400">{formatDate(d.created_at)}</p>
                  </div>
                </div>
                <span className="ml-3 shrink-0 rounded-lg bg-blue-50 px-2.5 py-1.5 text-sm font-bold text-blue-700">
                  +{formatPeso(d.delivery_fee)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function chartDayIndex(now: Date, startOfWeek: Date) {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((todayStart.getTime() - startOfWeek.getTime()) / 86400000);
}
