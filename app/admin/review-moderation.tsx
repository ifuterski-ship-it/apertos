"use client";

import { useState } from "react";
import type { PendingReview } from "@/lib/reviews";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`h-3.5 w-3.5 ${star <= rating ? "fill-white text-white" : "fill-transparent text-neutral-600"}`}
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

export function ReviewModeration({ initialReviews }: { initialReviews: PendingReview[] }) {
  const [reviews, setReviews] = useState<PendingReview[]>(initialReviews);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  const handleApprove = async (id: string) => {
    setProcessing((prev) => ({ ...prev, [id]: true }));
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: "PATCH" });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleReject = async (id: string) => {
    setProcessing((prev) => ({ ...prev, [id]: true }));
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (reviews.length === 0) {
    return (
      <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
        No reviews pending approval.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 lg:grid-cols-[1fr_auto]"
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-4">
              <StarDisplay rating={review.rating} />
              <p className="text-xs uppercase tracking-[0.25em] text-white">{review.reviewerName}</p>
              {review.verifiedPurchase ? (
                <span className="border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                  Verified Purchase
                </span>
              ) : null}
              <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                {new Date(review.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">{review.productName}</p>
            <p className="text-sm leading-7 tracking-[0.1em] text-neutral-300">{review.comment}</p>
          </div>

          <div className="flex gap-3 lg:flex-col lg:justify-center">
            <button
              type="button"
              onClick={() => handleApprove(review.id)}
              disabled={processing[review.id]}
              className="border border-emerald-500/40 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-emerald-400 transition hover:border-emerald-500 hover:bg-emerald-500/10 disabled:opacity-50"
            >
              {processing[review.id] ? "..." : "Approve"}
            </button>
            <button
              type="button"
              onClick={() => handleReject(review.id)}
              disabled={processing[review.id]}
              className="border border-red-500/30 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-red-400 transition hover:border-red-500 hover:bg-red-500/10 disabled:opacity-50"
            >
              {processing[review.id] ? "..." : "Reject"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
