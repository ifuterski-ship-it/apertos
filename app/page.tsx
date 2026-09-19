import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProductShowcase } from "@/components/products/product-showcase";
import { getSakuraDragonProducts, products } from "@/lib/products";
import { absoluteUrl, siteKeywords } from "@/lib/site";

const homepageTitle = "Apertos Fightwear | BJJ Rash Guards, MMA Shorts & No-Gi Sets";
const homepageDescription =
  "Apertos Fightwear makes compression-style BJJ rash guards, lightweight MMA shorts, and matching no-gi sets built for grappling, striking, and high-output training.";
const homepageKeywords = siteKeywords;

const homeImages = {
  newCollection: "/products/new-collection-hero.jpeg",
  lifestyle: "/products/lifestyle-hoodie.jpeg",
  kids: "/products/kids-hoodie-lifestyle.jpeg",
  sponsoredAthlete: "/fighters/abel-biju.jpg"
};

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

export default function HomePage() {
  const sakuraDragon = getSakuraDragonProducts();
  const kidsProducts = products.filter((p) => p.id === "apertos-kids-hoodie");

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

  return (
    <div className="space-y-20 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />

      {/* ── Hero: New Collection (full screen) ── */}
      <section className="relative -mx-4 -mt-10 flex min-h-[100svh] items-center overflow-hidden sm:-mx-6 lg:-mx-8">
        <Image
          src={homeImages.newCollection}
          alt="Apertos Fightwear new collection"
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <p className="mb-5 text-[11px] uppercase tracking-[0.55em] text-crimson">
            Apertos Fightwear — New Collection
          </p>
          <h1 className="font-display text-5xl uppercase leading-none tracking-[0.04em] text-white sm:text-6xl md:text-7xl lg:text-8xl">
            New Collection
          </h1>
          <p className="mt-6 max-w-md text-sm uppercase leading-7 tracking-[0.2em] text-neutral-200">
            BJJ rash guards, MMA shorts and no-gi sets engineered for grapplers who train seriously.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/shop/new-releases"
              className="inline-flex items-center bg-crimson px-7 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-crimson/85"
            >
              Shop New Releases
            </Link>
            <Link
              href="/shop/apparel"
              className="inline-flex items-center border border-white/25 px-7 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/5"
            >
              Shop Lifestyle
            </Link>
          </div>
        </div>
      </section>

      {/* ── Lifestyle: hoodies ── */}
      <section id="lifestyle" className="scroll-mt-24 grid gap-6 lg:grid-cols-2">
        <div className="relative min-h-[520px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-black">
          <Image
            src={homeImages.lifestyle}
            alt="Apertos lifestyle hoodie"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </div>
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-panel p-8 md:p-12">
          <div className="flex h-full flex-col justify-center space-y-6">
            <p className="text-[10px] uppercase tracking-[0.55em] text-crimson">Lifestyle</p>
            <h2 className="font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">
              Hoodies. Built For Everywhere.
            </h2>
            <p className="max-w-md text-sm uppercase leading-7 tracking-[0.22em] text-neutral-400">
              Heavyweight feel, clean silhouette. Off-the-mat essentials in the Apertos monochrome style.
            </p>
            <Link
              href="/shop/apparel"
              className="inline-flex w-fit items-center bg-crimson px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-crimson/85"
            >
              Shop Lifestyle
            </Link>
          </div>
        </div>
      </section>

      {/* ── Sponsored Athlete ── */}
      <section id="sponsored-athlete" className="scroll-mt-24 grid gap-6 lg:grid-cols-2">
        <div className="relative min-h-[420px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-black">
          <Image
            src={homeImages.sponsoredAthlete}
            alt='Abel "The Ninja" Biju sponsored athlete'
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
        <div className="relative overflow-hidden rounded-[1.75rem] border border-crimson/30 bg-crimson/5 p-8 md:p-12">
          <div className="flex h-full flex-col justify-center space-y-6">
            <p className="text-[10px] uppercase tracking-[0.55em] text-crimson">Sponsored Athlete</p>
            <h2 className="font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">
              Abel “The Ninja” Biju
            </h2>
            <p className="max-w-md text-sm uppercase leading-7 tracking-[0.22em] text-neutral-400">
              Amateur MMA fighter representing Lions Gym Coventry, competing in Apertos Fightwear.
            </p>
            <Link
              href="/fighters/abel-biju"
              className="inline-flex w-fit items-center bg-crimson px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-crimson/85"
            >
              View Profile
            </Link>
          </div>
        </div>
      </section>

      {/* ── Showcase: new collection ── */}
      {sakuraDragon.length > 0 ? (
        <section className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.55em] text-crimson">New Collection</p>
            <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">
              Sakura Dragon
            </h2>
          </div>
          <ProductShowcase label="New Collection" products={sakuraDragon} />
        </section>
      ) : null}

      {/* ── Showcase: lifestyle ── */}
      <section id="lifestyle-showcase" className="scroll-mt-24 space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.55em] text-crimson">Kids</p>
          <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">
            The Kids Hoodie
          </h2>
        </div>
        <ProductShowcase label="Kids" products={kidsProducts} />
      </section>

      {/* ── Team Kits ── */}
      <section id="team-kits" className="scroll-mt-24 grid gap-6 lg:grid-cols-2">
        <Link
          href="/team-kits"
          className="group relative block min-h-[400px] overflow-hidden rounded-[1.75rem] border border-crimson/30 bg-crimson/5 transition hover:border-crimson/60"
        >
          <Image
            src="/fighters/team-kits-placeholder.jpg"
            alt="Apertos custom team kits"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <p className="text-xs uppercase tracking-[0.55em] text-crimson">Custom</p>
            <h2 className="font-display text-3xl uppercase tracking-[0.08em] md:text-4xl">
              Team &amp; Club Kits
            </h2>
          </div>
        </Link>
        <div className="flex flex-col justify-center rounded-[1.75rem] border border-crimson/30 bg-crimson/5 p-8 transition hover:border-crimson/60 hover:bg-crimson/10 sm:p-10">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.55em] text-crimson">Custom</p>
            <h2 className="font-display text-3xl uppercase tracking-[0.08em] md:text-4xl">
              Team &amp; Club Kits
            </h2>
            <p className="max-w-lg text-sm uppercase leading-7 tracking-[0.2em] text-neutral-400">
              Rash guards, hoodies and MMA shorts designed with your club. Min. 10 per item · ~6 weeks production.
            </p>
            <Link
              href="/team-kits"
              className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-crimson transition hover:text-white"
            >
              Enquire Now <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}