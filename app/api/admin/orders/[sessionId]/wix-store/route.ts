import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin-auth";
import { getOrderForAdmin, savePodHandoffForOrder } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createWixStoreOrder, getWixStoreProductMap } from "@/lib/wix-store";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  if (!hasSupabaseEnv) {
    return NextResponse.json({ ok: false, message: "Supabase is not configured." }, { status: 500 });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, message: "You must be logged in to continue." }, { status: 401 });
  }

  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ ok: false, message: "You do not have access to the admin panel." }, { status: 403 });
  }

  try {
    const { sessionId } = await params;
    const order = await getOrderForAdmin(sessionId);

    if (!order) {
      return NextResponse.json({ ok: false, message: "Order not found." }, { status: 404 });
    }

    if (order.parsedItemsPayload.podHandoff) {
      return NextResponse.json(
        { ok: false, message: "This order has already been submitted to Wix." },
        { status: 409 }
      );
    }

    const productMap = getWixStoreProductMap();
    const result = await createWixStoreOrder(order, productMap);

    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message }, { status: 502 });
    }

    const handoff = {
      externalOrderId: result.orderId!,
      submittedAt: new Date().toISOString(),
      externalOrderUrl: result.orderUrl ?? null
    };

    await savePodHandoffForOrder(sessionId, handoff);

    return NextResponse.json({
      ok: true,
      orderId: result.orderId,
      orderUrl: result.orderUrl
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit to Wix right now.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}