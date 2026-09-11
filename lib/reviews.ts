import { randomBytes } from "crypto";
import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";

export type ReviewProduct = {
  id: string;
  name: string;
  image: string;
};

export type ReviewToken = {
  id: string;
  token: string;
  stripeCheckoutSessionId: string;
  email: string;
  products: ReviewProduct[];
  usedAt: string | null;
  expiresAt: string;
  createdAt: string;
};

export function parseMediaUrls(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      // fall through
    }
  }
  return [];
}

export type PendingReview = {
  id: string;
  productId: string;
  productName: string;
  reviewerName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  mediaUrls: string[];
  createdAt: string;
};

export async function createReviewToken(
  stripeCheckoutSessionId: string,
  email: string,
  reviewProducts: ReviewProduct[]
): Promise<string | null> {
  if (!hasSupabaseAdminEnv) return null;

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("review_tokens")
    .select("token")
    .eq("stripe_checkout_session_id", stripeCheckoutSessionId)
    .maybeSingle();

  if (existing) return existing.token as string;

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("review_tokens").insert({
    token,
    stripe_checkout_session_id: stripeCheckoutSessionId,
    email,
    products: reviewProducts,
    expires_at: expiresAt
  });

  if (error) {
    console.warn("Failed to create review token:", error.message);
    return null;
  }

  return token;
}

export async function getReviewToken(token: string): Promise<ReviewToken | null> {
  if (!hasSupabaseAdminEnv) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("review_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) return null;

  const raw = data as Record<string, unknown>;
  const products = Array.isArray(raw.products)
    ? (raw.products as ReviewProduct[])
    : (JSON.parse(raw.products as string) as ReviewProduct[]);

  return {
    id: raw.id as string,
    token: raw.token as string,
    stripeCheckoutSessionId: raw.stripe_checkout_session_id as string,
    email: raw.email as string,
    products,
    usedAt: raw.used_at as string | null,
    expiresAt: raw.expires_at as string,
    createdAt: raw.created_at as string
  };
}

export async function submitVerifiedReviews(
  tokenId: string,
  reviewerName: string,
  reviews: Array<{
    productId: string;
    productName: string;
    rating: number;
    comment: string;
    mediaUrls?: string[];
  }>
): Promise<{ ok: boolean; message?: string }> {
  if (!hasSupabaseAdminEnv) return { ok: false, message: "Reviews unavailable." };

  const supabase = createAdminClient();

  const rows = reviews.map((r) => ({
    token_id: tokenId,
    product_id: r.productId,
    product_name: r.productName,
    reviewer_name: reviewerName.trim().slice(0, 80),
    rating: r.rating,
    comment: r.comment.trim().slice(0, 1000),
    verified_purchase: true,
    approved: false,
    media_urls: r.mediaUrls ?? []
  }));

  const { error } = await supabase.from("reviews").insert(rows);
  if (error) {
    console.warn("Failed to insert reviews:", error.message);
    return { ok: false, message: "Unable to save your review right now." };
  }

  await supabase
    .from("review_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", tokenId);

  return { ok: true };
}

export async function getApprovedReviews(productId: string) {
  if (!hasSupabaseAdminEnv) return [];

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, product_id, reviewer_name, rating, comment, verified_purchase, media_urls, created_at")
    .eq("product_id", productId)
    .eq("approved", true)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      product_id: r.product_id as string,
      reviewer_name: r.reviewer_name as string,
      rating: r.rating as number,
      comment: r.comment as string,
      verified_purchase: Boolean(r.verified_purchase),
      media_urls: parseMediaUrls(r.media_urls),
      created_at: r.created_at as string
    };
  });
}

export async function getPendingReviews(): Promise<PendingReview[]> {
  if (!hasSupabaseAdminEnv) return [];

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("reviews")
    .select(
      "id, product_id, product_name, reviewer_name, rating, comment, verified_purchase, media_urls, created_at"
    )
    .eq("approved", false)
    .order("created_at", { ascending: false });

  return ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    id: r.id as string,
    productId: r.product_id as string,
    productName: (r.product_name as string) || (r.product_id as string),
    reviewerName: r.reviewer_name as string,
    rating: r.rating as number,
    comment: r.comment as string,
    verifiedPurchase: Boolean(r.verified_purchase),
    mediaUrls: parseMediaUrls(r.media_urls),
    createdAt: r.created_at as string
  }));
}

export async function approveReview(id: string): Promise<void> {
  if (!hasSupabaseAdminEnv) return;
  const supabase = createAdminClient();
  await supabase.from("reviews").update({ approved: true }).eq("id", id);
}

export async function rejectReview(id: string): Promise<void> {
  if (!hasSupabaseAdminEnv) return;
  const supabase = createAdminClient();
  await supabase.from("reviews").delete().eq("id", id);
}
