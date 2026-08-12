import { useState } from "react";
import { Calendar, Check, LogOut, Mail, MapPin, Pencil, Phone, Star, TrendingUp, Truck, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useMock } from "@/contexts/MockContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatPeso } from "@/lib/mockData";
import { toast } from "sonner";

export function RiderProfile() {
  const { currentUser, orders, updateUserProfile } = useMock();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);

  const delivered = orders.filter((o) => o.rider_id === currentUser.id && o.status === "delivered");
  const completedCount = delivered.length;
  const totalEarnings = delivered.reduce((s, d) => s + d.delivery_fee, 0);
  const rating = 5.0;

  const memberSince = currentUser.created_at
    ? new Date(currentUser.created_at).toLocaleDateString("en-PH", { month: "long", year: "numeric" })
    : "2026";

  const startEditing = () => {
    setName(currentUser.name);
    setEmail(currentUser.email);
    setPhone(currentUser.phone);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    updateUserProfile(currentUser.id, {
      name: name.trim(),
      email: email.trim() || currentUser.email,
      phone: phone.trim(),
    });
    setIsEditing(false);
    toast.success("Profile updated");
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400";
  const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500";

  return (
    <div className="space-y-5">
      {/* Profile header */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-blue-500 p-6 text-white shadow-lg shadow-blue-600/20">
        <div className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 text-3xl font-bold ring-2 ring-white/30 backdrop-blur-sm">
            {currentUser.avatar_url ? (
              <img src={currentUser.avatar_url} alt={currentUser.name} className="h-full w-full object-cover" />
            ) : (
              currentUser.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold">{currentUser.name}</h1>
            <p className="truncate text-sm text-blue-100">{currentUser.email}</p>
            {currentUser.phone && (
              <p className="mt-1 flex items-center gap-1 text-xs text-blue-100">
                <Phone className="h-3 w-3" /> {currentUser.phone}
              </p>
            )}
            <p className="mt-1 flex items-center gap-1 text-xs text-blue-100">
              <Calendar className="h-3 w-3" /> Rider since {memberSince}
            </p>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-3 divide-x divide-white/15 rounded-xl bg-white/10 py-3 text-center backdrop-blur-sm">
          <div>
            <div className="mx-auto flex items-center justify-center gap-1 text-blue-100">
              <Truck className="h-3.5 w-3.5" />
            </div>
            <p className="mt-0.5 text-lg font-bold">{completedCount}</p>
            <p className="text-[10px] font-medium text-blue-100">Deliveries</p>
          </div>
          <div>
            <div className="mx-auto flex items-center justify-center gap-1 text-blue-100">
              <Star className="h-3.5 w-3.5 fill-blue-100" />
            </div>
            <p className="mt-0.5 text-lg font-bold">{rating.toFixed(1)}</p>
            <p className="text-[10px] font-medium text-blue-100">Rating</p>
          </div>
          <div>
            <div className="mx-auto flex items-center justify-center gap-1 text-blue-100">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <p className="mt-0.5 text-lg font-bold">{formatPeso(totalEarnings)}</p>
            <p className="text-[10px] font-medium text-blue-100">Earnings</p>
          </div>
        </div>
      </section>

      {/* Account details / edit form */}
      {isEditing ? (
        <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <Pencil className="h-4 w-4 text-blue-600" /> Edit profile
          </h2>
          <div className="space-y-3">
            <label className="block">
              <span className={labelCls}>Full name</span>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </label>
            <label className="block">
              <span className={labelCls}>Email</span>
              <input
                type="email"
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
              />
            </label>
            <label className="block">
              <span className={labelCls}>Phone number</span>
              <input
                type="tel"
                className={inputCls}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </label>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.98]"
            >
              <Check className="h-4 w-4" /> Save Changes
            </button>
          </div>
        </section>
      ) : (
        <section className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between p-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <Mail className="h-4 w-4 text-blue-600" /> Account details
            </h2>
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              <Pencil className="h-3 w-3" /> Edit
            </button>
          </div>
          <InfoRow icon={Mail} label="Email" value={currentUser.email} />
          <InfoRow icon={Phone} label="Phone" value={currentUser.phone || "—"} />
          <InfoRow icon={MapPin} label="Address" value={currentUser.address || "—"} />
        </section>
      )}

      {/* Log out */}
      <button
        type="button"
        onClick={() => {
          logout("rider");
          navigate({ to: "/rider/login" });
        }}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white py-3.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 active:scale-[0.99]"
      >
        <LogOut className="h-4 w-4" /> Log out
      </button>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="truncate text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}
