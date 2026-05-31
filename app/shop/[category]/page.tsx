import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/products/product-grid";
import { products } from "@/lib/products";
import { absoluteUrl } from "@/lib/site";

type CategoryConfig = {
  displayName: string;
  categoryFilter: string[];
  description: string;
  features: string[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
};

const categoryConfig: Record<string, CategoryConfig> = {
  "rash-guards": {
    displayName: "Rash Guards",
    categoryFilter: ["Performance Top"],
    description:
      "Compression-style BJJ rash guards built for no-gi drilling, mat durability and clean performance fit. Crafted from 4-way stretch polyester-spandex blend for freedom of movement and moisture-wicking breathability during hard training sessions.",
    features: [
      "4-way stretch performance fabric",
      "Moisture-wicking for intense sessions",
      "Reinforced flatlock stitching",
      "Clean APERTOS monochrome design",
      "Sizes S–2XL"
    ],
    metaTitle: "BJJ Rash Guards UK | No-Gi Compression Tops | Apertos Fightwear",
    metaDescription:
      "Premium BJJ rash guards built for no-gi grappling and high-output training. Compression fit, moisture-wicking performance fabric. Free UK shipping over £40.",
    metaKeywords: [
      "bjj rash guard",
      "no gi rash guard uk",
      "bjj compression top",
      "judo rashguard",
      "grappling rash guard",
      "no gi top uk",
      "bjj training top",
      "apertos rash guard"
    ]
  },
  "mma-shorts": {
    displayName: "MMA Shorts",
    categoryFilter: ["Training Bottoms"],
    description:
      "Lightweight MMA shorts made for grappling movement, sparring comfort and everyday combat sports training. Quick-dry 4-way stretch fabric delivers unrestricted range of motion whether you're drilling takedowns, working guard or sparring on the feet.",
    features: [
      "Ultra-lightweight 4-way stretch fabric",
      "Quick-dry performance material",
      "Flexible waistband for full range of motion",
      "Built for BJJ, MMA and judo training",
      "Sizes S–2XL"
    ],
    metaTitle: "MMA Shorts UK | Grappling Shorts | Apertos Fightwear",
    metaDescription:
      "Lightweight MMA shorts designed for grappling, sparring and combat sports training. Quick-dry, 4-way stretch. Free UK shipping over £40.",
    metaKeywords: [
      "mma shorts uk",
      "bjj shorts",
      "grappling shorts uk",
      "no gi shorts",
      "fight shorts uk",
      "bjj training shorts",
      "mma training shorts",
      "apertos shorts"
    ]
  },
  "no-gi-sets": {
    displayName: "No-Gi Sets",
    categoryFilter: ["Bundle"],
    description:
      "Matching no-gi sets pairing a premium rash guard and MMA shorts in one complete combat sports bundle. A better-value option for athletes who want a unified APERTOS look on the mat — built from the same high-performance 4-way stretch fabric as our individual pieces.",
    features: [
      "Rash guard and shorts in one bundle",
      "Matching APERTOS monochrome design",
      "Better value than buying separately",
      "Ideal for no-gi BJJ, MMA and submission grappling",
      "Sizes S–2XL"
    ],
    metaTitle: "No-Gi Sets UK | Rash Guard & Shorts Bundle | Apertos Fightwear",
    metaDescription:
      "No-gi sets bundling a BJJ rash guard and MMA shorts in matching monochrome APERTOS design. Better value, complete look. Free UK shipping over £40.",
    metaKeywords: [
      "no gi set uk",
      "bjj no gi set",
      "rash guard shorts bundle",
      "no gi bundle uk",
      "bjj set uk",
      "mma set",
      "no gi bjj bundle",
      "apertos no gi set"
    ]
  },
  "apparel": {
    displayName: "Apparel & Accessories",
    categoryFilter: ["Outerwear", "Tops", "Accessories"],
    description:
      "Apertos apparel built for the gym bag, warm-ups and everyday wear. Clean monochrome designs engineered for athletes who train hard and dress with intention — from heavyweight hoodies to training tees.",
    features: [
      "Premium heavyweight fabrics",
      "Monochrome APERTOS design",
      "Built for the mat and the street",
      "Sizes S–2XL"
    ],
    metaTitle: "Fightwear Apparel & Accessories UK | Apertos Fightwear",
    metaDescription:
      "Apertos apparel and accessories for combat sports athletes. Premium hoodies, training tees and more. UK-based fightwear brand.",
    metaKeywords: [
      "bjj hoodie uk",
      "mma hoodie",
      "combat sports apparel uk",
      "fightwear hoodie",
      "bjj clothing uk",
      "mma clothing",
      "apertos hoodie",
      "grappling apparel uk"
    ]
  }
};

export async function generateStaticParams() {
  return Object.keys(categoryConfig).map((category) => ({ category }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const config = categoryConfig[category];

  if (!config) {
    return { title: "Not Found" };
  }

  return {
    title: { absolute: config.metaTitle },
    description: config.metaDescription,
    keywords: config.metaKeywords,
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    alternates: { canonical: absoluteUrl(`/shop/${category}`) },
    openGraph: {
      title: config.metaTitle,
      description: config.metaDescription,
      url: absoluteUrl(`/shop/${category}`),
      type: "website",
      images: [
        {
          url: absoluteUrl("/products/nogi-lifestyle.jpeg"),
          width: 1200,
          height: 1800,
          alt: `Apertos Fightwear — ${config.displayName}`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: config.metaTitle,
      description: config.metaDescription,
      images: [absoluteUrl("/products/nogi-lifestyle.jpeg")]
    }
  };
}

export default async function CategoryPage({
  params
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const config = categoryConfig[category];

  if (!config) {
    notFound();
  }

  const categoryProducts = products.filter(
    (product) => config.categoryFilter.includes(product.category)
  );

  return (
    <div className="space-y-10 pb-24">
      {/* Hero */}
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-12">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Collection</p>
        <h1 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">
          {config.displayName}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">
          {config.description}
        </p>
        <ul className="mt-6 space-y-2">
          {config.features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-neutral-400"
            >
              <span className="h-px w-4 bg-neutral-600" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Products */}
      {categoryProducts.length > 0 ? (
        <ProductGrid products={categoryProducts} />
      ) : (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-12 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-neutral-400">
            More products coming soon
          </p>
        </div>
      )}
    </div>
  );
}
