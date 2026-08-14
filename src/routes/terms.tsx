import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/profile" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Terms of Service</h1>
      </div>

      <div className="prose prose-gray max-w-3xl mx-auto space-y-6">
        <p className="text-sm text-gray-500">Last updated: August 13, 2026</p>

        <section>
          <h2 className="text-lg font-semibold text-gray-800">1. Acceptance of Terms</h2>
          <p>
            By accessing and using MarketUp ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800">2. Description of Service</h2>
          <p>
            MarketUp is a wholesale marketplace connecting sari-sari store owners with suppliers. The Platform facilitates browsing products, placing orders, and managing deliveries. We do not manufacture the products listed; we act as an intermediary between buyers and verified suppliers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800">3. User Accounts</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You must provide accurate, current, and complete information during registration.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You must notify us immediately of any unauthorized use of your account.</li>
            <li>You must be at least 18 years old to create an account.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800">4. Orders and Payments</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>All orders are subject to product availability and price verification.</li>
            <li>Payment methods: Cash on Delivery (COD) and GCash.</li>
            <li>Delivery fees apply as shown at checkout (₱49 per order).</li>
            <li>Prices displayed are wholesale prices for registered sari-sari store owners.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800">5. Delivery and Fulfillment</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Delivery times are estimates and not guaranteed.</li>
            <li>Risk of loss passes to you upon delivery to the specified address.</li>
            <li>Failed deliveries may be rescheduled; additional fees may apply for repeated failures.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800">6. Returns and Refunds</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Damaged or incorrect items must be reported within 24 hours of delivery.</li>
            <li>Refunds are processed to the original payment method or as store credit.</li>
            <li>Perishable goods and opened items may not be eligible for return.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800">7. Prohibited Activities</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Reselling products outside your registered sari-sari store location.</li>
            <li>Fraudulent orders, chargeback abuse, or payment fraud.</li>
            <li>Harassment of riders, support staff, or other users.</li>
            <li>Attempting to reverse-engineer or scrape the Platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800">8. Intellectual Property</h2>
          <p>
            All content, trademarks, and data on the Platform are the property of MarketUp or its licensors. You may not reproduce, distribute, or create derivative works without written permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800">9. Limitation of Liability</h2>
          <p>
            MarketUp is not liable for indirect, incidental, or consequential damages arising from use of the Platform. Our total liability shall not exceed the total amount paid by you in the 12 months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800">10. Termination</h2>
          <p>
            We may suspend or terminate your access to the Platform for violations of these Terms. Upon termination, your right to use the Platform immediately ceases.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800">11. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the Republic of the Philippines. Disputes shall be resolved in the courts of Quezon City, Metro Manila.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800">12. Changes to Terms</h2>
          <p>
            We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance. Material changes will be communicated via email or in-app notification.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800">13. Contact Us</h2>
          <p>
            For questions about these Terms, contact us through the <Link to="/support" className="text-emerald-600 hover:underline">Support</Link> page in your profile.
          </p>
        </section>
      </div>
    </div>
  );
}