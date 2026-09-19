import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ProductGrid } from "@/components/products/product-grid";
import { getProductsWithFlags } from "@/lib/product-flags";
import { absoluteUrl } from "@/lib/site";

const title = "New Releases | Sakura Dragon Collection | Apertos Fightwear";
const description =
  "The latest Apertos drop — the Sakura Dragon no-gi set. New releases, fresh designs and limited collections from Apertos Fightwear.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: absoluteUrl("/shop/new-releases") },
  openGraph: {
    title,
    description,
    url: absoluteUrl("/shop/new-releases"),
    type: "website",
    images: [
      {
        url: absoluteUrl("/products/sakura-dragon-front.jpeg"),
        width: 1200,
        height: 1800,
        alt: "Apertos Sakura Dragon no-gi set — new release"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [absoluteUrl("/products/sakura-dragon-front.jpeg")]
  }
};

export default async function NewReleasesPage() {
  const allProducts = await getProductsWithFlags();
  const newReleases = allProducts.filter((p) => p.id.startsWith("apertos-sakura-dragon"));

  return (
    <div className="space-y-10 pb-24">
      {/* Hero */}
      <section
        className="relative -mx-4 -mt-10 flex items-center overflow-hidden sm:-mx-6 lg:-mx-8"
        style={{ aspectRatio: "1147 / 1600" }}
      >
        <Image
          src="/products/new-collection-hero.jpeg"
          alt="Apertos new releases"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <p className="mb-5 text-[11px] uppercase tracking-[0.55em] text-crimson">
            Apertos Fightwear — New Releases
          </p>
          <h1 className="font-display text-5xl uppercase leading-none tracking-[0.04em] text-white sm:text-6xl md:text-7xl lg:text-8xl">
            New Releases
          </h1>
          <p className="mt-6 max-w-md text-sm uppercase leading-7 tracking-[0.2em] text-neutral-200">
            The latest Apertos drops — fresh designs, limited collections.
          </p>
        </div>
      </section>

      {/* New release products */}
      {newReleases.length > 0 ? (
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.55em] text-crimson">Just Dropped</p>
          <ProductGrid products={newReleases} />
        </div>
      ) : (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-12 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-neutral-400">More new releases coming soon</p>
        </div>
      )}

      <div className="text-center">
        <Link
          href="/shop"
          className="inline-flex items-center bg-crimson px-7 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-crimson/85"
        >
          Shop Everything
        </Link>
      </div>
    </div>
  );
}