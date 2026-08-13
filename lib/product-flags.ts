import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import { products, type Product } from "@/lib/products";
import { isProductComingSoon } from "@/lib/product-availability";
import { getProductWithInventoryStatus } from "@/lib/inventory";

export async function getProductFlags(): Promise<Map<string, boolean>> {
  if (!hasSupabaseAdminEnv) return new Map();
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("product_flags").select("product_id, coming_soon");
    const map = new Map<string, boolean>();
    for (const row of data ?? []) {
      map.set(row.product_id as string, row.coming_soon as boolean);
    }
    return map;
  } catch {
    return new Map();
  }
}

export function applyFlags(prods: Product[], flags: Map<string, boolean>): Product[] {
  return prods.map((p) => (flags.has(p.id) ? { ...p, isComingSoon: flags.get(p.id) } : p));
}

export async function getProductsWithFlags(): Promise<Product[]> {
  const flags = await getProductFlags();
  return applyFlags(products, flags);
}

export async function getProductWithInventoryAndFlags(productId: string) {
  const flags = await getProductFlags();
  const result = await getProductWithInventoryStatus(productId);
  if (!result) return null;

  if (!flags.has(productId)) return result;

  const comingSoon = flags.has(productId) ? flags.get(productId)! : result.product.isComingSoon ?? false;
  const product = { ...result.product, isComingSoon: comingSoon };
  const effectiveComingSoon = isProductComingSoon(product);
  const inventoryBySize = effectiveComingSoon
    ? Object.fromEntries(
        product.sizes.map((size) => [size, { stock: 0, isOutOfStock: true, message: "Coming Soon" }])
      )
    : result.inventoryBySize;

  return { product, inventoryBySize };
}

export async function setProductFlag(productId: string, comingSoon: boolean): Promise<boolean> {
  if (!hasSupabaseAdminEnv) return false;
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("product_flags")
      .upsert(
        { product_id: productId, coming_soon: comingSoon, updated_at: new Date().toISOString() },
        { onConflict: "product_id" }
      );
    return !error;
  } catch {
    return false;
  }
}
