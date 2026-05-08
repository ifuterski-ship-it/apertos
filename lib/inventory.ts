import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import { getProductById, Product } from "@/lib/products";
import { OrderItem, OrderRecord, markInventoryAdjustedForOrder } from "@/lib/orders";

type InventoryRow = {
  product_id: string;
  size: string | null;
  stock: number | null;
};

type BaseInventoryProductId = "rashguard" | "shorts";

type InventoryProductState = {
  totalStock: number;
  hasBaseRow: boolean;
  stockBySize: Record<string, number>;
  hasSizeRows: boolean;
};

type InventoryState = Record<BaseInventoryProductId, InventoryProductState>;

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

type SizeRequirement = { productId: BaseInventoryProductId; size: string; quantity: number };

function getSizeInventoryRequirements(items: OrderItem[]): SizeRequirement[] {
  const map = new Map<string, SizeRequirement>();

  for (const item of items) {
    const baseProducts = getBaseInventoryProductsForProduct(item.productId);

    for (const baseProduct of baseProducts) {
      const key = `${baseProduct}/${item.size}`;
      const existing = map.get(key);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        map.set(key, { productId: baseProduct, size: item.size, quantity: item.quantity });
      }
    }
  }

  return [...map.values()];
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
    rashguard: { totalStock: fallbackProductStock.rashguard, hasBaseRow: false, stockBySize: {}, hasSizeRows: false },
    shorts: { totalStock: fallbackProductStock.shorts, hasBaseRow: false, stockBySize: {}, hasSizeRows: false }
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
    const sizeRows = productRows.filter((row) => !!row.size);

    if (baseRows.length > 0) {
      state[productId] = {
        totalStock: Math.max(
          baseRows.reduce((total, row) => total + Math.max(row.stock ?? 0, 0), 0),
          0
        ),
        hasBaseRow: true,
        stockBySize: {},
        hasSizeRows: false
      };
      continue;
    }

    if (sizeRows.length > 0) {
      const stockBySize: Record<string, number> = {};
      for (const row of sizeRows) {
        if (row.size) stockBySize[row.size] = Math.max(row.stock ?? 0, 0);
      }
      state[productId] = {
        totalStock: Math.max(
          Object.values(stockBySize).reduce((a, b) => a + b, 0),
          0
        ),
        hasBaseRow: false,
        stockBySize,
        hasSizeRows: true
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
  const baseProducts = getBaseInventoryProductsForProduct(product.id);
  const allHaveSizeRows = baseProducts.length > 0 && baseProducts.every((id) => inventoryState[id].hasSizeRows);

  if (!allHaveSizeRows) {
    const status = createInventoryStatus(product, inventoryState);
    return Object.fromEntries(product.sizes.map((size) => [size, status]));
  }

  return Object.fromEntries(
    product.sizes.map((size) => {
      const stockForSize = Math.min(...baseProducts.map((id) => inventoryState[id].stockBySize[size] ?? 0));

      if (stockForSize <= 0) {
        return [size, { stock: 0, isOutOfStock: true, message: "Out of stock" } satisfies ProductInventoryStatus];
      }

      return [
        size,
        { stock: stockForSize, isOutOfStock: false, message: `${stockForSize} available now` } satisfies ProductInventoryStatus
      ];
    })
  );
}

export async function assertInventoryAvailable(items: OrderItem[]) {
  const requirements = getBaseInventoryRequirements(items);
  const rows = await fetchInventoryRows([...requirements.keys()]);
  const inventoryState = createInventoryState(rows);

  const allHaveSizeRows = [...requirements.keys()].every((id) => inventoryState[id].hasSizeRows);

  if (allHaveSizeRows) {
    for (const { productId, size, quantity } of getSizeInventoryRequirements(items)) {
      const available = inventoryState[productId].stockBySize[size] ?? 0;
      if (available < quantity) {
        throw new Error(`Not enough ${productId} stock in size ${size} is available right now.`);
      }
    }
  } else {
    for (const [productId, quantity] of requirements.entries()) {
      const availableStock = inventoryState[productId].totalStock;
      if (availableStock < quantity) {
        throw new Error(`Not enough ${productId} stock is available right now.`);
      }
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
  const allHaveSizeRows = [...requirements.keys()].every((id) => inventoryState[id].hasSizeRows);

  if (allHaveSizeRows) {
    for (const { productId, size, quantity } of getSizeInventoryRequirements(order.parsedItemsPayload.items)) {
      const currentStock = inventoryState[productId].stockBySize[size] ?? 0;
      const nextStock = Math.max(currentStock - quantity, 0);

      const { error } = await supabase
        .from("inventory")
        .update({ stock: nextStock })
        .eq("product_id", productId)
        .eq("size", size);

      if (error) {
        throw new Error(error.message);
      }
    }
  } else {
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
