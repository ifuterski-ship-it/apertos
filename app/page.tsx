import Image from "next/image";
import Link from "next/link";
import { ProductGrid } from "@/components/products/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { getFeaturedProducts } from "@/lib/products";

export default function HomePage() {
  const featuredProducts = getFeaturedProducts();

  return (
    <div className="space-y-24 pb-24">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-panel/70 px-6 py-20 shadow-luxe md:px-10 md:py-28">
        <div className="absolute inset-0 bg-grain opacity-80" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <div className="absolute -right-10 top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 opacity-[0.09] lg:block">
          <Image src="/logo-mark.png" alt="" fill sizes="420px" className="object-contain" />
        </div>
        <div className="relative mx-auto flex max-w-4xl animate-float-in flex-col items-center space-y-8 text-center">
          <div className="space-y-5">
            <div className="mx-auto relative h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-black shadow-luxe">
              <Image src="/logo-mark.png" alt="Apertos logo" fill sizes="96px" className="object-cover opacity-90" />
            </div>
            <p className="text-sm uppercase tracking-[0.5em] text-muted">Premium Combat Sports</p>
            <h1 className="font-display text-5xl uppercase leading-none tracking-[0.08em] md:text-7xl">
              Engineered For Dominance
            </h1>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center border border-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black"
          >
            Shop Now
          </Link>
        </div>
      </section>

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

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Featured"
          title="The Original Collection"
          description="Three APERTOS staples designed to keep the storefront clean, focused, and ready to ship."
        />
        <ProductGrid products={featuredProducts} />
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-black">
          <Image
            src="/products/nogi-lifestyle.jpeg"
            alt="Athlete wearing the Apertos no-gi set"
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
    </div>
  );
}
