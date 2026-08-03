"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReviewProduct } from "@/lib/reviews";

function Stars({
  rating,
  onRate
}: {
  rating: number;
  onRate: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`Rate ${star} out of 5`}
          className="transition-opacity hover:opacity-80"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`h-7 w-7 transition-colors ${
              star <= (hovered || rating)
                ? "fill-white text-white"
                : "fill-transparent text-neutral-600"
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
        </button>
      ))}
    </div>
  );
}

type ProductRating = {
  rating: number;
  comment: string;
};

export function ReviewForm({
  token,
  products
}: {
  token: string;
  products: ReviewProduct[];
}) {
  const router = useRouter();
  const [reviewerName, setReviewerName] = useState("");
  const [ratings, setRatings] = useState<Record<string, ProductRating>>(
    Object.fromEntries(products.map((p) => [p.id, { rating: 0, comment: "" }]))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setRating = (productId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [productId]: { ...prev[productId], rating } }));
  };

  const setComment = (productId: string, comment: string) => {
    setRatings((prev) => ({ ...prev, [productId]: { ...prev[productId], comment } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (reviewerName.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }

    for (const product of products) {
      if (ratings[product.id].rating === 0) {
        setError(`Please select a star rating for ${product.name}.`);
        return;
      }
      if (ratings[product.id].comment.trim().length < 10) {
        setError(`Please write at least 10 characters for your ${product.name} review.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          reviewerName: reviewerName.trim(),
          reviews: products.map((p) => ({
            productId: p.id,
            productName: p.name,
            rating: ratings[p.id].rating,
            comment: ratings[p.id].comment
          }))
        })
      });

      const result = (await res.json()) as { ok: boolean; message?: string };

      if (!result.ok) {
        setError(result.message ?? "Unable to submit. Please try again.");
        return;
      }

      router.push("/review/thank-you");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="space-y-2">
        <label htmlFor="reviewer-name" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          Your Name
        </label>
        <input
          id="reviewer-name"
          type="text"
          required
          minLength={2}
          maxLength={80}
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          placeholder="E.g. Alex"
          className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white"
        />
      </div>

      {products.map((product) => (
        <div key={product.id} className="space-y-5 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
          <p className="font-display text-lg uppercase tracking-[0.08em]">{product.name}</p>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-neutral-400">Rating</label>
            <Stars rating={ratings[product.id].rating} onRate={(r) => setRating(product.id, r)} />
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`comment-${product.id}`}
              className="text-xs uppercase tracking-[0.3em] text-neutral-400"
            >
              Your Review
            </label>
            <textarea
              id={`comment-${product.id}`}
              required
              minLength={10}
              maxLength={1000}
              rows={4}
              value={ratings[product.id].comment}
              onChange={(e) => setComment(product.id, e.target.value)}
              placeholder="How does it fit? How does it perform on the mat?"
              className="w-full resize-none border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white"
            />
          </div>
        </div>
      ))}

      {error ? (
        <p className="text-xs uppercase tracking-[0.25em] text-red-300">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full border border-white px-5 py-4 text-xs font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
