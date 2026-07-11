import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

const title = "Privacy Policy | Apertos Fightwear";
const description =
  "How Apertos Fightwear collects, uses, and protects your personal information when you shop with us.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/privacy-policy") }
};

const sections = [
  {
    heading: "Who We Are",
    body: "Apertos Fightwear is a UK-based combat sports brand selling performance fightwear online at apertosfightwear.com. For any privacy-related questions contact us at orders@apertosfightwear.com."
  },
  {
    heading: "What We Collect",
    body: "When you place an order we collect your name, email address, shipping address, and phone number (optional). Payment details are processed directly by Stripe — we never see or store your card number, CVC, or full payment credentials."
  },
  {
    heading: "How We Use Your Information",
    body: "Your details are used solely to fulfil and communicate about your order. This includes sending an order confirmation email, passing your shipping address to our logistics partners to dispatch your goods, and contacting you if there is a problem with your order. We do not sell or share your data with any third party for marketing purposes."
  },
  {
    heading: "Third Parties We Share Data With",
    body: "To fulfil your order we share the minimum required information with the following services: Stripe (payment processing), ShipEngine (shipping rates and label generation for stocked items), Tapstitch (print-on-demand fulfilment for hoodie orders — your name and shipping address are passed to them to dispatch your item), and Resend (transactional email delivery). All third parties are bound by their own data protection policies and are used only as necessary to complete your purchase."
  },
  {
    heading: "Cookies & Analytics",
    body: "Our site uses only essential cookies required for the shopping cart and checkout process. We do not currently use advertising cookies or third-party tracking pixels. We may use anonymised page-view analytics to improve the site experience."
  },
  {
    heading: "Data Retention",
    body: "Order records are retained for a minimum of six years in line with UK HMRC requirements. If you would like your data removed beyond what is legally required, please contact us at orders@apertosfightwear.com and we will respond within 30 days."
  },
  {
    heading: "Your Rights",
    body: "Under UK GDPR you have the right to access, correct, or delete the personal data we hold about you, the right to object to processing, and the right to data portability. To exercise any of these rights contact orders@apertosfightwear.com. You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk."
  },
  {
    heading: "Security",
    body: "All data in transit is encrypted via HTTPS. Payments are handled by Stripe, which is PCI-DSS Level 1 certified. We do not store payment card data on our own systems."
  },
  {
    heading: "Changes to This Policy",
    body: "We may update this policy from time to time. The current version will always be available at this URL. Material changes will be communicated via email to customers who have placed an order with us."
  }
];

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-12 pb-24">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Legal</p>
        <h1 className="font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">Privacy Policy</h1>
        <p className="text-sm uppercase leading-7 tracking-[0.2em] text-neutral-400">
          Last updated: July 2025
        </p>
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.heading} className="space-y-3 border-t border-white/10 pt-8">
            <h2 className="font-display text-lg uppercase tracking-[0.08em]">{section.heading}</h2>
            <p className="text-sm leading-7 tracking-[0.1em] text-neutral-300">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
