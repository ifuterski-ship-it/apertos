import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { absoluteUrl } from "@/lib/site";

const blogTitle = "Blog | Apertos Fightwear";
const blogDescription =
  "Training guides, gear breakdowns, and BJJ insights from the Apertos Fightwear team.";

export const metadata: Metadata = {
  title: { absolute: blogTitle },
  description: blogDescription,
  alternates: { canonical: absoluteUrl("/blogs") },
  openGraph: {
    title: blogTitle,
    description: blogDescription,
    url: absoluteUrl("/blogs"),
    type: "website"
  }
};

const posts = [
  {
    slug: "what-is-a-bjj-rash-guard",
    title: "What Is A BJJ Rash Guard?",
    description:
      "Learn what a BJJ rash guard does, how it compares to regular gym tops, and why no-gi athletes rely on it for training.",
    category: "Gear Guide"
  },
  {
    slug: "what-is-a-no-gi-set",
    title: "What Is A No-Gi Set?",
    description:
      "A breakdown of what a no-gi set includes, how it works for BJJ and MMA training, and why matching sets matter.",
    category: "Gear Guide"
  },
  {
    slug: "what-are-mma-shorts",
    title: "What Are MMA Shorts?",
    description:
      "MMA shorts explained — what makes them different from regular shorts, how they're built for grappling, and what to look for.",
    category: "Gear Guide"
  }
];

export default function BlogsPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blogs") }
    ]
  };

  return (
    <div className="pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]} />

      <div className="space-y-12">
        <div>
          <p className="text-xs uppercase tracking-[0.55em] text-crimson">Apertos Journal</p>
          <h1 className="mt-3 font-display text-5xl uppercase tracking-[0.06em] md:text-7xl">
            Training &<br />Gear Guides
          </h1>
          <p className="mt-5 max-w-xl text-sm uppercase leading-7 tracking-[0.22em] text-neutral-400">
            Gear breakdowns, training guides, and everything you need to know about BJJ and MMA fightwear.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blogs/${post.slug}`}
              className="group rounded-[1.75rem] border border-white/10 bg-panel p-7 transition hover:border-crimson/40"
            >
              <p className="text-[10px] uppercase tracking-[0.55em] text-crimson">{post.category}</p>
              <h2 className="mt-4 font-display text-2xl uppercase tracking-[0.06em]">
                {post.title}
              </h2>
              <p className="mt-4 text-sm uppercase leading-7 tracking-[0.18em] text-neutral-400">
                {post.description}
              </p>
              <p className="mt-5 text-[11px] uppercase tracking-[0.35em] text-crimson transition-all duration-200 group-hover:tracking-[0.45em]">
                Read &rarr;
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
