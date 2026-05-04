import type { Metadata } from "next";
import { ProductGrid } from "@/components/products/product-grid";
import { products } from "@/lib/products";
import { absoluteUrl } from "@/lib/site";

const shopTitle = "Apertos Fightwear | BJJ Rash Guards, MMA Shorts & No-Gi Sets UK";
const shopDescription =
  "Shop Apertos Fightwear — premium BJJ rash guards, MMA shorts and no-gi sets built for grappling, judo and high-output combat sports training. UK-based fightwear brand.";
const shopKeywords = [
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
  "apertos fightwear",
  "bjj clothing uk",
  "mma clothing uk",
  "no gi bjj uk",
  "grappling gear uk",
  "bjj rash guard uk",
  "mma gear uk",
  "no gi fightwear",
  "bjj training gear",
  "combat sports apparel uk"
];

export const metadata: Metadata = {
  title: {
    absolute: shopTitle
  },
  description: shopDescription,
  keywords: shopKeywords,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  },
  alternates: {
    canonical: absoluteUrl("/shop")
  },
  openGraph: {
    title: shopTitle,
    description: shopDescription,
    url: absoluteUrl("/shop"),
    type: "website",
    images: [
      {
        url: absoluteUrl("/products/nogi-lifestyle.jpeg"),
        width: 1200,
        height: 1800,
        alt: "Apertos Fightwear — BJJ rash guards, MMA shorts and no-gi sets"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: shopTitle,
    description: shopDescription,
    images: [absoluteUrl("/products/nogi-lifestyle.jpeg")]
  }
};

export default function ShopPage() {
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "SportingGoodsStore",
    name: "Apertos Fightwear",
    description: shopDescription,
    url: absoluteUrl("/shop"),
    image: absoluteUrl("/products/nogi-lifestyle.jpeg"),
    priceRange: "££",
    currenciesAccepted: "GBP",
    paymentAccepted: "Credit Card",
    areaServed: [
      { "@type": "Country", name: "United Kingdom" },
      { "@type": "Country", name: "Ireland" },
      { "@type": "Country", name: "United States" },
      { "@type": "Country", name: "Canada" },
      { "@type": "Country", name: "Germany" },
      { "@type": "Country", name: "France" }
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Apertos Fightwear Product Range",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "BJJ Rash Guards",
          description:
            "Compression-style BJJ rash guards built for no-gi drilling, mat durability and clean performance fit."
        },
        {
          "@type": "OfferCatalog",
          name: "MMA Shorts",
          description:
            "Lightweight MMA shorts made for grappling movement, sparring comfort and everyday combat sports training."
        },
        {
          "@type": "OfferCatalog",
          name: "No-Gi Sets",
          description:
            "Matching no-gi sets that pair rash guards and shorts for athletes who want a complete premium fightwear look."
        }
      ]
    },
    sameAs: [
      "https://www.tiktok.com/@apertos.fightwear",
      "https://instagram.com/apertos.fightwear"
    ]
  };

  return (
    <div className="space-y-10 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />

      {/* Hero — description lives here, not floating above cards */}
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-12">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Shop</p>
        <h1 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">
          The Apertos Collection
        </h1>
      </div>

      {/* Category cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-display text-2xl uppercase tracking-[0.08em]">Rash Guards</h2>
          <p className="mt-3 text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">
            Compression-style BJJ rash guards built for no-gi drilling, mat durability and clean
            performance fit.
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-display text-2xl uppercase tracking-[0.08em]">MMA Shorts</h2>
          <p className="mt-3 text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">
            Lightweight MMA shorts made for grappling movement, sparring comfort and everyday
            combat sports training.
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-display text-2xl uppercase tracking-[0.08em]">No-Gi Sets</h2>
          <p className="mt-3 text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">
            Matching no-gi sets that pair rash guards and shorts for athletes who want a complete
            premium fightwear look.
          </p>
        </div>
      </div>

      {/* Products */}
      <ProductGrid products={products} />
    </div>
  );
}
