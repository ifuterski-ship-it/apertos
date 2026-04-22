import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sendEmail } from "@/lib/email";
import { ordersFromEmail } from "@/lib/email-config";
import { buildOrderItemsPayload, recordOrder } from "@/lib/orders";
import { reduceInventoryForOrder } from "@/lib/inventory";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, message: "Stripe webhook is not configured." }, { status: 500 });
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
    const message = error instanceof Error ? error.message : "Webhook signature verification failed.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const shippingDetails =
      session.shipping_details ??
      session.collected_information?.shipping_details ??
      session.customer_details?.shipping;
    const email = session.customer_details?.email ?? session.customer_email ?? null;
    const rawItems = session.metadata?.items ?? "[]";
    let items = [] as Array<{
      productId: string;
      name: string;
      quantity: number;
      size: string;
      price: number;
    }>;

    try {
      const parsed = JSON.parse(rawItems) as unknown;
      if (Array.isArray(parsed)) {
        items = parsed as Array<{
          productId: string;
          name: string;
          quantity: number;
          size: string;
          price: number;
        }>;
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
      postalCode: shippingDetails?.address?.postal_code ?? session.customer_details?.address?.postal_code ?? null,
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
      return NextResponse.json(
        {
          ok: false,
          message: recordResult.message ?? "Unable to persist order from Stripe webhook."
        },
        { status: 500 }
      );
    }

    // Reduce inventory for each item in the order
    const inventoryResults = await reduceInventoryForOrder(items);
    const inventoryErrors = inventoryResults.filter((result) => !result.ok);
    if (inventoryErrors.length > 0) {
      console.error("Inventory reduction errors:", inventoryErrors);
    }

    if (email) {
      await sendEmail({
        to: email,
        from: ordersFromEmail,
        subject: "Your APERTOS Order Confirmation",
        html: `
          <div style="background:#050505;color:#f5f5f5;padding:40px;font-family:Arial,sans-serif">
            <p style="letter-spacing:0.4em;text-transform:uppercase;color:#a3a3a3;font-size:12px">APERTOS</p>
            <h1 style="font-size:32px;text-transform:uppercase;margin:16px 0">Payment Received</h1>
            <p style="font-size:15px;line-height:1.8;color:#d4d4d4">
              Your Stripe checkout is complete and your APERTOS order is confirmed.
            </p>
            <p style="font-size:15px;line-height:1.8;color:#d4d4d4">
              Session: ${session.id}
            </p>
          </div>
        `
      });
    }
  }

  return NextResponse.json({ received: true });
}
