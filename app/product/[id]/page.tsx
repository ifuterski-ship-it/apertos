import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/products/product-detail";
import { getProductById, products } from "@/lib/products";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export default async function ProductPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
