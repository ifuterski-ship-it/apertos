import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProductGrid } from "@/components/products/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
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
  title: {
    absolute: homepageTitle
  },
  description: homepageDescription,
  keywords: homepageKeywords,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  },
  alternates: {
    canonical: absoluteUrl("/")
  },
  openGraph: {
    title: homepageTitle,
    description:
      "Premium fightwear designed for grapplers, strikers, and combat sports athletes. Shop rash guards, MMA shorts, and no-gi sets at apertosfightwear.com",
    url: absoluteUrl("/"),
    type: "website",
    siteName: "Apertos Fightwear",
    locale: "en_GB",
    images: [
      {
        url: absoluteUrl("/products/nogi-lifestyle.jpeg"),
        width: 1200,
        height: 1800,
        alt: "Apertos Fightwear no-gi set — rash guard and shorts"
      }
    ]
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
      "Apertos Fightwear is available in sizes XS through 3XL across all product categories. Size charts are available on each product page."
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

export default function HomePage() {
  const featuredProducts = getFeaturedProducts();

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Apertos Fightwear",
    url: "https://apertosfightwear.com",
    description:
      "Premium BJJ rash guards, MMA shorts, and no-gi sets engineered for grapplers, strikers, and high-output combat sports athletes.",
    logo: absoluteUrl("/logo-mark.png"),
    email: "info@apertosfightwear.com",
    sameAs: ["https://instagram.com/apertos.fightwear", "https://www.tiktok.com/@apertos.fightwear"]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Apertos Fightwear",
    url: "https://apertosfightwear.com",
    description: homepageDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: "https://apertosfightwear.com/shop?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return (
    <div className="space-y-24 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-panel/70 px-6 py-20 shadow-luxe md:px-10 md:py-28">
        <div className="absolute inset-0 bg-grain opacity-80" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <div className="absolute -right-10 top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 opacity-[0.09] lg:block">
          <Image src="/logo-mark.png" alt="" fill sizes="420px" className="object-contain" />
        </div>
        <div className="relative mx-auto flex max-w-4xl animate-float-in flex-col items-center space-y-8 text-center">
          <div className="space-y-5">
            <div className="mx-auto relative h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-black shadow-luxe">
              <Image
                src="/logo-mark.png"
                alt="Apertos Fightwear logo"
                fill
                sizes="96px"
                className="object-cover opacity-90"
              />
            </div>
            <p className="text-sm uppercase tracking-[0.5em] text-muted">Premium Combat Sports</p>
            <h1 className="font-display text-5xl uppercase leading-none tracking-[0.08em] md:text-7xl">
              Apertos Fightwear — BJJ &amp; MMA Gear Built For High-Output Training
            </h1>
            <p className="mx-auto max-w-3xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
              Apertos Fightwear is a premium combat sports brand offering compression-style BJJ rash
              guards, lightweight MMA fight shorts, and matching no-gi sets. Every piece is engineered
              for mat durability, full range of motion, and clean performance fit — built for grapplers,
              strikers, and athletes who train seriously.
            </p>
          </div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-neutral-500">
            Trusted by grapplers across the UK
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center border border-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Discipline */}
      <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-12">
          <SectionHeading
            eyebrow="Discipline"
            title="Built For Athletes Who Perform Under Pressure"
            description="Precision-cut essentials, engineered for the ritual of hard rounds, sharp focus, and quiet confidence."
          />
        </div>
        <div className="relative flex items-end overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent p-8">
          <div className="absolute right-0 top-0 h-36 w-36 opacity-[0.08]">
            <Image src="/logo-mark.png" alt="" fill sizes="144px" className="object-contain" />
          </div>
          <p className="relative text-sm uppercase leading-7 tracking-[0.28em] text-neutral-300">
            Minimal silhouettes. Competition-ready function. A premium uniform for training days and fight nights.
          </p>
        </div>
      </section>

      {/* Featured products */}
      <section className="space-y-8">
        <SectionHeading
          eyebrow="Featured"
          title="The Original Collection"
          description="Premium BJJ rash guards, MMA shorts and no-gi sets designed to keep the storefront clean, focused, and ready to ship."
        />
        <ProductGrid products={featuredProducts} />
      </section>

      {/* Category cards — stripped to title + arrow, link to collection pages */}
      <section className="grid gap-6 lg:grid-cols-3">
        {[
          { href: "/shop/rash-guards", label: "Rash Guards", eyebrow: "Performance Top" },
          { href: "/shop/mma-shorts", label: "MMA Shorts", eyebrow: "Training Bottoms" },
          { href: "/shop/no-gi-sets", label: "No-Gi Sets", eyebrow: "Bundle" }
        ].map(({ href, label, eyebrow }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center justify-between rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 transition hover:border-white/30 hover:bg-white/[0.06]"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-muted">{eyebrow}</p>
              <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.08em]">{label}</h2>
            </div>
            <span className="text-2xl text-neutral-500 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white">
              →
            </span>
          </Link>
        ))}
      </section>

      {/* Lifestyle image — no-gi set */}
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-black">
          <Image
            src="/products/nogi-lifestyle.jpeg"
            alt="BJJ athlete wearing Apertos Fightwear no-gi set — matching rash guard and fight shorts"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-12">
          <div className="absolute -right-8 top-0 h-40 w-40 opacity-[0.08]">
            <Image src="/logo-mark.png" alt="" fill sizes="160px" className="object-contain" />
          </div>
          <div className="relative flex h-full flex-col justify-center space-y-6">
            <p className="text-xs uppercase tracking-[0.45em] text-muted">On The Mat</p>
            <h2 className="font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">
              Built To Look Sharp Under Pressure
            </h2>
            <p className="max-w-2xl text-sm uppercase leading-7 tracking-[0.22em] text-neutral-300">
              The original no-gi set worn the way it was designed to feel: clean lines, locked-in movement, and a
              competition-ready silhouette that stands out without losing discipline.
            </p>
            <Link
              href="/product/apertos-the-original-no-gi-set"
              className="inline-flex w-fit items-center border border-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black"
            >
              View The Set
            </Link>
          </div>
        </div>
      </section>

      {/* Lifestyle image — training */}
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-12">
          <div className="absolute -left-10 bottom-0 h-44 w-44 opacity-[0.08]">
            <Image src="/logo-mark.png" alt="" fill sizes="176px" className="object-contain" />
          </div>
          <div className="relative flex h-full flex-col justify-center space-y-6">
            <p className="text-xs uppercase tracking-[0.45em] text-muted">Movement</p>
            <h2 className="font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">
              Designed For Scrambles, Pressure And Control
            </h2>
            <p className="max-w-2xl text-sm uppercase leading-7 tracking-[0.22em] text-neutral-300">
              Every seam, panel and silhouette is built to stay composed when the pace changes. The no-gi set is made
              to move hard and still look refined.
            </p>
            <Link
              href="/shop"
              className="inline-flex w-fit items-center border border-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black"
            >
              Shop The Collection
            </Link>
          </div>
        </div>
        <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-black">
          <Image
            src="/products/nogi-lifestyle-2.jpeg"
            alt="BJJ athlete training in Apertos Fightwear no-gi set during no-gi grappling session"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-muted">FAQ</p>
          <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div
              key={item.question}
              className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8"
            >
              <h3 className="font-display text-xl uppercase tracking-[0.08em]">{item.question}</h3>
              <p className="mt-4 text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Social */}
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-16 text-center md:px-12">
        <p className="text-xs uppercase tracking-[0.5em] text-muted">Follow Us</p>
        <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">
          Follow Us On The Mat
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
          See how athletes are training in Apertos gear. Follow us on TikTok for behind-the-scenes, training clips, and
          new drops.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://www.tiktok.com/@apertos.fightwear"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center border border-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black"
          >
            TikTok @apertos.fightwear
          </a>
          <a
            href="https://instagram.com/apertos.fightwear"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center border border-white/20 px-6 py-3 text-sm uppercase tracking-[0.35em] transition hover:border-white hover:text-white"
          >
            Instagram @apertos.fightwear
          </a>
        </div>
      </section>
    </div>
  );
}
