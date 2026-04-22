import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  size: string;
  price: number;
};

export type OrderShippingAddress = {
  name: string | null;
  email: string | null;
  phone: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
};

export type OrderShippingLabel = {
  labelUrl: string;
  trackingNumber: string | null;
  transactionId: string | null;
  rateAmount: string | null;
  rateCurrency: string | null;
  provider: string | null;
  serviceLevel: string | null;
  purchasedAt: string;
};

export type OrderItemsPayload = {
  version: number;
  items: OrderItem[];
  shippingAddress: OrderShippingAddress | null;
  shippingLabel: OrderShippingLabel | null;
  inventoryAdjustedAt: string | null;
};

type RecordedOrder = {
  email: string | null;
  stripeCheckoutSessionId: string;
  stripeCustomerId: string | null;
  amountTotal: number | null;
  currency: string | null;
  items: string;
  paymentStatus: string | null;
};

type RawOrderRecord = {
  created_at?: string | null;
  email: string | null;
  stripe_checkout_session_id: string;
  stripe_customer_id: string | null;
  amount_total: number | null;
  currency: string | null;
  items: string | null;
  payment_status: string | null;
};

export type OrderRecord = {
  createdAt: string | null;
  email: string | null;
  stripeCheckoutSessionId: string;
  stripeCustomerId: string | null;
  amountTotal: number | null;
  currency: string | null;
  items: string;
  paymentStatus: string | null;
  parsedItemsPayload: OrderItemsPayload;
};

type SupabaseResult<T> = {
  data: T;
  error: {
    message: string;
  } | null;
};

function createEmptyPayload(): OrderItemsPayload {
  return {
    version: 2,
    items: [],
    shippingAddress: null,
    shippingLabel: null,
    inventoryAdjustedAt: null
  };
}

function sanitizeOrderItem(item: unknown): OrderItem | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const value = item as Partial<OrderItem>;

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
    price: value.price
  };
}

function sanitizeShippingAddress(address: unknown): OrderShippingAddress | null {
  if (!address || typeof address !== "object") {
    return null;
  }

  const value = address as Partial<OrderShippingAddress>;

  return {
    name: typeof value.name === "string" ? value.name : null,
    email: typeof value.email === "string" ? value.email : null,
    phone: typeof value.phone === "string" ? value.phone : null,
    address1: typeof value.address1 === "string" ? value.address1 : null,
    address2: typeof value.address2 === "string" ? value.address2 : null,
    city: typeof value.city === "string" ? value.city : null,
    state: typeof value.state === "string" ? value.state : null,
    postalCode: typeof value.postalCode === "string" ? value.postalCode : null,
    country: typeof value.country === "string" ? value.country : null
  };
}

function sanitizeShippingLabel(label: unknown): OrderShippingLabel | null {
  if (!label || typeof label !== "object") {
    return null;
  }

  const value = label as Partial<OrderShippingLabel>;

  if (typeof value.labelUrl !== "string") {
    return null;
  }

  return {
    labelUrl: value.labelUrl,
    trackingNumber: typeof value.trackingNumber === "string" ? value.trackingNumber : null,
    transactionId: typeof value.transactionId === "string" ? value.transactionId : null,
    rateAmount: typeof value.rateAmount === "string" ? value.rateAmount : null,
    rateCurrency: typeof value.rateCurrency === "string" ? value.rateCurrency : null,
    provider: typeof value.provider === "string" ? value.provider : null,
    serviceLevel: typeof value.serviceLevel === "string" ? value.serviceLevel : null,
    purchasedAt: typeof value.purchasedAt === "string" ? value.purchasedAt : new Date().toISOString()
  };
}

export function parseOrderItemsPayload(rawItems: string | null | undefined): OrderItemsPayload {
  if (!rawItems) {
    return createEmptyPayload();
  }

  try {
    const parsed = JSON.parse(rawItems) as unknown;

    if (Array.isArray(parsed)) {
      return {
        version: 1,
        items: parsed.map(sanitizeOrderItem).filter((item): item is OrderItem => item !== null),
        shippingAddress: null,
        shippingLabel: null,
        inventoryAdjustedAt: null
      };
    }

    if (!parsed || typeof parsed !== "object") {
      return createEmptyPayload();
    }

    const payload = parsed as {
      version?: number;
      items?: unknown[];
      shippingAddress?: unknown;
      shippingLabel?: unknown;
      inventoryAdjustedAt?: unknown;
    };

    return {
      version: typeof payload.version === "number" ? payload.version : 2,
      items: Array.isArray(payload.items)
        ? payload.items.map(sanitizeOrderItem).filter((item): item is OrderItem => item !== null)
        : [],
      shippingAddress: sanitizeShippingAddress(payload.shippingAddress),
      shippingLabel: sanitizeShippingLabel(payload.shippingLabel),
      inventoryAdjustedAt: typeof payload.inventoryAdjustedAt === "string" ? payload.inventoryAdjustedAt : null
    };
  } catch {
    return createEmptyPayload();
  }
}

export function serializeOrderItemsPayload(payload: OrderItemsPayload) {
  return JSON.stringify(payload);
}

export function buildOrderItemsPayload(items: OrderItem[], shippingAddress: OrderShippingAddress | null) {
  return serializeOrderItemsPayload({
    version: 2,
    items,
    shippingAddress,
    shippingLabel: null,
    inventoryAdjustedAt: null
  });
}

export function applyShippingLabelToPayload(items: string, shippingLabel: OrderShippingLabel) {
  const payload = parseOrderItemsPayload(items);

  return serializeOrderItemsPayload({
    ...payload,
    version: 2,
    shippingLabel
  });
}

