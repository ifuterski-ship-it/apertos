import { NextResponse } from "next/server";
import { createReviewToken } from "@/lib/reviews";
import { products } from "@/lib/products";
import { absoluteUrl } from "@/lib/site";

export const runtime = "nodejs";

type Body = {
  email: string;
  productIds: string[];
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const { email, productIds } = body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ ok: false, message: "Valid email required." }, { status: 400 });
  }

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ ok: false, message: "Select at least one product." }, { status: 400 });
  }

  const reviewProducts = productIds
    .map((id) => {
      const product = products.find((p) => p.id === id);
      if (!product) return null;
      return { id: product.id, name: product.name, image: product.image };
    })
    .filter(Boolean) as { id: string; name: string; image: string }[];

  if (reviewProducts.length === 0) {
    return NextResponse.json({ ok: false, message: "No valid products found." }, { status: 400 });
  }

  const token = await createReviewToken(`manual-${Date.now()}`, email, reviewProducts);

  if (!token) {
    return NextResponse.json({ ok: false, message: "Failed to generate token." }, { status: 500 });
  }

  const url = absoluteUrl(`/review/${token}`);

  return NextResponse.json({ ok: true, url, token });
}
