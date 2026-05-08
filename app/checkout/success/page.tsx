import Link from "next/link";
import { PurchaseEvent } from "@/components/analytics/purchase-event";
import { CartClear } from "@/app/checkout/success/cart-clear";
import { getStripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import { renderOrderConfirmationEmail } from "@/lib/email-templates";
import { ordersFromEmail } from "@/lib/email-config";
import { decrementInventoryForOrder } from "@/lib/inventory";
import { buildOrderItemsPayload, getOrderForAdmin, recordOrder } from "@/lib/orders";
import { hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import type Stripe from "stripe";

type MetadataItem = {
  productId: string;
  name: string;
  quantity: number;
  size: string;
  price: number;
};

export default async function CheckoutSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  let customerEmail: string | null = null;
  let purchaseValue = 0;
  let purchaseCurrency = "GBP";
  let purchaseItems: Array<{
    item_id: string;
    item_name: string;
    item_variant: string;
    price: number;
    quantity: number;
  }> = [];

  const stripe = getStripe();
  if (stripe && sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
      const metadataItems = JSON.parse(session.metadata?.items ?? "[]") as MetadataItem[];
      customerEmail = session.customer_details?.email ?? session.customer_email ?? null;
      purchaseValue = (session.amount_total ?? 0) / 100;
      purchaseCurrency = (session.currency ?? "gbp").toUpperCase();
      purchaseItems = lineItems.data.map((item, index) => {
        const metadataItem = metadataItems[index];

        return {
          item_id: metadataItem?.productId ?? item.description ?? item.id,
          item_name: metadataItem?.name ?? item.description ?? "Apertos Product",
          item_variant: metadataItem?.size ?? "checkout",
          price:
            metadataItem?.price ??
            (item.amount_total && item.quantity ? item.amount_total / item.quantity / 100 : 0),
          quantity: metadataItem?.quantity ?? item.quantity ?? 1
        };
      });

      if (session.payment_status === "paid" && metadataItems.length > 0) {
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

        let metaAddress: Record<string, string | null> | null = null;
        try {
          const raw = session.metadata?.shipping_address;
          if (raw) metaAddress = JSON.parse(raw) as Record<string, string | null>;
        } catch { /* ignore */ }

        const shippingAddress = {
          name: shippingDetails?.name ?? metaAddress?.name ?? session.customer_details?.name ?? null,
          email: customerEmail,
          phone: metaAddress?.phone ?? session.customer_details?.phone ?? null,
          address1:
            shippingDetails?.address?.line1 ??
            metaAddress?.address1 ??
            session.customer_details?.address?.line1 ??
            null,
          address2:
            shippingDetails?.address?.line2 ??
            metaAddress?.address2 ??
            session.customer_details?.address?.line2 ??
            null,
          city:
            shippingDetails?.address?.city ??
            metaAddress?.city ??
            session.customer_details?.address?.city ??
            null,
          state:
            shippingDetails?.address?.state ??
            metaAddress?.state ??
            session.customer_details?.address?.state ??
            null,
          postalCode:
            shippingDetails?.address?.postal_code ??
            metaAddress?.postalCode ??
            session.customer_details?.address?.postal_code ??
            null,
          country:
            shippingDetails?.address?.country ??
            metaAddress?.country ??
            session.customer_details?.address?.country ??
            null
        };

        const alreadyRecorded =
          hasSupabaseAdminEnv
            ? !!(await getOrderForAdmin(sessionId).catch(() => null))
            : false;

        const result = await recordOrder({
          email: customerEmail,
          stripeCheckoutSessionId: sessionId,
          stripeCustomerId:
            typeof session.customer === "string" ? session.customer : null,
          amountTotal: session.amount_total ?? null,
          currency: session.currency ?? null,
          items: buildOrderItemsPayload(metadataItems, shippingAddress),
          paymentStatus: session.payment_status ?? null
        });

        if (result.ok && !alreadyRecorded) {
          if (hasSupabaseAdminEnv) {
            const recordedOrder = await getOrderForAdmin(sessionId).catch(() => null);
            if (recordedOrder) {
              await decrementInventoryForOrder(recordedOrder).catch(() => null);
            }
          }

          if (customerEmail) {
            await sendEmail({
              to: customerEmail,
              from: ordersFromEmail,
              subject: "Your APERTOS Order Confirmation",
              html: renderOrderConfirmationEmail({
                customerEmail,
                sessionId,
                items: metadataItems,
                amountTotal: session.amount_total ?? null
              })
            }).catch(() => null);
          }
        }
      }
    } catch {
      customerEmail = null;
    }
  }

  return (
    <div className="space-y-8 pb-24">
      <CartClear />
      {sessionId && purchaseItems.length > 0 ? (
        <PurchaseEvent
          transactionId={sessionId}
          currency={purchaseCurrency}
          value={purchaseValue}
          items={purchaseItems}
        />
      ) : null}
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Stripe Checkout</p>
        <h1 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">
          Payment Successful
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
          {customerEmail
            ? `Your payment is complete and a confirmation will be sent to ${customerEmail}.`
            : "Your payment is complete and your APERTOS order is confirmed."}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/shop"
            className="border border-white px-6 py-4 text-xs uppercase tracking-[0.35em] transition hover:bg-white hover:text-black"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account"
            className="border border-white/10 px-6 py-4 text-xs uppercase tracking-[0.35em] text-neutral-300 transition hover:border-white hover:text-white"
          >
            View Account
          </Link>
        </div>
      </div>
    </div>
  );
}
