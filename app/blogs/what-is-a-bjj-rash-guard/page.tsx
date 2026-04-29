import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

const blogTitle = "What Is A BJJ Rash Guard? | Apertos Fightwear";
const blogDescription =
  "Learn what a BJJ rash guard does, how it compares to regular gym tops, and why no-gi athletes rely on it for training.";

export const metadata: Metadata = {
  title: blogTitle,
  description: blogDescription,
  alternates: {
    canonical: absoluteUrl("/blogs/what-is-a-bjj-rash-guard")
  },
  openGraph: {
    title: blogTitle,
    description: blogDescription,
    url: absoluteUrl("/blogs/what-is-a-bjj-rash-guard")
  },
  twitter: {
    card: "summary_large_image",
    title: blogTitle,
    description: blogDescription
  }
};

const faqItems = [
  {
    question: "Do you need a rash guard for BJJ?",
    answer:
      "For no-gi training, a rash guard is one of the most common and practical tops because it stays close to the body and handles repeated contact well."
  },
  {
    question: "Can you wear a normal gym shirt for grappling?",
    answer:
      "You can, but regular gym shirts usually hold sweat, shift around more, and are less durable under grips, mat friction, and scrambling."
  },
  {
    question: "Should a BJJ rash guard fit tight?",
    answer:
      "Yes. Most athletes choose a close compression fit so the top moves with the body and does not bunch up during live rounds."
  }
];

export default function WhatIsABjjRashGuardPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "What Is A BJJ Rash Guard?",
    description: blogDescription,
    author: {
      "@type": "Organization",
      name: "Apertos Fightwear Team"
    },
    publisher: {
      "@type": "Organization",
      name: "Apertos Fightwear"
    },
    mainEntityOfPage: absoluteUrl("/blogs/what-is-a-bjj-rash-guard")
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
    <div className="space-y-12 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-12">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Apertos Journal</p>
        <h1 className="font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">What Is A BJJ Rash Guard?</h1>
        <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">By the Apertos Fightwear Team</p>
        <p className="max-w-4xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
          A BJJ rash guard is a close-fitting performance top worn for no-gi grappling, wrestling-style scrambles, and
          MMA training. It is designed to stay secure during movement, manage sweat better than a loose cotton shirt,
          and hold up under the friction and intensity of repeated rounds on the mat.
        </p>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <article className="space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <h2 className="font-display text-3xl uppercase tracking-[0.08em]">Why Athletes Wear One</h2>
          <p className="text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">
            Rash guards give grapplers a cleaner fit with less fabric to grab, less bunching during transitions, and a
            more stable layer for hard rounds. For BJJ athletes, that means fewer distractions and better movement when
            pace, pressure, and sweat all rise at once.
          </p>
        </article>
        <article className="space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <h2 className="font-display text-3xl uppercase tracking-[0.08em]">Rash Guard Vs Gym T-Shirt</h2>
          <p className="text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">
            A regular gym top can work for general training, but it is not built for the close contact of grappling.
            Rash guards are usually lighter, stretch better, stay in place more consistently, and are made to perform
            through live rounds instead of casual cardio sessions.
          </p>
        </article>
      </section>

      <section className="space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-10">
        <h2 className="font-display text-3xl uppercase tracking-[0.08em]">What To Look For</h2>
        <p className="text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">
          Look for a rash guard with durable seams, performance fabric, secure stretch, and a silhouette that stays
          composed when you scramble, invert, and hand-fight. Good fightwear should feel sharp, supportive, and ready
          for repeated sessions without turning sloppy after a few washes.
        </p>
      </section>

      <section className="space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-10">
        <h2 className="font-display text-3xl uppercase tracking-[0.08em]">FAQ</h2>
        <div className="space-y-5">
          {faqItems.map((item) => (
            <div key={item.question} className="space-y-2 border-t border-white/10 pt-5 first:border-t-0 first:pt-0">
              <h3 className="text-sm uppercase tracking-[0.28em] text-white">{item.question}</h3>
              <p className="text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
