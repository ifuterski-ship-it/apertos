import type { Metadata } from "next";
import { ProductGrid } from "@/components/products/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { products } from "@/lib/products";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shop BJJ Rash Guards, MMA Shorts & No-Gi Sets",
  description:
    "Shop Apertos Fightwear rash guards, MMA shorts and no-gi sets for BJJ, grappling and hard training.",
  alternates: {
    canonical: absoluteUrl("/shop")
  },
  openGraph: {
    title: "Shop BJJ Rash Guards, MMA Shorts & No-Gi Sets",
    description:
      "Shop Apertos Fightwear rash guards, MMA shorts and no-gi sets for BJJ, grappling and hard training.",
    url: absoluteUrl("/shop")
  }
};

export default function ShopPage() {
  return (
    <div className="space-y-10 pb-24">
      <SectionHeading
        eyebrow="Shop"
        title="The Apertos Collection"
        description="Shop Apertos Fightwear BJJ rash guards, MMA shorts and no-gi sets designed for grappling, striking and high-output training."
      />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-display text-2xl uppercase tracking-[0.08em]">Rash Guards</h2>
          <p className="mt-3 text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">
            Compression-style BJJ rash guards built for no-gi drilling, mat durability and clean performance fit.
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-display text-2xl uppercase tracking-[0.08em]">MMA Shorts</h2>
          <p className="mt-3 text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">
            Lightweight MMA shorts made for grappling movement, sparring comfort and everyday combat sports training.
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-display text-2xl uppercase tracking-[0.08em]">No-Gi Sets</h2>
          <p className="mt-3 text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">
            Matching no-gi sets that pair rash guards and shorts for athletes who want a complete premium fightwear look.
          </p>
        </div>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
