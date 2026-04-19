import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sendEmail } from "@/lib/email";
import { ordersFromEmail } from "@/lib/email-config";
import { recordOrder } from "@/lib/orders";
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
    const email = session.customer_details?.email ?? session.customer_email ?? null;
    const items = session.metadata?.items ?? "[]";

    await recordOrder({
      email,
      stripeCheckoutSessionId: session.id,
      stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
      amountTotal: session.amount_total ?? null,
      currency: session.currency ?? null,
      items,
      paymentStatus: session.payment_status ?? null
    });

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
