import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

const blogTitle = "What Are MMA Shorts? | Apertos Fightwear";
const blogDescription =
  "Learn what MMA shorts are, how they differ from normal gym shorts, and why they matter for grappling and striking.";

export const metadata: Metadata = {
  title: blogTitle,
  description: blogDescription,
  alternates: {
    canonical: absoluteUrl("/blogs/what-are-mma-shorts")
  },
  openGraph: {
    title: blogTitle,
    description: blogDescription,
    url: absoluteUrl("/blogs/what-are-mma-shorts")
  },
  twitter: {
    card: "summary_large_image",
    title: blogTitle,
    description: blogDescription
  }
};

export default function WhatAreMmaShortsPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "What Are MMA Shorts?",
    description: blogDescription,
    author: {
      "@type": "Organization",
      name: "Apertos Fightwear Team"
    },
    publisher: {
      "@type": "Organization",
      name: "Apertos Fightwear"
    },
    mainEntityOfPage: absoluteUrl("/blogs/what-are-mma-shorts")
  };

  return (
    <div className="space-y-12 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-12">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Apertos Journal</p>
        <h1 className="font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">What Are MMA Shorts?</h1>
        <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">By the Apertos Fightwear Team</p>
        <p className="max-w-4xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
          MMA shorts are lightweight training shorts built for grappling, striking, pad work, sparring and conditioning.
          They are cut to move more cleanly than standard gym shorts, with less excess fabric and a stronger focus on
          mobility, durability and fightwear function.
        </p>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <article className="space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <h2 className="font-display text-3xl uppercase tracking-[0.08em]">Why Fighters Wear Them</h2>
          <p className="text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">
            MMA shorts are made to feel cleaner through sprawls, kicks, guard passing, scrambles and explosive rounds.
            Good shorts reduce drag, stay comfortable through repeated movement, and keep a sharper silhouette under pressure.
          </p>
        </article>
        <article className="space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <h2 className="font-display text-3xl uppercase tracking-[0.08em]">MMA Shorts Vs Gym Shorts</h2>
          <p className="text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">
            Regular gym shorts can work for basic sessions, but MMA shorts are usually lighter, easier to move in, and
            better suited to grappling and sparring. The shape, fabric and finish are built around combat sports instead
            of general fitness classes.
          </p>
        </article>
      </section>
    </div>
  );
}
