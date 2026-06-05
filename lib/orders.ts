import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type OrderShippingAddress = {
  name: string | null;
  email: string | null;
  phone?: string | null;
  address1: string | null;
  address2?: string | null;
  city: string | null;
  state?: string | null;
  postalCode: string | null;
  country: string | null;
};

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  size: string;
  colour?: string;
  price: number;
};

export type OrderShippingLabel = {
  provider: string | null;
  serviceLevel: string | null;
  trackingNumber: string | null;
  labelUrl: string | null;
};

function sanitizeOrderItem(value: Record<string, unknown>): OrderItem | null {
  if (
    typeof value.productId !== "string" ||
    typeof value.name !== "string" ||
    typeof value.quantity !== "number" ||
    typeof value.size !== "string" ||
    typeof value.price !== "number"
  ) {
    return null;
  }
  return {
    productId: value.productId,
    name: value.name,
    quantity: value.quantity,
    size: value.size,
    ...(typeof value.colour === "string" ? { colour: value.colour } : {}),
    price: value.price
  };
}

export function buildOrderItemsPayload(
  items: OrderItem[],
  shippingAddress: OrderShippingAddress | null
): Record<string, unknown> {
  return {
    items,
    shippingAddress
  };
}

export async function recordOrder({
  email,
  stripeCheckoutSessionId,
  stripeCustomerId,
  amountTotal,
  currency,
  items,
  paymentStatus
}: {
  email: string | null;
  stripeCheckoutSessionId: string;
  stripeCustomerId: string | null;
  amountTotal: number | null;
  currency: string | null;
  items: Record<string, unknown>;
  paymentStatus: string | null;
}): Promise<{ ok: boolean; message?: string }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { ok: true, message: "Supabase not configured — order not persisted." };
  }

  const { error } = await supabase.from("orders").upsert(
    {
      email,
      stripe_checkout_session_id: stripeCheckoutSessionId,
      stripe_customer_id: stripeCustomerId,
      amount_total: amountTotal,
      currency,
      items,
      payment_status: paymentStatus
    },
    { onConflict: "stripe_checkout_session_id" }
  );

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function getOrderForAdmin(
  stripeCheckoutSessionId: string
): Promise<{ id: string; items: Record<string, unknown> } | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("orders")
    .select("id, items")
    .eq("stripe_checkout_session_id", stripeCheckoutSessionId)
    .single();

  if (error || !data) return null;
  return data as { id: string; items: Record<string, unknown> };
}

export async function decrementInventoryForOrder(
  order: { id: string; items: Record<string, unknown> },
  supabaseClient?: SupabaseClient
): Promise<void> {
  const supabase = supabaseClient ?? getSupabaseAdminClient();
  if (!supabase) return;

  const payload = order.items as { items?: unknown[] };
  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  const parsedItems: OrderItem[] = [];

  for (const raw of rawItems) {
    if (raw && typeof raw === "object") {
      const sanitized = sanitizeOrderItem(raw as Record<string, unknown>);
      if (sanitized) parsedItems.push(sanitized);
    }
  }

  for (const item of parsedItems) {
    const { data: existing } = await supabase
      .from("inventory")
      .select("stock")
      .eq("product_id", item.productId)
      .eq("size", item.size)
      .single();

    if (!existing) continue;

    const newStock = Math.max(0, (existing.stock as number) - item.quantity);
    await supabase
      .from("inventory")
      .update({ stock: newStock })
      .eq("product_id", item.productId)
      .eq("size", item.size);
  }
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("items")
    .eq("id", orderId)
    .single();

  if (error || !data) return [];

  const payload = data.items as { items?: unknown[] };
  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  const parsedItems: OrderItem[] = [];

  for (const raw of rawItems) {
    if (raw && typeof raw === "object") {
      const sanitized = sanitizeOrderItem(raw as Record<string, unknown>);
      if (sanitized) parsedItems.push(sanitized);
    }
  }

  return parsedItems;
}
