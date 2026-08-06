import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { absoluteUrl } from "@/lib/site";

const faqTitle = "FAQ | Apertos Fightwear";
const faqDescription =
  "Answers to common questions about Apertos Fightwear — products, sizing, shipping, care, and returns.";

export const metadata: Metadata = {
  title: { absolute: faqTitle },
  description: faqDescription,
  alternates: { canonical: absoluteUrl("/faq") },
  openGraph: {
    title: faqTitle,
    description: faqDescription,
    url: absoluteUrl("/faq"),
    type: "website"
  }
};

const faqSections = [
  {
    section: "Products & Materials",
    items: [
      {
        question: "What material is Apertos gear made from?",
        answer:
          "All Apertos performance products use 85% Polyester, 15% Spandex — a 4-way stretch, moisture-wicking blend built for hard BJJ and MMA training sessions."
      },
      {
        question: "Are Apertos rashguards suitable for no-gi BJJ?",
        answer:
          "Yes. Apertos rashguards are compression-cut for no-gi drilling, live rolling, and hard training. The snug fit reduces fabric grab during scrambles and protects skin during mat contact."
      },
      {
        question: "What is included in the No-Gi Set?",
        answer:
          "The Apertos No-Gi Set includes one matching rashguard and one pair of MMA shorts — both in the same performance fabric and monochrome silhouette."
      },
      {
        question: "Is the Essential Hoodie suitable for mat warm-ups?",
        answer:
          "Yes. The Apertos Essential Hoodie is an 80% Cotton, 20% Polyester heavyweight fleece built for warm-ups, post-session wear, and everyday use. It is not a mat training garment."
      }
    ]
  },
  {
    section: "Sizing & Fit",
    items: [
      {
        question: "How do Apertos rashguards fit?",
        answer:
          "Apertos rashguards are compression-cut. They should feel snug against the body. If you are between sizes, size down. Full size charts are on each product page."
      },
      {
        question: "How do Apertos shorts fit?",
        answer:
          "Apertos shorts have an elastic waistband and are cut for a functional fit with full movement range. Refer to the waist measurements on each product page."
      },
      {
        question: "What sizes are available?",
        answer:
          "S, M, L, XL and 2XL across all categories. Full measurements are listed in the Size Guide on every product page."
      },
      {
        question: "I am between sizes — what should I choose?",
        answer:
          "For rashguards and no-gi sets, size down. The compression fabric stretches to accommodate and the closer fit performs better during training. For shorts, size up if between measurements."
      }
    ]
  },
  {
    section: "Shipping & Delivery",
    items: [
      {
        question: "Do you offer free shipping?",
        answer:
          "Yes. Free UK shipping on orders over £40. Standard UK delivery takes 2–5 working days."
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Yes. Apertos ships worldwide including the EU, US, Canada, and beyond. Costs and delivery times are calculated at checkout."
      },
      {
        question: "Can I track my order?",
        answer:
          "Yes. A tracking link is sent to your email once your order has been dispatched."
      }
    ]
  },
  {
    section: "Care & Washing",
    items: [
      {
        question: "How do I wash Apertos rashguards?",
        answer:
          "Machine wash cold at 30°C. Do not tumble dry. Hang dry. Do not iron the print. Washing inside out helps preserve the finish."
      },
      {
        question: "How do I wash Apertos shorts?",
        answer:
          "Machine wash cold at 30°C. Do not tumble dry. Hang dry. The lightweight fabric dries quickly and holds its shape with cold washes."
      },
      {
        question: "How do I care for the Essential Hoodie?",
        answer:
          "Machine wash cold at 30°C. Tumble dry low or hang dry. Do not iron the print."
      }
    ]
  },
  {
    section: "Returns & Contact",
    items: [
      {
        question: "Where is Apertos Fightwear based?",
        answer:
          "Apertos Fightwear is a UK-based combat sports brand. All orders are dispatched from the UK."
      },
      {
        question: "What is your returns policy?",
        answer:
          "We accept returns on unworn, unwashed items in original condition within 30 days of delivery. Email info@apertosfightwear.com to start a return."
      },
      {
        question: "How do I contact Apertos Fightwear?",
        answer:
          "Email info@apertosfightwear.com. We aim to respond within 1–2 working days."
      }
    ]
  }
];

export default function FAQPage() {
  const allItems = faqSections.flatMap((s) => s.items);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "FAQ", item: absoluteUrl("/faq") }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  };

  return (
    <div className="pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />

      <div className="space-y-12">
        <div>
          <p className="text-xs uppercase tracking-[0.55em] text-crimson">Support</p>
          <h1 className="mt-3 font-display text-5xl uppercase tracking-[0.06em] md:text-7xl">
            Frequently Asked<br />Questions
          </h1>
          <p className="mt-5 max-w-xl text-sm uppercase leading-7 tracking-[0.22em] text-neutral-400">
            Everything you need to know about Apertos Fightwear products, sizing, shipping and care.
          </p>
        </div>

        <div className="space-y-10">
          {faqSections.map((section) => (
            <div key={section.section} className="space-y-3">
              <div className="flex items-center gap-4 pb-1">
                <div className="h-px flex-1 bg-white/10" />
                <p className="text-[10px] uppercase tracking-[0.55em] text-crimson">{section.section}</p>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              {section.items.map((item) => (
                <details key={item.question} className="group rounded-[1.5rem] border border-white/10 bg-white/[0.02]">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5">
                    <h2 className="font-display text-xl uppercase tracking-[0.06em]">{item.question}</h2>
                    <span className="ml-4 shrink-0 text-neutral-500 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-6 pb-5">
                    <p className="text-sm uppercase leading-7 tracking-[0.18em] text-neutral-400">{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          ))}
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-panel px-8 py-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.55em] text-crimson">Still Have Questions?</p>
          <h2 className="mt-3 font-display text-3xl uppercase tracking-[0.08em]">Get In Touch</h2>
          <p className="mx-auto mt-4 max-w-sm text-sm uppercase leading-7 tracking-[0.2em] text-neutral-400">
            Contact us at info@apertosfightwear.com and we will get back to you within 1–2 working days.
          </p>
          <a
            href="mailto:info@apertosfightwear.com"
            className="mt-6 inline-flex items-center bg-crimson px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-crimson/85"
          >
            Email Us
          </a>
        </div>

        <div className="text-center">
          <Link
            href="/shop"
            className="inline-flex items-center border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.35em] transition hover:border-white hover:text-white"
          >
            Shop The Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
