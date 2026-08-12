import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Store, Bike, ShieldCheck, ArrowLeft } from "lucide-react";

type Variant = "consumer" | "rider" | "admin";

const VARIANTS: Record<
  Variant,
  {
    pageBg: string;
    logoGradient: string;
    badge: string;
    badgeClass: string;
    icon: typeof Store;
    title: string;
  }
> = {
  consumer: {
    pageBg: "from-emerald-50 via-white to-emerald-100",
    logoGradient: "from-emerald-600 to-emerald-500",
    badge: "Consumer",
    badgeClass: "bg-emerald-100 text-emerald-700",
    icon: Store,
    title: "MarketUp",
  },
  rider: {
    pageBg: "from-blue-50 via-white to-blue-100",
    logoGradient: "from-blue-600 to-blue-500",
    badge: "Rider",
    badgeClass: "bg-blue-100 text-blue-700",
    icon: Bike,
    title: "MarketUp",
  },
  admin: {
    pageBg: "from-blue-50 via-white to-slate-100",
    logoGradient: "from-blue-600 to-blue-500",
    badge: "Admin",
    badgeClass: "bg-blue-100 text-blue-700",
    icon: ShieldCheck,
    title: "MarketUp",
  },
};

interface AuthLayoutProps {
  variant: Variant;
  children: ReactNode;
  /** If set, renders a "Back to store" link pointing here. */
  backTo?: string;
}

export function AuthLayout({ variant, children, backTo }: AuthLayoutProps) {
  const v = VARIANTS[variant];
  const Icon = v.icon;

  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center bg-gradient-to-br ${v.pageBg} px-4 py-10`}
    >
      {backTo && (
        <Link
          to={backTo as never}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to store
        </Link>
      )}

      <div className="w-full max-w-sm">
        {/* Logo block */}
        <div className="mb-8 flex flex-col items-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${v.logoGradient} text-2xl font-black text-white shadow-lg`}
          >
            M
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">{v.title}</h1>
          <span
            className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${v.badgeClass}`}
          >
            <Icon className="h-3 w-3" /> {v.badge}
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-6 shadow-xl shadow-gray-200/50 ring-1 ring-gray-100">
          {children}
        </div>

        <p className="mt-8 text-center text-[11px] text-gray-400">
          MarketUp &mdash; Wholesale for sari-sari stores
        </p>
      </div>
    </div>
  );
}
