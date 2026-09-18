import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllApprovedReviews } from "@/lib/reviews";
import { getProductById } from "@/lib/products";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Reviews | Apertos Fightwear",
  description:
    "Read verified reviews from fighters and grapplers training in Apertos Fightwear — rash guards, MMA shorts, no-gi sets and hoodies.",
  robots: { index: true, follow: true }
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

function MediaAttachments({ urls }: { urls: string[] }) {
  if (!urls || urls.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {urls.map((url) => {
        const isVideo = /\.(mp4|webm|mov)$/i.test(url);
        return (
          <div
            key={url}
            className="aspect-square overflow-hidden rounded-[0.75rem] border border-white/10 bg-black/30"
          >
            {isVideo ? (
              <video src={url} controls className="h-full w-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="Customer photo" className="h-full w-full object-cover" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default async function ReviewsPage() {
  const reviews = await getAllApprovedReviews();

  const ratings = reviews.map((r) => r.rating);
  const average =
    ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;

  const reviewSchema = reviews.length
    ? {
        "@context": "https://schema.org",
        "@type": "AggregateRating",
        itemReviewed: { "@type": "Organization", name: "Apertos Fightwear" },
        ratingValue: average.toFixed(1),
        bestRating: "5",
        reviewCount: reviews.length
      }
    : null;

  return (
    <div className="space-y-12 pb-24">
      {reviewSchema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
      ) : null}

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.45em] text-crimson">Reviews</p>
        <h1 className="font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">
          What Fighters Say
        </h1>
        <p className="max-w-xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-400">
          Verified reviews from athletes training in Apertos Fightwear.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/10 bg-panel p-10 text-center">
          <p className="text-sm uppercase leading-7 tracking-[0.25em] text-neutral-400">
            No reviews just yet. Review links go out with every order.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-panel p-6">
              <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-500">Average Rating</p>
              <p className="mt-2 font-display text-5xl">{average.toFixed(1)}</p>
              <div className="mt-3">
                <Stars rating={Math.round(average)} />
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.25em] text-neutral-400">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review) => {
              const product = getProductById(review.productId);
              return (
                <div
                  key={review.id}
                  className="flex flex-col space-y-4 rounded-[1.75rem] border border-white/10 bg-panel p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <p className="text-xs uppercase tracking-[0.25em] text-white">{review.reviewerName}</p>
                      {review.verifiedPurchase ? (
                        <span className="border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                          Verified
                        </span>
                      ) : null}
                    </div>
                    <Stars rating={review.rating} />
                  </div>

                  {product ? (
                    <Link
                      href={`/product/${product.id}`}
                      className="group flex items-center gap-4 rounded-[1.25rem] border border-white/10 bg-black/30 p-3 transition hover:border-white/25"
                    >
                      {product.image ? (
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[0.75rem] bg-black/40">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                      ) : null}
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                          {product.category}
                        </p>
                        <p className="truncate font-display text-sm uppercase tracking-[0.08em] transition group-hover:text-crimson">
                          {product.name}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                      {review.productName}
                    </p>
                  )}

                  <p className="text-sm leading-7 tracking-[0.12em] text-neutral-300">{review.comment}</p>
                  <MediaAttachments urls={review.mediaUrls} />
                  <p className="mt-auto text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                    {new Date(review.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}