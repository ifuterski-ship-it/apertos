import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { ordersFromEmail } from "@/lib/email-config";
import { renderShippingNotificationEmail } from "@/lib/email-templates";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { getOrderForAdmin, saveShippingLabelForOrder } from "@/lib/orders";
import { isAdminEmail } from "@/lib/admin-auth";
import { purchaseCheapestLabel } from "@/lib/easypost";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  if (!hasSupabaseEnv) {
    return NextResponse.json({ ok: false, message: "Supabase auth is not configured." }, { status: 500 });
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

    const shippingLabel = await purchaseCheapestLabel(order);
    const updatedOrder = await saveShippingLabelForOrder(order.stripeCheckoutSessionId, shippingLabel);
    const shippingAddress = updatedOrder.parsedItemsPayload.shippingAddress;

    if (updatedOrder.email) {
      await sendEmail({
        to: updatedOrder.email,
        from: ordersFromEmail,
        subject: "Your APERTOS Shipping Update",
        html: renderShippingNotificationEmail({
          customerName: shippingAddress?.name ?? null,
          trackingNumber: shippingLabel.trackingNumber,
          shippingLabel
        })
      });
    }

    return NextResponse.json({
      ok: true,
      labelUrl: shippingLabel.labelUrl,
      trackingNumber: shippingLabel.trackingNumber,
      provider: shippingLabel.provider,
      serviceLevel: shippingLabel.serviceLevel,
      rateAmount: shippingLabel.rateAmount,
      rateCurrency: shippingLabel.rateCurrency
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate a shipping label right now.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
