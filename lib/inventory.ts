import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";

export type InventoryItem = {
  product_id: string;
  stock: number;
  updated_at: string;
};

// Product ID mappings for inventory
const PRODUCT_INVENTORY_MAP: Record<string, string> = {
  "apertos-the-original-rashguard": "rashguard",
  "apertos-the-original-shorts": "shorts"
};

// Define which inventory items are needed for the set
const SET_COMPONENTS: string[] = ["rashguard", "shorts"];
const SET_PRODUCT_ID = "apertos-the-original-no-gi-set";

export function getInventoryProductId(productId: string): string | null {
  return PRODUCT_INVENTORY_MAP[productId] || null;
}

export function getSetComponents(): string[] {
  return SET_COMPONENTS;
}

export function isSetProduct(productId: string): boolean {
  return productId === SET_PRODUCT_ID;
}

async function getInventoryClient() {
  if (hasSupabaseAdminEnv) {
    return createAdminClient();
  }
  return createClient();
}

export async function getInventoryStock(inventoryProductId: string): Promise<number | null> {
  try {
    const supabase = await getInventoryClient();
    const { data, error } = await supabase.rpc("get_inventory", {
      p_product_id: inventoryProductId
    });

    if (error) {
      console.error("Error fetching inventory:", error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return data[0].stock as number;
  } catch (error) {
    console.error("Error in getInventoryStock:", error);
    return null;
  }
}

export async function getAllInventory(): Promise<InventoryItem[] | null> {
  try {
    const supabase = await getInventoryClient();
    const { data, error } = await supabase.rpc("get_all_inventory");

    if (error) {
      console.error("Error fetching all inventory:", error);
      return null;
    }

    return data as InventoryItem[];
  } catch (error) {
    console.error("Error in getAllInventory:", error);
    return null;
  }
}

export async function isProductInStock(productId: string): Promise<boolean> {
  // For regular products (rashguard, shorts)
  const inventoryId = getInventoryProductId(productId);
  if (inventoryId) {
    const stock = await getInventoryStock(inventoryId);
    return stock !== null && stock > 0;
  }

  // For the set, check both components
  if (isSetProduct(productId)) {
    const components = getSetComponents();
    const stocks = await Promise.all(components.map((id) => getInventoryStock(id)));
    return stocks.every((stock) => stock !== null && stock > 0);
  }

  return false;
}

export async function reduceInventory(productId: string, quantity: number = 1): Promise<{ ok: boolean; message: string }> {
  try {
    // For the set, reduce both components
    if (isSetProduct(productId)) {
      const components = getSetComponents();
      for (const componentId of components) {
        const result = await reduceInventoryByInventoryId(componentId, quantity);
        if (!result.ok) {
          return {
            ok: false,
            message: `Failed to reduce ${componentId} inventory: ${result.message}`
          };
        }
      }
      return {
        ok: true,
        message: "Set inventory reduced successfully"
      };
    }

    // For regular products
    const inventoryId = getInventoryProductId(productId);
    if (!inventoryId) {
      return {
        ok: false,
        message: `Product ${productId} is not tracked in inventory`
      };
    }

    return reduceInventoryByInventoryId(inventoryId, quantity);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in reduceInventory:", error);
    return {
      ok: false,
      message: `Failed to reduce inventory: ${message}`
    };
  }
}

async function reduceInventoryByInventoryId(
  inventoryId: string,
  quantity: number
): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await getInventoryClient();
    const { data, error } = await supabase.rpc("reduce_inventory", {
      p_product_id: inventoryId,
      p_quantity: quantity
    });

    if (error) {
      console.error("Error reducing inventory:", error);
      return {
        ok: false,
        message: error.message
      };
    }

    if (!data || !data.ok) {
      const message = data?.message || "Unknown error reducing inventory";
      return {
        ok: false,
        message
      };
    }

    return {
      ok: true,
      message: `Reduced ${inventoryId} stock by ${quantity}`
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in reduceInventoryByInventoryId:", error);
    return {
      ok: false,
      message: `Failed to reduce inventory: ${message}`
    };
  }
}

export async function reduceInventoryForOrder(items: Array<{ productId: string; quantity: number }>) {
  const results = [];

  for (const item of items) {
    const result = await reduceInventory(item.productId, item.quantity);
    results.push({
      productId: item.productId,
      ...result
    });
  }

  return results;
}
