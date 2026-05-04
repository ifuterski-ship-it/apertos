import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

const title = "About Apertos Fightwear | UK BJJ & MMA Brand";
const description =
  "Apertos Fightwear is a UK-based combat sports brand making premium BJJ rash guards, MMA shorts and no-gi sets. Designed by grapplers for grapplers — built for the mat.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: {
    title,
    description,
    url: absoluteUrl("/about"),
    images: [{ url: absoluteUrl("/products/nogi-lifestyle.jpeg"), alt: "Apertos Fightwear no-gi set" }]
  },
  twitter: { card: "summary_large_image", title, description, images: [absoluteUrl("/products/nogi-lifestyle.jpeg")] }
};

export default function AboutPage() {
  return (
    <div className="space-y-20 pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-panel/70 px-6 py-20 shadow-luxe md:px-10 md:py-28">
        <div className="absolute inset-0 bg-grain opacity-80" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <div className="relative mx-auto max-w-3xl space-y-6 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-muted">Our Story</p>
          <h1 className="font-display text-5xl uppercase leading-none tracking-[0.08em] md:text-7xl">
            Built For The Mat
          </h1>
          <p className="mx-auto max-w-2xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
            Apertos Fightwear is a UK-based combat sports brand created by grapplers who wanted something better —
            premium fit, performance fabric, and clean design without compromise.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="grid gap-8 lg:grid-cols-2">
        <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-white/10 bg-black">
          <Image
            src="/products/nogi-lifestyle.jpeg"
            alt="Athlete wearing the Apertos no-gi set"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
        <div className="flex flex-col justify-center space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.45em] text-muted">Mission</p>
          <h2 className="font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">
            Designed By Grapplers, For Grapplers
          </h2>
          <p className="text-sm uppercase leading-7 tracking-[0.22em] text-neutral-300">
            We built Apertos because we spent years training in gear that didn&apos;t match the intensity of the mat.
            Too thick, too loose, too easy to grab — always a compromise somewhere. Apertos changes that.
          </p>
          <p className="text-sm uppercase leading-7 tracking-[0.22em] text-neutral-300">
            Every piece is cut for compression fit, engineered for 4-way stretch, and finished with a monochrome
            aesthetic that looks as sharp off the mat as it performs on it.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            eyebrow: "Fabric",
            title: "Performance Materials",
            body: "85% Polyester, 15% Spandex — 4-way stretch, moisture-wicking, and built to hold their shape through hard rounds and repeated washes."
          },
          {
            eyebrow: "Fit",
            title: "Compression Cut",
            body: "Designed for a snug, locked-in fit that stays in place through takedowns, guard passes, and scrambles. Size down if you&apos;re between sizes."
          },
          {
            eyebrow: "Design",
            title: "Clean Aesthetic",
            body: "Minimal branding, monochrome lines, and a silhouette built for the discipline of the sport. Training gear that stands out by staying focused."
          }
        ].map((card) => (
          <div key={card.eyebrow} className="space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <p className="text-xs uppercase tracking-[0.45em] text-muted">{card.eyebrow}</p>
            <h3 className="font-display text-2xl uppercase tracking-[0.08em]">{card.title}</h3>
            <p className="text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300"
              dangerouslySetInnerHTML={{ __html: card.body }}
            />
          </div>
        ))}
      </section>

      {/* UK Brand */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-12">
        <div className="absolute -right-10 bottom-0 h-52 w-52 opacity-[0.06]">
          <Image src="/logo-mark.png" alt="" fill sizes="208px" className="object-contain" />
        </div>
        <div className="relative mx-auto max-w-2xl space-y-6 text-center">
          <p className="text-xs uppercase tracking-[0.45em] text-muted">Where We Are</p>
          <h2 className="font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">UK-Based. Mat-Tested.</h2>
          <p className="text-sm uppercase leading-7 tracking-[0.22em] text-neutral-300">
            Apertos is a UK brand shipping to athletes across the UK and internationally. Every product is developed
            with a grappler&apos;s perspective — tested on the mat before it hits the storefront.
          </p>
          <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">
            Questions? Email us at{" "}
            <a href="mailto:info@apertosfightwear.com" className="text-neutral-300 transition hover:text-white">
              info@apertosfightwear.com
            </a>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Link
          href="/shop"
          className="inline-flex items-center border border-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black"
        >
          Shop The Collection
        </Link>
      </section>
    </div>
  );
}
