import { createFileRoute } from "@tanstack/react-router";
import SmoothTab from "@/components/ui/animated-tab-card";
import { Button } from "@/components/ui/button";
import {
  Store,
  Bike,
  ShieldCheck,
  ArrowRight,
  Star,
  ShoppingBag,
  Truck,
  Smile,
} from "lucide-react";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "MarketUp — Wholesale grocery delivery for sari-sari stores" },
      {
        name: "description",
        content:
          "MarketUp helps sari-sari stores order wholesale groceries with fast delivery. One app for store owners, riders, and admins.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      <header className="sticky top-0 z-50 border-b border-amber-200/50 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/marketup-logo.jpg" alt="MarketUp" className="h-12 w-12 rounded-lg object-cover object-[35%_center] shadow-sm" />
            <span className="text-lg font-bold tracking-tight text-gray-800">
              MarketUp
            </span>
          </div>
          <nav className="flex items-center gap-4 text-sm text-gray-600">
            <a href="#features" className="hover:text-orange-500 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-orange-500 transition-colors">
              How It Works
            </a>
            <Button
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-sm"
              asChild
            >
              <a href="/">Open App</a>
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50 via-amber-50/30 to-[#FFFDF7]" />
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-br from-orange-200/30 to-amber-200/20 blur-3xl" />
        <div className="relative">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm text-amber-700 shadow-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            Trusted by 100+ sari-sari stores
          </div>
          <h1 className="mt-6 text-5xl font-extrabold tracking-tight md:text-7xl">
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
              MarketUp
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-xl font-medium text-gray-700 md:text-2xl">
            Wholesale grocery delivery for{" "}
            <span className="text-orange-500">sari-sari stores</span>
          </p>
          <p className="mt-3 max-w-xl text-sm text-gray-500">
            Order wholesale groceries, earn as a rider, or manage everything from
            one platform.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-orange-200 transition-all hover:shadow-xl hover:shadow-orange-300">
              Download App
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              className="border-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 px-8 py-6 text-lg rounded-xl"
              asChild
            >
              <a href="#features">Learn More</a>
            </Button>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-8 text-center">
            <div className="rounded-2xl bg-white/70 px-6 py-4 shadow-sm ring-1 ring-amber-100">
              <div className="text-2xl font-bold text-orange-500">500+</div>
              <div className="text-sm text-gray-500">Products</div>
            </div>
            <div className="rounded-2xl bg-white/70 px-6 py-4 shadow-sm ring-1 ring-amber-100">
              <div className="text-2xl font-bold text-orange-500">100+</div>
              <div className="text-sm text-gray-500">Store Partners</div>
            </div>
            <div className="rounded-2xl bg-white/70 px-6 py-4 shadow-sm ring-1 ring-amber-100">
              <div className="text-2xl font-bold text-orange-500">50+</div>
              <div className="text-sm text-gray-500">Riders</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-orange-50/30 to-white" />
        <div className="relative mx-auto max-w-4xl">
          <div className="text-center">
            <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-600">
              One App
            </span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              Three Ways to Win.
            </h2>
            <p className="mt-2 text-gray-500">
              Whether you own a store, deliver goods, or run operations — MarketUp
              works for you.
            </p>
          </div>
          <div className="mt-12">
            <SmoothTab />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-amber-50/20 to-[#FFFDF7]" />
        <div className="relative mx-auto max-w-4xl">
          <div className="text-center">
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-600">
              Quick Start
            </span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-2 text-gray-500">
              Getting started is easy. Just follow these steps.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            {steps.map((step, i) => (
              <div key={i} className="group relative text-center">
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-xl font-bold text-white shadow-lg shadow-orange-200 transition-all group-hover:shadow-xl group-hover:shadow-orange-300 group-hover:scale-105">
                  {i + 1}
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-800">{step.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative mx-auto max-w-2xl text-center text-white">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="mt-3 text-amber-100">
            Join the growing network of sari-sari stores, riders, and admins.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl shadow-lg shadow-black/10">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Download App
            </Button>
            <Button
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl"
              asChild
            >
              <a href="/">Open App</a>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-amber-200/50 bg-[#FFFDF7] py-12 px-4">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <div className="flex items-center gap-2">
              <img src="/marketup-logo.jpg" alt="MarketUp" className="h-12 w-12 rounded-lg object-cover object-[35%_center] shadow-sm" />
              <span className="text-lg font-bold tracking-tight text-gray-800">
                MarketUp
              </span>
            </div>
            <p className="flex items-center gap-1 text-sm text-gray-400">
              <Smile className="h-4 w-4" />
              Built for sari-sari stores in the Philippines
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div>
              <h4 className="mb-2 font-semibold text-gray-800">Product</h4>
              <ul className="space-y-1.5 text-gray-500">
                <li><a href="#features" className="hover:text-orange-500 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-orange-500 transition-colors">How It Works</a></li>
                <li><a href="/" className="hover:text-orange-500 transition-colors">Shop</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-gray-800">Company</h4>
              <ul className="space-y-1.5 text-gray-500">
                <li><a href="#about" className="hover:text-orange-500 transition-colors">About</a></li>
                <li><span className="text-gray-400">Contact</span></li>
                <li><span className="text-gray-400">Privacy</span></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-gray-800">For</h4>
              <ul className="space-y-1.5 text-gray-500">
                <li><a href="/" className="hover:text-orange-500 transition-colors">Store Owners</a></li>
                <li><a href="/rider" className="hover:text-orange-500 transition-colors">Riders</a></li>
                <li><a href="/admin" className="hover:text-orange-500 transition-colors">Admins</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-gray-400 md:text-right">
            <p>&copy; 2026 MarketUp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const steps = [
  { title: "Sign Up", desc: "Create your free account", icon: Smile },
  { title: "Browse Products", desc: "Explore wholesale items", icon: ShoppingBag },
  { title: "Place Order", desc: "Order what you need", icon: Truck },
  { title: "Track Delivery", desc: "Follow in real-time", icon: Store },
];
