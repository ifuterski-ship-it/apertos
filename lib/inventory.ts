import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import { getProductById, Product } from "@/lib/products";
import { OrderItem, OrderRecord, markInventoryAdjustedForOrder } from "@/lib/orders";

type InventoryRow = {
  product_id: string;
  size: string | null;
  stock: number | null;
};

export type ProductInventoryStatus = {
  stock: number | null;
  isOutOfStock: boolean;
  message: string;
};

export type ProductInventoryBySize = Record<string, ProductInventoryStatus>;

type InventoryRequirement = {
  productId: string;
  size: string;
  quantity: number;
};

type BaseInventoryProductId = "rashguard" | "shorts";

const fallbackSizeStock: Record<BaseInventoryProductId, Record<string, number>> = {
  rashguard: {
    S: 1,
    M: 2,
    L: 2,
    XL: 2,
    "2XL": 2
  },
  shorts: {
    S: 1,
    M: 2,
    L: 2,
    XL: 2,
    "2XL": 2
  }
};

function normalizeSize(size: string) {
  return size.trim().toUpperCase();
}

function makeInventoryKey(productId: string, size: string) {
  return `${productId}:${normalizeSize(size)}`;
}

function getBaseInventoryProductsForProduct(productId: string): BaseInventoryProductId[] {
  if (productId === "apertos-the-original-rashguard") {
    return ["rashguard"];
  }

  if (productId === "apertos-the-original-shorts") {
    return ["shorts"];
  }

  if (productId === "apertos-the-original-no-gi-set") {
    return ["rashguard", "shorts"];
  }

  return [];
}

function getFallbackStock(productId: string, size: string) {
  const normalizedSize = normalizeSize(size);
  const fallbackByProduct = fallbackSizeStock[productId as BaseInventoryProductId];

  if (!fallbackByProduct) {
    return 0;
  }

  return fallbackByProduct[normalizedSize] ?? 0;
}

function createInventoryMap(rows: InventoryRow[]) {
  const stockMap = new Map<string, number>();

  for (const [productId, sizes] of Object.entries(fallbackSizeStock)) {
    for (const [size, stock] of Object.entries(sizes)) {
      stockMap.set(makeInventoryKey(productId, size), stock);
    }
  }

  for (const row of rows) {
    if (!row.size) {
      continue;
    }

    stockMap.set(makeInventoryKey(row.product_id, row.size), Math.max(row.stock ?? 0, 0));
  }

  return stockMap;
}

function getInventoryRequirementsForProduct(productId: string, size: string, quantity = 1) {
  const normalizedSize = normalizeSize(size);

  if (productId === "apertos-the-original-rashguard") {
    return [{ productId: "rashguard", size: normalizedSize, quantity }];
  }

  if (productId === "apertos-the-original-shorts") {
    return [{ productId: "shorts", size: normalizedSize, quantity }];
  }

  if (productId === "apertos-the-original-no-gi-set") {
    return [
      { productId: "rashguard", size: normalizedSize, quantity },
      { productId: "shorts", size: normalizedSize, quantity }
    ];
  }

  return [] as InventoryRequirement[];
}

function aggregateInventoryRequirements(items: OrderItem[]) {
  const aggregated = new Map<string, InventoryRequirement>();

  for (const item of items) {
    const requirements = getInventoryRequirementsForProduct(item.productId, item.size, item.quantity);

    for (const requirement of requirements) {
      const key = makeInventoryKey(requirement.productId, requirement.size);
      const existing = aggregated.get(key);

      if (existing) {
        aggregated.set(key, {
          ...existing,
          quantity: existing.quantity + requirement.quantity
        });
      } else {
        aggregated.set(key, requirement);
      }
    }
  }

  return aggregated;
}

async function fetchInventoryRows(baseProductIds: string[]) {
  if (!hasSupabaseAdminEnv || baseProductIds.length === 0) {
    return [] as InventoryRow[];
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("inventory")
      .select("product_id, size, stock")
      .in("product_id", baseProductIds);

    if (error) {
      console.warn("Unable to fetch size inventory from Supabase:", error.message);
      return [] as InventoryRow[];
    }

    return (data ?? []) as InventoryRow[];
  } catch (error) {
    console.warn("Size inventory query failed:", error);
    return [] as InventoryRow[];
  }
}

