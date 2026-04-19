import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="space-y-8 pb-24">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Stripe Checkout</p>
        <h1 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">Checkout Cancelled</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
          Your cart is still here. You can return to the product pages and check out again whenever you are ready.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/cart"
            className="border border-white px-6 py-4 text-xs uppercase tracking-[0.35em] transition hover:bg-white hover:text-black"
          >
            Return To Cart
          </Link>
          <Link
            href="/shop"
            className="border border-white/10 px-6 py-4 text-xs uppercase tracking-[0.35em] text-neutral-300 transition hover:border-white hover:text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
