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
  title: { absolute: shopTitle },
  description: shopDescription,
  keywords: shopKeywords,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: absoluteUrl("/shop") },
  openGraph: {
    title: shopTitle,
    description: shopDescription,
    url: absoluteUrl("/shop"),
    type: "website",
    images: [{ url: absoluteUrl("/products/nogi-lifestyle.jpeg"), width: 1200, height: 1800, alt: "Apertos Fightwear — BJJ rash guards, MMA shorts and no-gi sets" }]
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
        { "@type": "OfferCatalog", name: "BJJ Rash Guards", description: "Compression-style BJJ rash guards built for no-gi drilling, mat durability and clean performance fit." },
        { "@type": "OfferCatalog", name: "MMA Shorts", description: "Lightweight MMA shorts made for grappling movement, sparring comfort and everyday combat sports training." },
        { "@type": "OfferCatalog", name: "No-Gi Sets", description: "Matching no-gi sets that pair rash guards and shorts for athletes who want a complete premium fightwear look." }
      ]
    },
    sameAs: ["https://www.tiktok.com/@apertos.fightwear", "https://instagram.com/apertos.fightwear"]
  };

  return (
    <div className="space-y-10 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }} />

      {/* Hero */}
      <div className="py-10 text-center">
        <h1 className="font-display text-6xl uppercase tracking-[0.06em] text-white sm:text-7xl md:text-8xl lg:text-9xl">
          The Apertos<br />Collection
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-sm uppercase leading-7 tracking-[0.22em] text-neutral-400">
          Premium BJJ rash guards, MMA shorts and no-gi sets built for grapplers who train seriously.
        </p>
      </div>

      {/* Products */}
      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.55em] text-crimson">All Products</p>
        <ProductGrid products={products} />
      </div>

      {/* Category cards — below products for SEO */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Rash Guards", desc: "Compression-style BJJ rash guards built for no-gi drilling, mat durability and clean performance fit." },
          { title: "MMA Shorts", desc: "Lightweight MMA shorts made for grappling movement, sparring comfort and everyday combat sports training." },
          { title: "No-Gi Sets", desc: "Matching no-gi sets that pair rash guards and shorts for athletes who want a complete premium fightwear look." }
        ].map(({ title, desc }) => (
          <div key={title} className="rounded-[1.5rem] border border-white/10 bg-panel p-6">
            <div className="mb-3 h-0.5 w-8 bg-crimson" />
            <h2 className="font-display text-2xl uppercase tracking-[0.08em]">{title}</h2>
            <p className="mt-3 text-sm uppercase leading-7 tracking-[0.18em] text-neutral-400">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
