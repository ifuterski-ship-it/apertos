import Link from "next/link";

export default function ReviewThankYouPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6 pb-24 pt-16 text-center">
      <p className="text-xs uppercase tracking-[0.45em] text-muted">Verified Review</p>
      <h1 className="font-display text-4xl uppercase tracking-[0.08em]">Thank You</h1>
      <p className="text-sm uppercase leading-7 tracking-[0.2em] text-neutral-400">
        Your review has been submitted and will appear on the product page once approved. We appreciate your feedback.
      </p>
      <Link
        href="/shop"
        className="inline-block border border-white px-6 py-4 text-xs font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black"
      >
        Back To Shop
      </Link>
    </div>
  );
}
