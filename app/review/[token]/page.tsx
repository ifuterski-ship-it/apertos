import { getReviewToken } from "@/lib/reviews";
import { ReviewForm } from "./review-form";

export default async function ReviewPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const reviewToken = await getReviewToken(token);

  if (!reviewToken) {
    return (
      <div className="mx-auto max-w-xl space-y-4 pb-24 pt-16 text-center">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Review</p>
        <h1 className="font-display text-3xl uppercase tracking-[0.08em]">Invalid Link</h1>
        <p className="text-sm uppercase leading-7 tracking-[0.2em] text-neutral-400">
          This review link is not valid. Please check your order confirmation email for the correct link.
        </p>
      </div>
    );
  }

  if (reviewToken.usedAt) {
    return (
      <div className="mx-auto max-w-xl space-y-4 pb-24 pt-16 text-center">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Review</p>
        <h1 className="font-display text-3xl uppercase tracking-[0.08em]">Already Submitted</h1>
        <p className="text-sm uppercase leading-7 tracking-[0.2em] text-neutral-400">
          You have already submitted a review for this order. Thank you for your feedback.
        </p>
      </div>
    );
  }

  if (new Date(reviewToken.expiresAt) < new Date()) {
    return (
      <div className="mx-auto max-w-xl space-y-4 pb-24 pt-16 text-center">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Review</p>
        <h1 className="font-display text-3xl uppercase tracking-[0.08em]">Link Expired</h1>
        <p className="text-sm uppercase leading-7 tracking-[0.2em] text-neutral-400">
          This review link expired 90 days after your order. Contact us at orders@apertosfightwear.com if you still want to leave a review.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10 pb-24">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Verified Purchase</p>
        <h1 className="font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">Leave A Review</h1>
        <p className="text-sm uppercase leading-7 tracking-[0.2em] text-neutral-400">
          Your review helps other athletes make the right call. All reviews are verified purchase only.
        </p>
      </div>

      <ReviewForm token={token} products={reviewToken.products} />
    </div>
  );
}