export function applyInventoryAdjustedToPayload(items: string, inventoryAdjustedAt: string) {
  const payload = parseOrderItemsPayload(items);

  return serializeOrderItemsPayload({
    ...payload,
    version: 2,
    inventoryAdjustedAt
  });
}

function mapOrderRecord(order: RawOrderRecord): OrderRecord {
  return {
    createdAt: order.created_at ?? null,
    email: order.email,
    stripeCheckoutSessionId: order.stripe_checkout_session_id,
    stripeCustomerId: order.stripe_customer_id,
    amountTotal: order.amount_total,
    currency: order.currency,
    items: order.items ?? "[]",
    paymentStatus: order.payment_status,
    parsedItemsPayload: parseOrderItemsPayload(order.items)
  };
}

function isOrdersSchemaCacheError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("schema cache") && normalized.includes("orders");
}

async function tryReloadSchemaCache(
  supabase: Awaited<ReturnType<typeof createAdminClient>> | Awaited<ReturnType<typeof createClient>>
) {
  await supabase.rpc("reload_schema_cache");
}

async function withOrdersSchemaRetry<T>(
  supabase: Awaited<ReturnType<typeof createAdminClient>> | Awaited<ReturnType<typeof createClient>>,
  action: () => Promise<SupabaseResult<T>>
) {
  let result = await action();

  if (result.error?.message && isOrdersSchemaCacheError(result.error.message)) {
    try {
      await tryReloadSchemaCache(supabase);
      result = await action();
    } catch {
      return result;
    }
  }

  return result;
}

async function getOrdersWriteClient() {
  if (hasSupabaseAdminEnv) {
    return createAdminClient();
  }

  return createClient();
}

export async function recordOrder(order: RecordedOrder) {
  try {
    const supabase = await getOrdersWriteClient();
    const { error } = await withOrdersSchemaRetry(supabase, async () =>
      supabase
        .schema("public")
        .from("orders")
        .upsert(
          {
            email: order.email,
            stripe_checkout_session_id: order.stripeCheckoutSessionId,
            stripe_customer_id: order.stripeCustomerId,
            amount_total: order.amountTotal,
            currency: order.currency,
            items: order.items,
            payment_status: order.paymentStatus
          },
          {
            onConflict: "stripe_checkout_session_id"
          }
        )
    );

    if (error) {
      const baseMessage = error.message;
      const message = isOrdersSchemaCacheError(baseMessage)
        ? `${baseMessage} Run 'NOTIFY pgrst, ''reload schema'';' in Supabase SQL and ensure this app points to the same Supabase project as your orders table.`
        : baseMessage;
      console.warn("Unable to record order in Supabase:", message);
      return { ok: false, message };
    }

    return { ok: true };
  } catch (error) {
    console.warn("Order recording skipped:", error);
    return { ok: false, message: "Order recording unavailable." };
  }
}

export async function getOrdersForAdmin() {
  const supabase = createAdminClient();
  const { data, error } = await withOrdersSchemaRetry(supabase, async () =>
    supabase.schema("public").from("orders").select("*")
  );

  if (error) {
    if (isOrdersSchemaCacheError(error.message)) {
      throw new Error(
        `${error.message} Run 'NOTIFY pgrst, ''reload schema'';' in Supabase SQL and verify Vercel Supabase env vars all come from the same project.`
      );
    }
    throw new Error(error.message);
  }

  return ((data ?? []) as RawOrderRecord[]).map(mapOrderRecord).sort((left, right) => {
    if (!left.createdAt || !right.createdAt) {
      return 0;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

export async function getOrderForAdmin(stripeCheckoutSessionId: string) {
  const supabase = createAdminClient();
  const { data, error } = await withOrdersSchemaRetry(supabase, async () =>
    supabase
      .schema("public")
      .from("orders")
      .select("*")
      .eq("stripe_checkout_session_id", stripeCheckoutSessionId)
      .maybeSingle()
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapOrderRecord(data as RawOrderRecord);
}

export async function saveShippingLabelForOrder(
  stripeCheckoutSessionId: string,
  shippingLabel: OrderShippingLabel
) {
  const existingOrder = await getOrderForAdmin(stripeCheckoutSessionId);

  if (!existingOrder) {
    throw new Error("Order not found.");
  }

  const supabase = createAdminClient();
  const { error } = await withOrdersSchemaRetry(supabase, async () =>
    supabase
      .schema("public")
      .from("orders")
      .update({
        items: applyShippingLabelToPayload(existingOrder.items, shippingLabel)
      })
      .eq("stripe_checkout_session_id", stripeCheckoutSessionId)
  );

  if (error) {
    throw new Error(error.message);
  }

  return {
    ...existingOrder,
    items: applyShippingLabelToPayload(existingOrder.items, shippingLabel),
    parsedItemsPayload: {
      ...existingOrder.parsedItemsPayload,
      version: 2,
      shippingLabel
    }
  };
}

export async function markInventoryAdjustedForOrder(stripeCheckoutSessionId: string) {
  const existingOrder = await getOrderForAdmin(stripeCheckoutSessionId);

  if (!existingOrder || existingOrder.parsedItemsPayload.inventoryAdjustedAt) {
    return existingOrder;
  }

  const inventoryAdjustedAt = new Date().toISOString();
  const updatedItems = applyInventoryAdjustedToPayload(existingOrder.items, inventoryAdjustedAt);
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({
      items: updatedItems
    })
    .eq("stripe_checkout_session_id", stripeCheckoutSessionId);

  if (error) {
    throw new Error(error.message);
  }

  return {
    ...existingOrder,
    items: updatedItems,
    parsedItemsPayload: {
      ...existingOrder.parsedItemsPayload,
      version: 2,
      inventoryAdjustedAt
    }
  };
}
