"use client";

import { useEffect, useState } from "react";

type Review = {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  verified_purchase?: boolean;
  created_at: string;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`h-4 w-4 transition-colors ${
            star <= rating ? "fill-white text-white" : "fill-transparent text-neutral-600"
          }`}
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
          />
        </svg>
      ))}
    </div>
  );
}

export function ProductReviews({
  productId,
  initialAverage,
  initialCount
}: {
  productId: string;
  initialAverage: number | null;
  initialCount: number;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reviews/${productId}`)
      .then((r) => r.json())
      .then((data: { ok: boolean; reviews?: Review[] }) => {
        if (data.ok && data.reviews) setReviews(data.reviews);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [productId]);

  const count = reviews.length || initialCount;
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : initialAverage;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-8">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.45em] text-muted">Reviews</p>
          <div className="flex items-center gap-4">
            {average !== null ? (
              <>
                <Stars rating={Math.round(average)} />
                <p className="text-sm uppercase tracking-[0.2em] text-neutral-300">
                  {average.toFixed(1)} / 5 &nbsp;·&nbsp; {count} {count === 1 ? "review" : "reviews"}
                </p>
              </>
            ) : (
              <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">No reviews yet.</p>
            )}
          </div>
        </div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
          Purchased? Check your order email for a review link.
        </p>
      </div>

      {isLoading ? (
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          No reviews yet. Be the first to share your experience on the mat.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="space-y-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 md:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="text-sm uppercase tracking-[0.25em] text-white">{review.reviewer_name}</p>
                    {review.verified_purchase ? (
                      <span className="border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                        Verified
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                    {new Date(review.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                </div>
                <Stars rating={review.rating} />
              </div>
              <p className="text-sm leading-7 tracking-[0.15em] text-neutral-300">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
