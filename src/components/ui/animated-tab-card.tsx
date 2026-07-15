import { useState } from "react";
import { Store, Bike, ShieldCheck, CheckCircle2 } from "lucide-react";

const defaultTabs = [
  {
    label: "For Store Owners",
    icon: Store,
    content: (
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <div>
          <div className="inline-flex rounded-xl bg-orange-100 p-3 text-orange-600">
            <Store className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-gray-900">
            Buy Wholesale, Save Money
          </h3>
          <p className="mt-2 text-gray-500 leading-relaxed">
            Get wholesale prices on groceries and supplies for your sari-sari store.{" "}
            <span className="font-medium text-orange-600">Save up to 30%</span> compared to retail.
          </p>
          <ul className="mt-4 space-y-3">
            {[
              "Bulk ordering with best prices",
              "Free delivery to your store",
              "Track orders in real-time",
              "Earn Suki points on every order",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden md:flex items-center justify-center">
          <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-8 ring-1 ring-orange-100">
            <div className="text-center">
              <div className="text-4xl">🏪</div>
              <p className="mt-3 text-sm font-medium text-orange-600">
                500+ wholesale products
              </p>
              <p className="mt-1 text-xs text-gray-400">Available at your fingertips</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: "For Riders",
    icon: Bike,
    content: (
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <div>
          <div className="inline-flex rounded-xl bg-teal-100 p-3 text-teal-600">
            <Bike className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-gray-900">
            Earn Money, Deliver Goods
          </h3>
          <p className="mt-2 text-gray-500 leading-relaxed">
            Become a delivery partner and earn money delivering to stores in your area.{" "}
            <span className="font-medium text-teal-600">Flexible schedule.</span>
          </p>
          <ul className="mt-4 space-y-3">
            {[
              "Flexible hours — work on your own time",
              "Real-time delivery tracking",
              "Weekly earnings dashboard",
              "Bonuses for top-performing riders",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden md:flex items-center justify-center">
          <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 p-8 ring-1 ring-teal-100">
            <div className="text-center">
              <div className="text-4xl">📦</div>
              <p className="mt-3 text-sm font-medium text-teal-600">
                Earn ₱200-500 per delivery
              </p>
              <p className="mt-1 text-xs text-gray-400">Based on distance and volume</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: "For Admin",
    icon: ShieldCheck,
    content: (
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <div>
          <div className="inline-flex rounded-xl bg-purple-100 p-3 text-purple-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-gray-900">
            Manage Everything
          </h3>
          <p className="mt-2 text-gray-500 leading-relaxed">
            Full control over orders, products, riders, and inventory.{" "}
            <span className="font-medium text-purple-600">One dashboard.</span>
          </p>
          <ul className="mt-4 space-y-3">
            {[
              "Manage orders and rider assignments",
              "Track inventory in real-time",
              "View detailed reports and analytics",
              "Manage all users and permissions",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden md:flex items-center justify-center">
          <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 p-8 ring-1 ring-purple-100">
            <div className="text-center">
              <div className="text-4xl">📊</div>
              <p className="mt-3 text-sm font-medium text-purple-600">
                Real-time analytics
              </p>
              <p className="mt-1 text-xs text-gray-400">See what's happening now</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function SmoothTab() {
  const [active, setActive] = useState(0);

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-100">
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        {defaultTabs.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = i === active;
          return (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative flex flex-1 items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-orange-500" : ""}`} />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      <div className="p-6 md:p-8">
        {defaultTabs[active].content}
      </div>
    </div>
  );
}
