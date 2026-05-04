import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/products/product-detail";
import { ProductReviews } from "@/components/products/product-reviews";
import { getProductWithInventoryStatus } from "@/lib/inventory";
import { products } from "@/lib/products";
import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import { absoluteUrl } from "@/lib/site";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const productWithInventory = await getProductWithInventoryStatus(id);

  if (!productWithInventory) {
    return {};
  }

  const { product } = productWithInventory;
  const keywordDescriptionByProductId: Record<string, string> = {
    "apertos-the-original-rashguard":
      "Shop the Apertos Fightwear BJJ rash guard built for no-gi grappling, hard drilling and premium compression-style performance.",
    "apertos-the-original-shorts":
      "Shop Apertos Fightwear MMA shorts made for grappling, sparring and high-movement combat sports training.",
    "apertos-the-original-no-gi-set":
      "Shop the Apertos Fightwear no-gi set with matching rash guard and shorts for BJJ, grappling and MMA training."
  };
  const title = `${product.name} | Apertos Fightwear`;
  const description =
    keywordDescriptionByProductId[product.id] ??
    `${product.name} in performance fightwear fabric for BJJ and MMA training. Available in GBP with UK shipping from Apertos Fightwear.`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.id.includes("rashguard") ? "BJJ rash guard" : null,
      product.id.includes("shorts") ? "MMA shorts" : null,
      product.id.includes("no-gi-set") ? "no-gi set" : null,
      "Apertos Fightwear",
      "BJJ",
      "MMA"
    ].filter((value): value is string => Boolean(value)),
    alternates: {
      canonical: absoluteUrl(`/product/${product.id}`)
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/product/${product.id}`),
      images: [
        {
          url: absoluteUrl(product.image),
          alt: product.name
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(product.image)]
    }
  };
}

export default async function ProductPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productWithInventory = await getProductWithInventoryStatus(id);

  if (!productWithInventory) {
    notFound();
  }

  let reviewSummary: { average: number; count: number } | null = null;
  if (hasSupabaseAdminEnv) {
    const supabase = createAdminClient();
    const { data: reviewRows } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", id);
    if (reviewRows && reviewRows.length > 0) {
      reviewSummary = {
        count: reviewRows.length,
        average: reviewRows.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewRows.length
      };
    }
  }

  const stockBySize = productWithInventory.inventoryBySize;
  const aggregateStock = Math.max(
    ...Object.values(stockBySize)
      .map((status) => status.stock ?? 0)
      .filter((value) => Number.isFinite(value)),
    0
  );
  const faqItems = [
    {
      question: "What material is this made from?",
      answer:
        "This piece is built from performance fightwear fabric designed for stretch, durability, and repeated BJJ and MMA training."
    },
    {
      question: "Is this suitable for BJJ training?",
      answer:
        "Yes. Apertos Fightwear products are made for live grappling, no-gi drilling, conditioning, and hard training sessions."
    },
    {
      question: "What sizes are available?",
      answer: `Available sizes are ${productWithInventory.product.sizes.join(", ")}.`
    },
    {
      question: "How do I care for this product?",
      answer:
        "Wash cold, avoid harsh heat, and hang dry where possible to help maintain fabric performance, fit, and print finish."
    }
  ];
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productWithInventory.product.name,
    image: (productWithInventory.product.images ?? [productWithInventory.product.image]).map((image) => absoluteUrl(image)),
    description: productWithInventory.product.description,
    sku: productWithInventory.product.id,
    brand: {
      "@type": "Brand",
      name: "Apertos Fightwear"
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "GBP",
      price: productWithInventory.product.price.toFixed(2),
      availability:
        aggregateStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/product/${productWithInventory.product.id}`)
    }
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ProductDetail
        product={productWithInventory.product}
        inventoryBySize={productWithInventory.inventoryBySize}
        reviewSummary={reviewSummary}
      />
      <div className="mx-auto max-w-2xl pb-24 pt-4">
        <ProductReviews
          productId={id}
          initialAverage={reviewSummary?.average ?? null}
          initialCount={reviewSummary?.count ?? 0}
        />
      </div>
    </>
  );
}
