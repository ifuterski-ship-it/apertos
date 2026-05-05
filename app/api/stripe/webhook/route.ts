import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sendEmail } from "@/lib/email";
import { renderOrderConfirmationEmail } from "@/lib/email-templates";
import { ordersFromEmail } from "@/lib/email-config";
import { decrementInventoryForOrder } from "@/lib/inventory";
import { buildOrderItemsPayload, getOrderForAdmin, recordOrder } from "@/lib/orders";
import { stripe } from "@/lib/stripe";
import { hasSupabaseAdminEnv } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type ParsedItem = {
  productId: string;
  name: string;
  quantity: number;
  size: string;
  price: number;
};

async function handleCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<{ ok: boolean; message?: string }> {
  const sessionWithShipping = session as Stripe.Checkout.Session & {
    shipping_details?: {
      name?: string | null;
      address?: {
        line1?: string | null;
        line2?: string | null;
        city?: string | null;
        state?: string | null;
        postal_code?: string | null;
        country?: string | null;
      } | null;
    } | null;
  };
  const shippingDetails =
    sessionWithShipping.shipping_details ??
    session.collected_information?.shipping_details;
  const email = session.customer_details?.email ?? session.customer_email ?? null;
  const rawItems = session.metadata?.items ?? "[]";
  let items: ParsedItem[] = [];

  try {
    const parsed = JSON.parse(rawItems) as unknown;
    if (Array.isArray(parsed)) {
      items = parsed as ParsedItem[];
    }
  } catch {
    items = [];
  }

  const shippingAddress = {
    name: shippingDetails?.name ?? session.customer_details?.name ?? null,
    email,
    phone: session.customer_details?.phone ?? null,
    address1: shippingDetails?.address?.line1 ?? session.customer_details?.address?.line1 ?? null,
    address2: shippingDetails?.address?.line2 ?? session.customer_details?.address?.line2 ?? null,
    city: shippingDetails?.address?.city ?? session.customer_details?.address?.city ?? null,
    state: shippingDetails?.address?.state ?? session.customer_details?.address?.state ?? null,
    postalCode:
      shippingDetails?.address?.postal_code ??
      session.customer_details?.address?.postal_code ??
      null,
    country: shippingDetails?.address?.country ?? session.customer_details?.address?.country ?? null
  };

  const recordResult = await recordOrder({
    email,
    stripeCheckoutSessionId: session.id,
    stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
    amountTotal: session.amount_total ?? null,
    currency: session.currency ?? null,
    items: buildOrderItemsPayload(items, shippingAddress),
    paymentStatus: session.payment_status ?? null
  });

  if (!recordResult.ok) {
    return { ok: false, message: recordResult.message ?? "Unable to persist order from webhook." };
  }

  if (hasSupabaseAdminEnv) {
    const recordedOrder = await getOrderForAdmin(session.id);
    if (recordedOrder) {
      await decrementInventoryForOrder(recordedOrder);
    }
  }

  if (email) {
    await sendEmail({
      to: email,
      from: ordersFromEmail,
      subject: "Your APERTOS Order Confirmation",
      html: renderOrderConfirmationEmail({
        customerEmail: email,
        sessionId: session.id,
        items,
        amountTotal: session.amount_total ?? null
      })
    });
  }

  return { ok: true };
}

export async function POST(request: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { ok: false, message: "Stripe webhook is not configured." },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ ok: false, message: "Missing Stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook signature verification failed.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const result = await handleCheckoutSession(session);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.message ?? "Unable to persist order." },
        { status: 500 }
      );
    }
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    // Look up the Checkout Session associated with this payment intent.
    // recordOrder uses upsert on stripe_checkout_session_id, so calling this
    // after checkout.session.completed has already fired is safe and idempotent.
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
      limit: 1
    });
    const session = sessions.data[0];
    if (session) {
      await handleCheckoutSession(session);
    }
  }

  return NextResponse.json({ received: true });
}
