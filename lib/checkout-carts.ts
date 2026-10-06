/**
 * Pre-Stripe basket storage.
 *
 * The checkout route used to serialise the whole basket into
 * `metadata.items` on the Stripe session. Stripe rejects metadata values over
 * 500 characters, and a four-line basket is ~533 characters, so any customer
 * with four or more products got a 400 and lost the order. The shipping
 * address was a second, independent 500-character exposure.
 *
 * Storing the cart in Supabase instead means Stripe metadata only ever carries
 * `cart_ref`, a 36-character uuid. There is no length ceiling to hit, which
 * also means this does not need revisiting when multi-currency pricing lands.
 *
 * Pricing is never read from here. The webhook takes the amount and currency
 * from the Stripe session, so a tampered or stale cart cannot change what a
 * customer was charged.
 */

import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import type { OrderItem, OrderShippingAddress } from "@/lib/orders";

export type StoredCart = {
  items: OrderItem[];
  shippingAddress: OrderShippingAddress | null;
};

export class CartStorageUnavailableError extends Error {
  constructor() {
    super("Cart storage is unavailable: Supabase service role is not configured.");
    this.name = "CartStorageUnavailableError";
  }
}

/**
 * RLS on checkout_carts has no policies, so this must use the service role.
 * The anon key cannot reach the table even if it tried.
 */
function requireAdminClient() {
  if (!hasSupabaseAdminEnv) {
    throw new CartStorageUnavailableError();
  }
  return createAdminClient();
}

export async function createCheckoutCart({
  items,
  shippingAddress,
  email,
}: {
  items: OrderItem[];
  shippingAddress: OrderShippingAddress | null;
  email?: string | null;
}): Promise<string> {
  const supabase = requireAdminClient();

  const { data, error } = await supabase
    .from("checkout_carts")
    .insert({
      cart: { items, shippingAddress } satisfies StoredCart,
      email: email ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Could not persist checkout cart: ${error?.message ?? "unknown error"}`);
  }

  return data.id as string;
}

/**
 * Records the Stripe session against the cart so the row can be reconciled
 * even if the webhook is retried or arrives out of order.
 *
 * Failure here is not fatal: the cart_ref in metadata is already enough for
 * the webhook to find the basket.
 */
export async function attachStripeSession(
  cartRef: string,
  stripeCheckoutSessionId: string,
): Promise<void> {
  try {
    await requireAdminClient()
      .from("checkout_carts")
      .update({ stripe_checkout_session_id: stripeCheckoutSessionId })
      .eq("id", cartRef);
  } catch (error) {
    console.error("Could not attach Stripe session to cart", error);
  }
}

/**
 * Loads the basket referenced by session metadata.
 *
 * Returns null when the reference is missing or the row cannot be read, so
 * callers can fall back to the legacy metadata path for sessions that were
 * created before this change was deployed.
 */
export async function loadCheckoutCart(
  cartRef: string | null | undefined,
): Promise<StoredCart | null> {
  if (!cartRef) return null;

  try {
    const { data, error } = await requireAdminClient()
      .from("checkout_carts")
      .select("cart")
      .eq("id", cartRef)
      .maybeSingle();

    if (error || !data) return null;
    return data.cart as StoredCart;
  } catch (error) {
    console.error("Could not load checkout cart", error);
    return null;
  }
}

/** Best-effort. A cart left 'open' is inert and simply expires. */
export async function markCartCompleted(
  cartRef: string | null | undefined,
): Promise<void> {
  if (!cartRef) return;
  try {
    await requireAdminClient()
      .from("checkout_carts")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", cartRef);
  } catch (error) {
    console.error("Could not mark cart completed", error);
  }
}

export type AbandonedCartRow = {
  id: string;
  email: string;
  items: OrderItem[];
};

/**
 * Finds carts created by a customer (email captured) that are still 'open'
 * past the delay and have not already been emailed, so the recovery sweep can
 * nudge the customer back. Requires the recovery_email_sent_at column from
 * supabase/setup-cart-recovery.sql.
 */
export async function findAbandonedCarts({
  olderThanMinutes = 60,
  limit = 40,
}: {
  olderThanMinutes?: number;
  limit?: number;
} = {}): Promise<AbandonedCartRow[]> {
  const supabase = requireAdminClient();
  const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("checkout_carts")
    .select("id, cart, email")
    .eq("status", "open")
    .not("email", "is", null)
    .is("recovery_email_sent_at", null)
    .lt("created_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Could not query abandoned carts: ${error.message}`);
  }

  return (data ?? []).flatMap((row) => {
    const stored = row.cart as StoredCart | null;
    const email = (row.email as string | null)?.trim() ?? "";
    if (!stored?.items?.length || !email) return [];
    return [{ id: row.id as string, email, items: stored.items }];
  });
}

