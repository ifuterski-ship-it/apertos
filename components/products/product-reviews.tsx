"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";

type Review = {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

function Stars({ rating, interactive = false, onRate }: { rating: number; interactive?: boolean; onRate?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? "transition-opacity hover:opacity-80" : "cursor-default"}
          aria-label={interactive ? `Rate ${star} out of 5` : undefined}
        >
          <Star
            className={`${interactive ? "h-7 w-7" : "h-4 w-4"} transition-colors ${
              star <= (hovered || rating)
                ? "fill-white text-white"
                : "fill-transparent text-neutral-600"
            }`}
          />
        </button>
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
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ ok: boolean; text: string } | null>(null);

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitMessage(null);

    if (rating === 0) {
      setSubmitMessage({ ok: false, text: "Please select a star rating." });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/reviews/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewer_name: name, rating, comment })
      });
      const result = (await response.json()) as { ok: boolean; message?: string; review?: Review };

      if (!response.ok || !result.ok) {
        setSubmitMessage({ ok: false, text: result.message ?? "Unable to submit right now." });
        return;
      }

      if (result.review) {
        setReviews((prev) => [result.review!, ...prev]);
      }
      setName("");
      setRating(0);
      setComment("");
      setShowForm(false);
      setSubmitMessage({ ok: true, text: "Your review has been published. Thank you." });
    } catch {
      setSubmitMessage({ ok: false, text: "Unable to connect right now. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
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
              <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">No reviews yet — be the first.</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.3em] transition hover:border-white hover:bg-white hover:text-black"
        >
          {showForm ? "Cancel" : "Write A Review"}
        </button>
      </div>

      {/* Success message */}
      {submitMessage?.ok ? (
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">{submitMessage.text}</p>
      ) : null}

      {/* Review form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Your Review</p>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-neutral-400">Rating</label>
            <Stars rating={rating} interactive onRate={setRating} />
          </div>

          <div className="space-y-2">
            <label htmlFor="review-name" className="text-xs uppercase tracking-[0.3em] text-neutral-400">Your Name</label>
            <input
              id="review-name"
              type="text"
              required
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g. Alex"
              className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="review-comment" className="text-xs uppercase tracking-[0.3em] text-neutral-400">Review</label>
            <textarea
              id="review-comment"
              required
              minLength={10}
              maxLength={1000}
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How does it fit? How does it feel on the mat?"
              className="w-full resize-none border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white"
            />
          </div>

          {submitMessage && !submitMessage.ok ? (
            <p className="text-xs uppercase tracking-[0.25em] text-red-300">{submitMessage.text}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full border border-white px-5 py-4 text-xs font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting" : "Submit Review"}
          </button>
        </form>
      ) : null}

      {/* Review list */}
      {isLoading ? (
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Loading reviews...</p>
      ) : reviews.length === 0 && !showForm ? (
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          No reviews yet. Share your experience on the mat.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="space-y-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm uppercase tracking-[0.25em] text-white">{review.reviewer_name}</p>
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
