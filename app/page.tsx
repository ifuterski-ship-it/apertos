import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Layers, Ruler, Zap } from "lucide-react";
import { ProductGrid } from "@/components/products/product-grid";
import { getFeaturedProducts } from "@/lib/products";
import { absoluteUrl, siteKeywords } from "@/lib/site";

const homepageTitle = "Apertos Fightwear | BJJ Rash Guards, MMA Shorts & No-Gi Sets";
const homepageDescription =
  "Apertos Fightwear makes compression-style BJJ rash guards, lightweight MMA shorts, and matching no-gi sets built for grappling, striking, and high-output training.";
const homepageKeywords = [
  ...siteKeywords,
  "bjj rash guard",
  "no gi rash guard",
  "mma shorts",
  "bjj shorts",
  "judo rashguard",
  "no-gi sets",
  "fightwear uk",
  "bjj gear uk",
  "grappling shorts",
  "compression rash guard bjj",
  "bjj clothing uk",
  "mma clothing uk",
  "no gi bjj uk",
  "grappling gear uk",
  "bjj rash guard uk",
  "mma gear uk",
  "bjj training gear",
  "combat sports apparel uk",
  "no gi training"
];

export const metadata: Metadata = {
  title: { absolute: homepageTitle },
  description: homepageDescription,
  keywords: homepageKeywords,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: homepageTitle,
    description: "Premium fightwear designed for grapplers, strikers, and combat sports athletes.",
    url: absoluteUrl("/"),
    type: "website",
    siteName: "Apertos Fightwear",
    locale: "en_GB",
    images: [{ url: absoluteUrl("/products/nogi-lifestyle.jpeg"), width: 1200, height: 1800, alt: "Apertos Fightwear no-gi set" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Apertos Fightwear | BJJ & MMA Gear",
    description: "Compression rash guards, MMA shorts, and no-gi sets built for high-output training.",
    images: [absoluteUrl("/products/nogi-lifestyle.jpeg")]
  }
};

const faqItems = [
  {
    question: "What Is Apertos Fightwear?",
    answer:
      "Apertos Fightwear is a premium combat sports brand offering BJJ rash guards, MMA fight shorts, and matching no-gi sets. All products are engineered for high-output grappling and striking training."
  },
  {
    question: "What Sports Is Apertos Gear Designed For?",
    answer:
      "Apertos gear is designed for Brazilian Jiu-Jitsu (BJJ), MMA, no-gi grappling, Muay Thai cross-training, and general combat sports conditioning."
  },
  {
    question: "What Sizes Do You Stock?",
    answer:
      "Apertos Fightwear is available in sizes S through 2XL across all product categories. Size charts are available on each product page."
  },
  {
    question: "How Do I Care For Apertos Rash Guards And Shorts?",
    answer:
      "Machine wash cold with similar colours. Turn inside out before washing. Tumble dry low or hang to dry. Do not use bleach or fabric softener."
  },
  {
    question: "Do You Ship Internationally?",
    answer:
      "Yes. Apertos Fightwear ships worldwide. Delivery times and shipping rates are calculated at checkout based on your location."
  }
];

const featureCards = [
  {
    icon: Layers,
    title: "Fabric",
    description: "85% polyester, 15% spandex — 4-way stretch, moisture-wicking performance material built for hard rounds and mat durability."
  },
  {
    icon: Ruler,
    title: "Fit",
    description: "Compression-cut for maximum movement, locked-in feel and zero bunching under the gi or during scrambles."
  },
  {
    icon: Zap,
    title: "Design",
    description: "Clean monochrome silhouette engineered for competition focus. Sharp lines, zero excess."
  }
];

export default function HomePage() {
  const featuredProducts = getFeaturedProducts();

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Apertos Fightwear",
    url: "https://apertosfightwear.com",
    description: "Premium BJJ rash guards, MMA shorts, and no-gi sets engineered for grapplers, strikers, and high-output combat sports athletes.",
    logo: absoluteUrl("/logo-mark.png"),
    email: "info@apertosfightwear.com",
    sameAs: ["https://instagram.com/apertos.fightwear", "https://www.tiktok.com/@apertos.fightwear"]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Apertos Fightwear",
    url: "https://apertosfightwear.com",
    description: homepageDescription
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  };

  return (
    <div className="space-y-20 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ── Hero ── */}
      <section className="relative -mx-4 overflow-hidden sm:-mx-6 lg:-mx-8">
        <div className="relative min-h-[88vh] flex items-center">
          <Image
            src="/products/nogi-lifestyle.jpeg"
            alt="BJJ athlete wearing Apertos Fightwear no-gi set"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/55 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <p className="mb-5 text-[11px] uppercase tracking-[0.55em] text-crimson">
              Apertos Fightwear — Premium Combat Sports
            </p>
            <h1 className="font-display text-6xl uppercase leading-none tracking-[0.04em] text-crimson sm:text-7xl md:text-8xl lg:text-9xl">
              Premium No-Gi.<br />Built For<br />Scrambles.
            </h1>
            <p className="mt-8 max-w-md text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
              BJJ rash guards, MMA shorts and no-gi sets engineered for grapplers who train seriously.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center bg-crimson px-7 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-crimson/85"
              >
                Shop Performance Gear
              </Link>
              <Link
                href="/product/apertos-essential-hoodie"
                className="inline-flex items-center border border-crimson px-7 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-crimson/10"
              >
                Shop Lifestyle &amp; Accessories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="grid gap-5 md:grid-cols-3">
        {featureCards.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-[1.75rem] border border-white/10 bg-panel p-8 space-y-5"
          >
            <Icon className="h-8 w-8 text-white/70" strokeWidth={1.5} />
            <h3 className="font-display text-2xl uppercase tracking-[0.15em]">{title}</h3>
            <p className="text-sm uppercase leading-7 tracking-[0.18em] text-neutral-400">{description}</p>
          </div>
        ))}
      </section>

      {/* ── Featured products ── */}
      <section className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.55em] text-crimson">Collection</p>
          <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">
            The Apertos Collection
          </h2>
        </div>
        <ProductGrid products={featuredProducts} />
      </section>

      {/* ── Category links ── */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/shop/rash-guards", label: "Rash Guards", eyebrow: "Performance Top" },
          { href: "/shop/mma-shorts", label: "MMA Shorts", eyebrow: "Training Bottoms" },
          { href: "/shop/no-gi-sets", label: "No-Gi Sets", eyebrow: "Bundle" },
          { href: "/shop/apparel", label: "Apparel & Accessories", eyebrow: "Lifestyle" }
        ].map(({ href, label, eyebrow }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center justify-between rounded-[1.75rem] border border-white/10 bg-panel p-7 transition hover:border-crimson/40 hover:bg-panel/80"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.45em] text-crimson">{eyebrow}</p>
              <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.08em]">{label}</h2>
            </div>
            <span className="text-xl text-neutral-600 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-crimson">
              →
            </span>
          </Link>
        ))}
      </section>

      {/* ── Lifestyle image — no-gi set ── */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="relative min-h-[520px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-black">
          <Image
            src="/products/nogi-lifestyle.jpeg"
            alt="BJJ athlete wearing Apertos Fightwear no-gi set"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-panel p-8 md:p-12">
          <div className="flex h-full flex-col justify-center space-y-6">
            <p className="text-[10px] uppercase tracking-[0.55em] text-crimson">On The Mat</p>
            <h2 className="font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">
              Built To Look Sharp Under Pressure
            </h2>
            <p className="max-w-md text-sm uppercase leading-7 tracking-[0.22em] text-neutral-400">
              The original no-gi set worn the way it was designed to feel — clean lines, locked-in movement, and a competition-ready silhouette.
            </p>
            <Link
              href="/product/apertos-the-original-no-gi-set"
              className="inline-flex w-fit items-center bg-crimson px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-crimson/85"
            >
              View The Set
            </Link>
          </div>
        </div>
      </section>

      {/* ── Lifestyle image — training ── */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-panel p-8 md:p-12">
          <div className="flex h-full flex-col justify-center space-y-6">
            <p className="text-[10px] uppercase tracking-[0.55em] text-crimson">Movement</p>
            <h2 className="font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">
              Designed For Scrambles, Pressure And Control
            </h2>
            <p className="max-w-md text-sm uppercase leading-7 tracking-[0.22em] text-neutral-400">
              Every seam, panel and silhouette is built to stay composed when the pace changes.
            </p>
            <Link
              href="/shop"
              className="inline-flex w-fit items-center border border-crimson px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-crimson/10"
            >
              Shop The Collection
            </Link>
          </div>
        </div>
        <div className="relative min-h-[520px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-black">
          <Image
            src="/products/nogi-lifestyle-2.jpeg"
            alt="BJJ athlete training in Apertos Fightwear no-gi set"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.55em] text-crimson">FAQ</p>
          <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <div key={item.question} className="rounded-[1.5rem] border border-white/10 bg-panel p-7">
              <h3 className="font-display text-xl uppercase tracking-[0.08em]">{item.question}</h3>
              <p className="mt-4 text-sm uppercase leading-7 tracking-[0.18em] text-neutral-400">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social ── */}
      <section className="rounded-[1.75rem] border border-white/10 bg-panel px-6 py-16 text-center md:px-12">
        <p className="text-[10px] uppercase tracking-[0.55em] text-crimson">Follow Us</p>
        <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">
          Follow Us On The Mat
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-400">
          See how athletes are training in Apertos gear. Follow us on TikTok for behind-the-scenes, training clips, and new drops.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://www.tiktok.com/@apertos.fightwear"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center bg-crimson px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-crimson/85"
          >
            TikTok @apertos.fightwear
          </a>
          <a
            href="https://instagram.com/apertos.fightwear"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.35em] transition hover:border-white hover:text-white"
          >
            Instagram @apertos.fightwear
          </a>
        </div>
      </section>
    </div>
  );
}
