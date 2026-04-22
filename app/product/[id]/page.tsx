import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/products/product-detail";
import { getProductById, products } from "@/lib/products";
import { getInventoryStock, isProductInStock, getSetComponents, isSetProduct, getInventoryProductId } from "@/lib/inventory";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

async function getProductInventory(productId: string) {
  const inventory: Record<string, number | null> = {};
  
  if (isSetProduct(productId)) {
    const components = getSetComponents();
    for (const componentId of components) {
      const stock = await getInventoryStock(componentId);
      inventory[componentId] = stock;
    }
  } else {
    const inventoryId = getInventoryProductId(productId);
    if (inventoryId) {
      const stock = await getInventoryStock(inventoryId);
      inventory[inventoryId] = stock;
    }
  }
  
  return inventory;
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

  // Fetch inventory data
  const inventory = await getProductInventory(product.id);
  const inStock = await isProductInStock(product.id);

  return <ProductDetail product={product} inventory={inventory} inStock={inStock} />;
}
