import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/products/product-detail";
import { getProductWithInventoryStatus } from "@/lib/inventory";
import { products } from "@/lib/products";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
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

  return (
    <ProductDetail
      product={productWithInventory.product}
      inventoryBySize={productWithInventory.inventoryBySize}
    />
  );
}