function getStockForRequirement(requirement: InventoryRequirement, stockMap: Map<string, number>) {
  return stockMap.get(makeInventoryKey(requirement.productId, requirement.size)) ?? getFallbackStock(requirement.productId, requirement.size);
}

function getInventoryStatusForProductAndSize(product: Product, size: string, stockMap: Map<string, number>): ProductInventoryStatus {
  const requirements = getInventoryRequirementsForProduct(product.id, size);

  if (!requirements.length) {
    return {
      stock: null,
      isOutOfStock: false,
      message: "Stock unavailable"
    };
  }

  const availableStock = requirements.reduce<number | null>((lowest, requirement) => {
    const inventoryStock = getStockForRequirement(requirement, stockMap);
    const units = Math.floor(inventoryStock / requirement.quantity);

    return lowest === null ? units : Math.min(lowest, units);
  }, null);

  const stock = availableStock ?? 0;

  if (stock <= 0) {
    return {
      stock: 0,
      isOutOfStock: true,
      message: `${normalizeSize(size)} sold out`
    };
  }

  return {
    stock,
    isOutOfStock: false,
    message: `${stock} left in ${normalizeSize(size)}`
  };
}

function getInventoryBySizeForProduct(product: Product, stockMap: Map<string, number>): ProductInventoryBySize {
  return Object.fromEntries(
    product.sizes.map((size) => [size, getInventoryStatusForProductAndSize(product, size, stockMap)])
  );
}

export async function assertInventoryAvailable(items: OrderItem[]) {
  const requirements = aggregateInventoryRequirements(items);
  const rows = await fetchInventoryRows(
    [...new Set(items.flatMap((item) => getBaseInventoryProductsForProduct(item.productId)))]
  );
  const stockMap = createInventoryMap(rows);

  for (const requirement of requirements.values()) {
    const availableStock = getStockForRequirement(requirement, stockMap);

    if (availableStock < requirement.quantity) {
      throw new Error(`Not enough ${requirement.productId} stock is available in ${requirement.size} right now.`);
    }
  }
}

export async function decrementInventoryForOrder(order: OrderRecord) {
  if (order.parsedItemsPayload.inventoryAdjustedAt) {
    return;
  }

  const requirements = aggregateInventoryRequirements(order.parsedItemsPayload.items);

  if (requirements.size === 0) {
    await markInventoryAdjustedForOrder(order.stripeCheckoutSessionId);
    return;
  }

  const rows = await fetchInventoryRows([...new Set([...requirements.values()].map((item) => item.productId))]);
  const stockMap = createInventoryMap(rows);
  const existingKeys = new Set(
    rows.filter((row) => row.size).map((row) => makeInventoryKey(row.product_id, row.size as string))
  );

  if (!hasSupabaseAdminEnv) {
    await markInventoryAdjustedForOrder(order.stripeCheckoutSessionId);
    return;
  }

  const supabase = createAdminClient();

  for (const requirement of requirements.values()) {
    const availableStock = getStockForRequirement(requirement, stockMap);

    if (availableStock < requirement.quantity) {
      throw new Error(`Inventory for ${requirement.productId} ${requirement.size} is too low to fulfill this order.`);
    }
  }

  for (const requirement of requirements.values()) {
    const key = makeInventoryKey(requirement.productId, requirement.size);
    const currentStock = getStockForRequirement(requirement, stockMap);
    const nextStock = currentStock - requirement.quantity;

    if (existingKeys.has(key)) {
      const { error } = await supabase
        .from("inventory")
        .update({ stock: nextStock })
        .eq("product_id", requirement.productId)
        .eq("size", requirement.size);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase.from("inventory").insert({
        product_id: requirement.productId,
        size: requirement.size,
        stock: nextStock
      });

      if (error) {
        throw new Error(error.message);
      }
    }
  }

  await markInventoryAdjustedForOrder(order.stripeCheckoutSessionId);
}

export async function getProductWithInventoryStatus(productId: string) {
  const product = getProductById(productId);

  if (!product) {
    return null;
  }

  const rows = await fetchInventoryRows(getBaseInventoryProductsForProduct(product.id));
  const stockMap = createInventoryMap(rows);

  return {
    product,
    inventoryBySize: getInventoryBySizeForProduct(product, stockMap)
  };
}
