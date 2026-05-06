import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { ordersFromEmail } from "@/lib/email-config";
import { renderShippingNotificationEmail } from "@/lib/email-templates";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { getOrderForAdmin, saveShippingLabelForOrder } from "@/lib/orders";
import { isAdminEmail } from "@/lib/admin-auth";
import { createShipStationLabel } from "@/lib/shipstation";

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

    const result = await createShipStationLabel(order);

    // Upload label PDF to Supabase Storage
    let labelUrl: string;
    try {
      const adminSupabase = createAdminClient();
      const pdfBuffer = Buffer.from(result.labelData, "base64");
      const storagePath = `${sessionId}.pdf`;

      await adminSupabase.storage
        .from("labels")
        .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });

      const { data: urlData } = adminSupabase.storage.from("labels").getPublicUrl(storagePath);
      labelUrl = urlData.publicUrl;
    } catch {
      labelUrl = `data:application/pdf;base64,${result.labelData}`;
    }

    const shippingLabel = {
      labelUrl,
      trackingNumber: result.trackingNumber,
      transactionId: String(result.shipmentId),
      rateAmount: String(result.shipmentCost),
      rateCurrency: "GBP",
      provider: result.carrierCode,
      serviceLevel: result.serviceCode,
      purchasedAt: new Date().toISOString()
    };

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
