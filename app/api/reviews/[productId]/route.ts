import { NextResponse } from "next/server";
import { getApprovedReviews } from "@/lib/reviews";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const reviews = await getApprovedReviews(productId);
  return NextResponse.json({ ok: true, reviews });
}