/** Stamps a cart so the recovery sweep does not email it again. */
export async function markRecoveryEmailSent(
  cartRef: string,
): Promise<void> {
  try {
    await requireAdminClient()
      .from("checkout_carts")
      .update({ recovery_email_sent_at: new Date().toISOString() })
      .eq("id", cartRef);
  } catch (error) {
    console.error("Could not mark cart recovery email sent", error);
  }
}

/**
 * Returns the basket for cart restoration from the recovery email link.
 * Exposes items only — never the stored shipping address. Completed carts
 * (already paid) must not be restored.
 */
export async function getCartItemsForRestore(
  cartRef: string,
): Promise<OrderItem[] | null> {
  try {
    const { data, error } = await requireAdminClient()
      .from("checkout_carts")
      .select("cart, status")
      .eq("id", cartRef)
      .maybeSingle();

    if (error || !data || data.status === "completed") return null;
    const stored = data.cart as StoredCart | null;
    return stored?.items?.length ? stored.items : null;
  } catch (error) {
    console.error("Could not load cart for restore", error);
    return null;
  }
}

export type ResolvedCart = {
  items: OrderItem[];
  shippingAddress: OrderShippingAddress | null;
  cartRef: string | null;
  /**
   * "cart"     — read from checkout_carts (current path).
   * "legacy"   — recovered from inline session metadata, i.e. the session was
   *              created before cart storage shipped. Expected during rollout
   *              only; it will disappear once every pre-change session has
   *              settled.
   * "empty"    — nothing recoverable. The caller must not record an order.
   */
  source: "cart" | "legacy" | "empty";
};

/**
 * Single entry point for recovering a basket from a Stripe session.
 *
 * Both the webhook and the checkout success page need this, and they must
 * agree: whichever one records the order writes the shipping address into
 * orders.items. Keeping the legacy fallback in one place means the two cannot
 * drift.
 *
 * Takes the session metadata rather than the session so callers stay free to
 * expand line items however they need.
 */
export async function resolveCartFromSession(
  metadata: Record<string, string> | null | undefined,
): Promise<ResolvedCart> {
  const cartRef = metadata?.cart_ref ?? null;
  const storedCart = await loadCheckoutCart(cartRef);

  if (storedCart?.items?.length) {
    return {
      items: storedCart.items,
      shippingAddress: storedCart.shippingAddress ?? null,
      cartRef,
      source: "cart",
    };
  }

  if (cartRef) {
    console.error(
      `cart_ref ${cartRef} could not be read; falling back to inline session ` +
        "metadata. Expected only for sessions created before cart storage shipped.",
    );
  }

  // Legacy path: sessions created while the basket lived in metadata.
  let items: OrderItem[] = [];
  try {
    const parsed = JSON.parse(metadata?.items ?? "[]") as unknown;
    if (Array.isArray(parsed)) items = parsed as OrderItem[];
  } catch {
    items = [];
  }

  let shippingAddress: OrderShippingAddress | null = null;
  try {
    const raw = metadata?.shipping_address;
    if (raw) shippingAddress = JSON.parse(raw) as OrderShippingAddress;
  } catch {
    shippingAddress = null;
  }

  return {
    items,
    shippingAddress,
    cartRef,
    source: items.length ? "legacy" : "empty",
  };
}
