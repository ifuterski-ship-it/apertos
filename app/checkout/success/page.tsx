import Link from "next/link";
import { stripe } from "@/lib/stripe";

export default async function CheckoutSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  let customerEmail: string | null = null;

  if (stripe && sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      customerEmail = session.customer_details?.email ?? session.customer_email ?? null;
    } catch {
      customerEmail = null;
    }
  }

  return (
    <div className="space-y-8 pb-24">
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
