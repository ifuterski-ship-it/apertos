import { NextResponse } from "next/server";
import { getCartItemsForRestore } from "@/lib/checkout-carts";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ ok: false, message: "Invalid cart reference." }, { status: 400 });
  }

  const items = await getCartItemsForRestore(id);

  if (!items) {
    return NextResponse.json({ ok: false, message: "Basket not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, items });
}