import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import { getProductById, Product } from "@/lib/products";
import { OrderItem, OrderRecord, markInventoryAdjustedForOrder } from "@/lib/orders";

type InventoryRow = {
  product_id: string;
  stock: number | null;
};

export type ProductInventoryStatus = {
  stock: number | null;
  isOutOfStock: boolean;
  message: string;
};

type InventoryRequirement = {
  productId: string;
  quantity: number;
};

const inventoryProductMap: Record<string, InventoryRequirement[]> = {
  "apertos-the-original-rashguard": [{ productId: "rashguard", quantity: 1 }],
  "apertos-the-original-shorts": [{ productId: "shorts", quantity: 1 }],
  "apertos-the-original-no-gi-set": [
    { productId: "rashguard", quantity: 1 },
    { productId: "shorts", quantity: 1 }
  ]
};

function createInventoryMap(rows: InventoryRow[]) {
  return new Map(rows.map((row) => [row.product_id, Math.max(row.stock ?? 0, 0)]));
}

export function getInventoryRequirementsForProduct(productId: string, quantity = 1) {
  return (inventoryProductMap[productId] ?? []).map((requirement) => ({
    productId: requirement.productId,
    quantity: requirement.quantity * quantity
  }));
}

function getRequiredInventoryProductIds(productIds: string[]) {
  return [
    ...new Set(
      productIds.flatMap((productId) => getInventoryRequirementsForProduct(productId).map((item) => item.productId))
    )
  ];
}

async function fetchInventoryRowsByIds(inventoryProductIds: string[]) {
  if (!hasSupabaseAdminEnv || inventoryProductIds.length === 0) {
    return [] as InventoryRow[];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("inventory")
    .select("product_id, stock")
    .in("product_id", inventoryProductIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as InventoryRow[];
}

export async function getInventoryStockMapForProducts(productIds: string[]) {
  const inventoryRows = await fetchInventoryRowsByIds(getRequiredInventoryProductIds(productIds));
  return createInventoryMap(inventoryRows);
}

export function getProductInventoryStatus(product: Product, stockMap: Map<string, number>): ProductInventoryStatus {
  const requirements = getInventoryRequirementsForProduct(product.id);

  if (!requirements.length) {
    return {
      stock: null,
      isOutOfStock: false,
      message: "Stock unavailable"
    };
  }

  const availableStock = requirements.reduce<number | null>((lowest, requirement) => {
    const inventoryStock = stockMap.get(requirement.productId);

    if (typeof inventoryStock !== "number") {
      return 0;
    }

    const units = Math.floor(inventoryStock / requirement.quantity);

    return lowest === null ? units : Math.min(lowest, units);
  }, null);

  const stock = availableStock ?? 0;

  if (stock <= 0) {
    return {
      stock: 0,
      isOutOfStock: true,
      message: "Out of stock"
    };
  }

  return {
    stock,
    isOutOfStock: false,
    message: `${stock} in stock`
  };
}

function aggregateInventoryRequirements(items: OrderItem[]) {
  const aggregated = new Map<string, number>();

  for (const item of items) {
    const requirements = getInventoryRequirementsForProduct(item.productId, item.quantity);

    for (const requirement of requirements) {
      aggregated.set(requirement.productId, (aggregated.get(requirement.productId) ?? 0) + requirement.quantity);
    }
  }

  return aggregated;
}

export async function assertInventoryAvailable(items: OrderItem[]) {
  if (!hasSupabaseAdminEnv) {
    return;
  }

  const requirements = aggregateInventoryRequirements(items);
  const stockMap = await getInventoryStockMapForProducts(items.map((item) => item.productId));

  for (const [inventoryProductId, requiredQuantity] of requirements.entries()) {
    const availableStock = stockMap.get(inventoryProductId) ?? 0;

    if (availableStock < requiredQuantity) {
      const productName = inventoryProductId === "rashguard" ? "rashguard" : "shorts";
      throw new Error(`Not enough ${productName} stock is available right now.`);
    }
  }
}

export async function decrementInventoryForOrder(order: OrderRecord) {
  if (!hasSupabaseAdminEnv) {
    return;
  }

  if (order.parsedItemsPayload.inventoryAdjustedAt) {
    return;
  }

  const requirements = aggregateInventoryRequirements(order.parsedItemsPayload.items);

  if (requirements.size === 0) {
    await markInventoryAdjustedForOrder(order.stripeCheckoutSessionId);
    return;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("inventory")
    .select("product_id, stock")
    .in("product_id", [...requirements.keys()]);

  if (error) {
    throw new Error(error.message);
  }

  const stockMap = createInventoryMap((data ?? []) as InventoryRow[]);

  for (const [inventoryProductId, requiredQuantity] of requirements.entries()) {
    const availableStock = stockMap.get(inventoryProductId) ?? 0;

    if (availableStock < requiredQuantity) {
      throw new Error(`Inventory for ${inventoryProductId} is too low to fulfill this order.`);
    }
  }

  for (const [inventoryProductId, requiredQuantity] of requirements.entries()) {
    const currentStock = stockMap.get(inventoryProductId) ?? 0;
    const { error: updateError } = await supabase
      .from("inventory")
      .update({ stock: currentStock - requiredQuantity })
      .eq("product_id", inventoryProductId);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  await markInventoryAdjustedForOrder(order.stripeCheckoutSessionId);
}

export async function getProductWithInventoryStatus(productId: string) {
  const product = getProductById(productId);

  if (!product) {
    return null;
  }

  if (!hasSupabaseAdminEnv) {
    return {
      product,
      inventory: {
        stock: null,
        isOutOfStock: false,
        message: "Stock unavailable"
      } satisfies ProductInventoryStatus
    };
  }

  const stockMap = await getInventoryStockMapForProducts([product.id]);

  return {
    product,
    inventory: getProductInventoryStatus(product, stockMap)
  };
}
