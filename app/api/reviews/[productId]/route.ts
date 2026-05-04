import { NextResponse } from "next/server";
import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type ReviewRow = {
  id: string;
  product_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  if (!hasSupabaseAdminEnv) {
    return NextResponse.json({ ok: true, reviews: [] });
  }

  const { productId } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("id, product_id, reviewer_name, rating, comment, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, reviews: (data ?? []) as ReviewRow[] });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  if (!hasSupabaseAdminEnv) {
    return NextResponse.json({ ok: false, message: "Reviews are not available right now." }, { status: 503 });
  }

  const { productId } = await params;

  let body: { reviewer_name?: string; rating?: number; comment?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const { reviewer_name, rating, comment } = body;

  if (!reviewer_name || typeof reviewer_name !== "string" || reviewer_name.trim().length < 2) {
    return NextResponse.json({ ok: false, message: "Please enter your name (minimum 2 characters)." }, { status: 400 });
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json({ ok: false, message: "Please select a rating between 1 and 5." }, { status: 400 });
  }

  if (!comment || typeof comment !== "string" || comment.trim().length < 10) {
    return NextResponse.json({ ok: false, message: "Please write a review (minimum 10 characters)." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      product_id: productId,
      reviewer_name: reviewer_name.trim().slice(0, 80),
      rating,
      comment: comment.trim().slice(0, 1000)
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: "Unable to save your review right now." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, review: data as ReviewRow }, { status: 201 });
}
