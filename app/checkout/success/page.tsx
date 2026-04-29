import Link from "next/link";
import { PurchaseEvent } from "@/components/analytics/purchase-event";
import { stripe } from "@/lib/stripe";

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

  if (stripe && sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
      const metadataItems = JSON.parse(session.metadata?.items ?? "[]") as Array<{
        productId: string;
        name: string;
        quantity: number;
        size: string;
        price: number;
      }>;
      customerEmail = session.customer_details?.email ?? session.customer_email ?? null;
      purchaseValue = (session.amount_total ?? 0) / 100;
      purchaseCurrency = (session.currency ?? "gbp").toUpperCase();
      purchaseItems = lineItems.data.map((item, index) => {
        const metadataItem = metadataItems[index];

        return {
          item_id: metadataItem?.productId ?? item.description ?? item.id,
          item_name: metadataItem?.name ?? item.description ?? "Apertos Product",
          item_variant: metadataItem?.size ?? "checkout",
          price: metadataItem?.price ?? (item.amount_total && item.quantity ? item.amount_total / item.quantity / 100 : 0),
          quantity: metadataItem?.quantity ?? item.quantity ?? 1
        };
      });
    } catch {
      customerEmail = null;
    }
  }

  return (
    <div className="space-y-8 pb-24">
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
        <h1 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">Payment Successful</h1>
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
