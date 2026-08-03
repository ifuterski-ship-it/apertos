import { NextResponse } from "next/server";
import { getReviewToken, submitVerifiedReviews } from "@/lib/reviews";

export const runtime = "nodejs";

type SubmitBody = {
  token: string;
  reviewerName: string;
  reviews: Array<{
    productId: string;
    productName: string;
    rating: number;
    comment: string;
  }>;
};

export async function POST(request: Request) {
  let body: SubmitBody;
  try {
    body = (await request.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const { token, reviewerName, reviews } = body;

  if (!token || typeof token !== "string") {
    return NextResponse.json({ ok: false, message: "Missing token." }, { status: 400 });
  }

  if (!reviewerName || typeof reviewerName !== "string" || reviewerName.trim().length < 2) {
    return NextResponse.json({ ok: false, message: "Please enter your name." }, { status: 400 });
  }

  if (!Array.isArray(reviews) || reviews.length === 0) {
    return NextResponse.json({ ok: false, message: "No reviews provided." }, { status: 400 });
  }

  for (const review of reviews) {
    if (typeof review.rating !== "number" || review.rating < 1 || review.rating > 5 || !Number.isInteger(review.rating)) {
      return NextResponse.json({ ok: false, message: "Invalid rating. Must be 1–5." }, { status: 400 });
    }
    if (typeof review.comment !== "string" || review.comment.trim().length < 10) {
      return NextResponse.json({ ok: false, message: "Review must be at least 10 characters." }, { status: 400 });
    }
  }

  const reviewToken = await getReviewToken(token);

  if (!reviewToken) {
    return NextResponse.json({ ok: false, message: "Invalid review link." }, { status: 404 });
  }

  if (reviewToken.usedAt) {
    return NextResponse.json({ ok: false, message: "This review link has already been used." }, { status: 409 });
  }

  if (new Date(reviewToken.expiresAt) < new Date()) {
    return NextResponse.json({ ok: false, message: "This review link has expired." }, { status: 410 });
  }

  const validProductIds = new Set(reviewToken.products.map((p) => p.id));
  for (const review of reviews) {
    if (!validProductIds.has(review.productId)) {
      return NextResponse.json({ ok: false, message: "Invalid product in review." }, { status: 400 });
    }
  }

  const result = await submitVerifiedReviews(reviewToken.id, reviewerName, reviews);

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
