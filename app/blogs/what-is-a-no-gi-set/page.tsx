import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

const blogTitle = "What Is A No-Gi Set? | Apertos Fightwear";
const blogDescription =
  "Learn what a no-gi set includes, why athletes buy matching sets, and how they work for BJJ and MMA training.";

export const metadata: Metadata = {
  title: blogTitle,
  description: blogDescription,
  alternates: {
    canonical: absoluteUrl("/blogs/what-is-a-no-gi-set")
  },
  openGraph: {
    title: blogTitle,
    description: blogDescription,
    url: absoluteUrl("/blogs/what-is-a-no-gi-set")
  },
  twitter: {
    card: "summary_large_image",
    title: blogTitle,
    description: blogDescription
  }
};

export default function WhatIsANoGiSetPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "What Is A No-Gi Set?",
    description: blogDescription,
    author: {
      "@type": "Organization",
      name: "Apertos Fightwear Team"
    },
    publisher: {
      "@type": "Organization",
      name: "Apertos Fightwear"
    },
    mainEntityOfPage: absoluteUrl("/blogs/what-is-a-no-gi-set")
  };

  return (
    <div className="space-y-12 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-12">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Apertos Journal</p>
        <h1 className="font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">What Is A No-Gi Set?</h1>
        <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">By the Apertos Fightwear Team</p>
        <p className="max-w-4xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
          A no-gi set is a matching fightwear pairing, usually a rash guard and shorts, built to work together for BJJ,
          grappling and MMA training. Athletes choose no-gi sets for cleaner styling, a consistent fit, and the convenience
          of getting both key training pieces in one coordinated kit.
        </p>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <article className="space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <h2 className="font-display text-3xl uppercase tracking-[0.08em]">What A No-Gi Set Includes</h2>
          <p className="text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">
            Most no-gi sets include one rash guard and one pair of shorts. Together they cover the core fightwear pieces
            athletes need for no-gi drilling, sparring, conditioning and everyday mat sessions.
          </p>
        </article>
        <article className="space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <h2 className="font-display text-3xl uppercase tracking-[0.08em]">Why Matching Sets Matter</h2>
          <p className="text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">
            Matching no-gi sets give athletes a sharper visual identity while keeping fit, function and branding aligned.
            For brands like Apertos, that means a more intentional look without sacrificing training performance.
          </p>
        </article>
      </section>
    </div>
  );
}
