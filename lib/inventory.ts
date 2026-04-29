import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import { getProductById, Product } from "@/lib/products";
import { OrderItem, OrderRecord, markInventoryAdjustedForOrder } from "@/lib/orders";

type InventoryRow = {
  product_id: string;
  size: string | null;
  stock: number | null;
};

type BaseInventoryProductId = "rashguard" | "shorts";

type InventoryState = Record<
  BaseInventoryProductId,
  {
    totalStock: number;
    hasBaseRow: boolean;
  }
>;

export type ProductInventoryStatus = {
  stock: number | null;
  isOutOfStock: boolean;
  message: string;
};

export type ProductInventoryBySize = Record<string, ProductInventoryStatus>;

const fallbackProductStock: Record<BaseInventoryProductId, number> = {
  rashguard: 9,
  shorts: 9
};

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

function getBaseInventoryRequirements(items: OrderItem[]) {
  const requirements = new Map<BaseInventoryProductId, number>();

  for (const item of items) {
    const baseProducts = getBaseInventoryProductsForProduct(item.productId);

    for (const baseProduct of baseProducts) {
      requirements.set(baseProduct, (requirements.get(baseProduct) ?? 0) + item.quantity);
    }
  }

  return requirements;
}

async function fetchInventoryRows(baseProductIds: BaseInventoryProductId[]) {
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
      console.warn("Unable to fetch inventory from Supabase:", error.message);
      return [] as InventoryRow[];
    }

    return (data ?? []) as InventoryRow[];
  } catch (error) {
    console.warn("Inventory query failed:", error);
    return [] as InventoryRow[];
  }
}

function createInventoryState(rows: InventoryRow[]): InventoryState {
  const state: InventoryState = {
    rashguard: {
      totalStock: fallbackProductStock.rashguard,
      hasBaseRow: false
    },
    shorts: {
      totalStock: fallbackProductStock.shorts,
      hasBaseRow: false
    }
  };

  const groupedRows = new Map<BaseInventoryProductId, InventoryRow[]>();

  for (const row of rows) {
    if (row.product_id !== "rashguard" && row.product_id !== "shorts") {
      continue;
    }

    const productId = row.product_id as BaseInventoryProductId;
    const currentRows = groupedRows.get(productId) ?? [];
    currentRows.push(row);
    groupedRows.set(productId, currentRows);
  }

  for (const productId of Object.keys(state) as BaseInventoryProductId[]) {
    const productRows = groupedRows.get(productId) ?? [];
    const baseRows = productRows.filter((row) => !row.size);

    if (baseRows.length > 0) {
      state[productId] = {
        totalStock: Math.max(
          baseRows.reduce((total, row) => total + Math.max(row.stock ?? 0, 0), 0),
          0
        ),
        hasBaseRow: true
      };
      continue;
    }

    if (productRows.length > 0) {
      state[productId] = {
        totalStock: Math.max(
          productRows.reduce((total, row) => total + Math.max(row.stock ?? 0, 0), 0),
          0
        ),
        hasBaseRow: false
      };
    }
  }

  return state;
}

function getDisplayStock(product: Product, inventoryState: InventoryState) {
  const baseProducts = getBaseInventoryProductsForProduct(product.id);

  if (baseProducts.length === 0) {
    return null;
  }

  if (baseProducts.length === 1) {
    return inventoryState[baseProducts[0]].totalStock;
  }

  return Math.min(...baseProducts.map((productId) => inventoryState[productId].totalStock));
}

function createInventoryStatus(product: Product, inventoryState: InventoryState): ProductInventoryStatus {
  const stock = getDisplayStock(product, inventoryState);

  if (stock === null) {
    return {
      stock: null,
      isOutOfStock: false,
      message: "Stock unavailable"
    };
  }

  if (stock <= 0) {
    return {
      stock: 0,
      isOutOfStock: true,
      message: product.id === "apertos-the-original-no-gi-set" ? "No sets available" : "Out of stock"
    };
  }

  return {
    stock,
    isOutOfStock: false,
    message:
      product.id === "apertos-the-original-no-gi-set" ? `${stock} sets available` : `${stock} available now`
  };
}

function createInventoryBySize(product: Product, inventoryState: InventoryState): ProductInventoryBySize {
  const status = createInventoryStatus(product, inventoryState);
  return Object.fromEntries(product.sizes.map((size) => [size, status]));
}

export async function assertInventoryAvailable(items: OrderItem[]) {
  const requirements = getBaseInventoryRequirements(items);
  const rows = await fetchInventoryRows([...requirements.keys()]);
  const inventoryState = createInventoryState(rows);

  for (const [productId, quantity] of requirements.entries()) {
    const availableStock = inventoryState[productId].totalStock;

    if (availableStock < quantity) {
      throw new Error(`Not enough ${productId} stock is available right now.`);
    }
  }
}

export async function decrementInventoryForOrder(order: OrderRecord) {
  if (order.parsedItemsPayload.inventoryAdjustedAt) {
    return;
  }

  const requirements = getBaseInventoryRequirements(order.parsedItemsPayload.items);

  if (requirements.size === 0) {
    await markInventoryAdjustedForOrder(order.stripeCheckoutSessionId);
    return;
  }

  const rows = await fetchInventoryRows([...requirements.keys()]);
  const inventoryState = createInventoryState(rows);

  for (const [productId, quantity] of requirements.entries()) {
    if (inventoryState[productId].totalStock < quantity) {
      throw new Error(`Inventory for ${productId} is too low to fulfill this order.`);
    }
  }

  if (!hasSupabaseAdminEnv) {
    await markInventoryAdjustedForOrder(order.stripeCheckoutSessionId);
    return;
  }

  const supabase = createAdminClient();

  for (const [productId, quantity] of requirements.entries()) {
    const currentStock = inventoryState[productId].totalStock;
    const nextStock = Math.max(currentStock - quantity, 0);

    if (inventoryState[productId].hasBaseRow) {
      const { error } = await supabase
        .from("inventory")
        .update({ stock: nextStock })
        .eq("product_id", productId)
        .is("size", null);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase.from("inventory").upsert(
        {
          product_id: productId,
          stock: nextStock,
          size: null
        },
        {
          onConflict: "product_id,size"
        }
      );

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
  const inventoryState = createInventoryState(rows);

  return {
    product,
    inventoryBySize: createInventoryBySize(product, inventoryState)
  };
}
