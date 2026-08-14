import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, MessageCircle, HelpCircle, Send, AlertCircle, CheckCircle } from "lucide-react";
import { useMock } from "@/contexts/MockContext";
import { toast } from "sonner";

export const Route = createFileRoute("/support")({
  component: SupportPage,
});

const faqs = [
  {
    q: "How do I place an order?",
    a: "Browse products on the Home tab, add items to your cart, then go to Checkout. Choose Cash on Delivery (COD) or GCash, confirm your address, and place the order.",
  },
  {
    q: "What are the delivery fees?",
    a: "A flat ₱49 delivery fee applies to every order, shown at checkout. This covers rider dispatch and transport.",
  },
  {
    q: "Can I change my delivery address after ordering?",
    a: "You can update your address in your Profile. For an order already placed, please contact support immediately via the chat below — we'll try to update it before the rider picks up.",
  },
  {
    q: "How do points work?",
    a: "You earn 1 point for every ₱100 spent. 500 points can be redeemed for a ₱50 off coupon on the Profile page.",
  },
  {
    q: "What if my order arrives damaged or incorrect?",
    a: "Report it within 24 hours of delivery using the chat below. We'll arrange a replacement or refund depending on the issue.",
  },
  {
    q: "How do I cancel an order?",
    a: "On the Orders page, open a pending order and tap Cancel. Once a rider has accepted, you'll need to contact support.",
  },
];

function SupportPage() {
  const { currentUser, sendSupportMessage, supportThreads } = useMock();
  const [messageInput, setMessageInput] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const myThread = supportThreads.find((t) => t.consumer_id === currentUser.id);
  const messages = myThread?.messages ?? [];

  const handleSend = () => {
    const text = messageInput.trim();
    if (!text) return;
    sendSupportMessage(currentUser.id, text);
    setMessageInput("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/profile" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Support</h1>
      </div>

      {/* Help Centre */}
      <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-800">Help Centre</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group rounded-xl border border-gray-200 bg-white"
              open={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <summary className="flex items-center gap-3 p-4 cursor-pointer list-none">
                <p className="flex-1 font-medium text-gray-800">{faq.q}</p>
                <AlertCircle className="h-5 w-5 text-gray-300 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="border-t border-gray-100 px-4 pb-4 text-sm text-gray-600">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Contact Us / Chat */}
      <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-800">Contact Us</h2>
            <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">
              {messages.length === 0 ? "No messages yet" : `${messages.length} message${messages.length !== 1 ? "s" : ""}`}
            </span>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <MessageCircle className="h-12 w-12 text-gray-200" />
              <p className="mt-3 text-gray-500">No conversation yet. Send your first message below.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "admin" ? "justify-start" : "justify-end"}`}
              >
                {msg.sender === "admin" && (
                  <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    msg.sender === "admin"
                      ? "bg-emerald-50 text-gray-800 rounded-bl-sm"
                      : "bg-emerald-600 text-white rounded-br-sm"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`mt-1 text-[10px] ${msg.sender === "admin" ? "text-emerald-300" : "text-emerald-100/70"}`}>
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                </div>
                {msg.sender === "consumer" && (
                  <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-100 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={!messageInput.trim()}
              className="flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 text-center">
            Admin typically replies within business hours. You'll see their response here.
          </p>
        </div>
      </section>
    </div>
  );
}