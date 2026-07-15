import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Clock, Wallet, ChevronLeft } from "lucide-react";

import { useMock } from "@/contexts/MockContext";
import { DELIVERY_FEE } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

type DeliveryTime = "asap" | "morning" | "afternoon" | "evening";

const DELIVERY_LABELS: Record<DeliveryTime, string> = {
  asap: "ASAP",
  morning: "Morning (8AM–12PM)",
  afternoon: "Afternoon (12PM–5PM)",
  evening: "Evening (5PM–9PM)",
};

const DELIVERY_ICONS: Record<DeliveryTime, string> = {
  asap: "⚡",
  morning: "🌅",
  afternoon: "☀️",
  evening: "🌙",
};

function CheckoutPage() {
  const { cartItems, cartTotal, createOrder, currentUser } = useMock();
  const navigate = useNavigate();
  const [address, setAddress] = useState(currentUser.address);
  const [phone, setPhone] = useState(currentUser.phone);
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<"cod" | "gcash">("cod");
  const [deliveryTime, setDeliveryTime] = useState<DeliveryTime>("asap");
  const [busy, setBusy] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-gray-500">Your cart is empty.</p>
        <Link to="/" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
          <ChevronLeft className="h-4 w-4" /> Back to shop
        </Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fullNotes = [notes, deliveryTime !== "asap" ? `Preferred delivery: ${DELIVERY_LABELS[deliveryTime]}` : ""]
        .filter(Boolean)
        .join(" | ");
      createOrder(address, phone, payment, fullNotes);
      toast.success("Order placed successfully!");
      navigate({ to: "/orders" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to place order";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-center gap-2">
        <Link to="/cart" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
      </div>

      <section className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Wallet className="h-4 w-4 text-blue-600" /> Order summary
        </h2>
        <div className="space-y-1.5">
          {cartItems.map((c) => (
            <div key={c.product.id} className="flex justify-between text-sm">
              <span className="line-clamp-1 text-gray-600">{c.product.name} × {c.quantity}</span>
              <span className="font-medium text-gray-800">₱{(c.product.wholesale_price * c.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-800">₱{cartTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-gray-500">Delivery fee</span>
            <span className="text-gray-800">₱{DELIVERY_FEE}</span>
          </div>
          <div className="mt-2 flex justify-between text-base font-bold">
            <span className="text-gray-800">Total</span>
            <span className="text-blue-600">₱{(cartTotal + DELIVERY_FEE).toLocaleString()}</span>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <MapPin className="h-4 w-4 text-blue-600" /> Delivery address
        </h2>
        <textarea
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="House/Unit No., Street, Barangay, City, Province"
          rows={2}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
        />
        <input
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Contact phone number"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Delivery notes (e.g., landmark, instructions)"
          rows={2}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
        />
      </section>

      <section className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Clock className="h-4 w-4 text-blue-600" /> Delivery time
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {(["asap", "morning", "afternoon", "evening"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setDeliveryTime(t)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
                deliveryTime === t
                  ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50"
              }`}
            >
              <span className="text-lg">{DELIVERY_ICONS[t]}</span>
              <span>{DELIVERY_LABELS[t]}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Wallet className="h-4 w-4 text-blue-600" /> Payment method
        </h2>
        <label
          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition-all ${
            payment === "cod" ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "border-gray-200 bg-gray-50 hover:border-blue-300"
          }`}
        >
          <input type="radio" name="pm" checked={payment === "cod"} onChange={() => setPayment("cod")} className="h-4 w-4 accent-blue-600" />
          <div>
            <p className="text-sm font-semibold text-gray-800">Cash on Delivery (COD)</p>
            <p className="text-xs text-gray-500">Pay with cash when the rider arrives</p>
          </div>
        </label>
        <label
          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition-all ${
            payment === "gcash" ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "border-gray-200 bg-gray-50 hover:border-blue-300"
          }`}
        >
          <input type="radio" name="pm" checked={payment === "gcash"} onChange={() => setPayment("gcash")} className="h-4 w-4 accent-blue-600" />
          <div>
            <p className="text-sm font-semibold text-gray-800">GCash</p>
            <p className="text-xs text-gray-500">Pay via GCash e-wallet</p>
          </div>
        </label>
      </section>

      <button
        disabled={busy}
        type="submit"
        className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-colors disabled:opacity-60 active:scale-[0.99]"
      >
        {busy ? "Placing order..." : "Place Order — ₱{(cartTotal + DELIVERY_FEE).toLocaleString()}"}
      </button>
    </form>
  );
}
