import { NextResponse } from "next/server";
import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { getOrderForAdmin, saveShippingLabelForOrder } from "@/lib/orders";
import { isAdminEmail } from "@/lib/admin-auth";

export const runtime = "nodejs";

const SHIPSTATION_API_KEY = process.env.SHIPSTATION_API_KEY ?? "";
const SHIPSTATION_API_SECRET = process.env.SHIPSTATION_API_SECRET ?? "";
const SHIPSTATION_BASE_URL = "https://ssapi.shipstation.com";

// Carrier/service codes — override via env vars to match your ShipStation account
const DOMESTIC_CARRIER = process.env.SHIPSTATION_DOMESTIC_CARRIER ?? "evri";
const DOMESTIC_SERVICE = process.env.SHIPSTATION_DOMESTIC_SERVICE ?? "evri_economy";
const INTL_CARRIER = process.env.SHIPSTATION_INTL_CARRIER ?? "royal-mail";
const INTL_SERVICE = process.env.SHIPSTATION_INTL_SERVICE ?? "rm_international_tracked";

type ShipStationOrderResponse = {
  orderId: number;
  orderNumber: string;
};

type ShipStationLabelResponse = {
  shipmentId: number;
  shipmentCost: number;
  trackingNumber: string;
  labelData: string; // base64-encoded PDF
};

function getAuthHeader() {
  // ShipStation requires Basic Auth: base64(apiKey:apiSecret)
  const credentials = Buffer.from(`${SHIPSTATION_API_KEY}:${SHIPSTATION_API_SECRET}`).toString("base64");
  return `Basic ${credentials}`;
}

async function shipStation<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${SHIPSTATION_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ShipStation ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

function pickCarrier(country: string) {
  return country === "GB"
    ? { carrierCode: DOMESTIC_CARRIER, serviceCode: DOMESTIC_SERVICE }
    : { carrierCode: INTL_CARRIER, serviceCode: INTL_SERVICE };
}

function estimateWeightOz(items: Array<{ quantity: number }>) {
  // 8 oz per item is a reasonable default for fightwear garments
  return Math.max(items.reduce((sum, item) => sum + 8 * item.quantity, 0), 4);
}

export async function POST(request: Request) {
  // ── 1. Env checks ──────────────────────────────────────────────────────────
  if (!SHIPSTATION_API_KEY || !SHIPSTATION_API_SECRET) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "ShipStation is not configured. Set SHIPSTATION_API_KEY and SHIPSTATION_API_SECRET."
      },
      { status: 500 }
    );
  }

  if (!hasSupabaseEnv || !hasSupabaseAdminEnv) {
    return NextResponse.json(
      { ok: false, message: "Supabase is not fully configured." },
      { status: 500 }
    );
  }

  // ── 2. Admin auth ───────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, message: "Authentication required." }, { status: 401 });
  }

  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ ok: false, message: "Admin access required." }, { status: 403 });
  }

  // ── 3. Parse request body ───────────────────────────────────────────────────
  let sessionId: string;
  try {
    const body = (await request.json()) as { sessionId?: string };
    if (!body.sessionId) {
      return NextResponse.json({ ok: false, message: "sessionId is required." }, { status: 400 });
    }
    sessionId = body.sessionId;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  try {
    // ── 4. Pull order from Supabase ─────────────────────────────────────────
    const order = await getOrderForAdmin(sessionId);
    if (!order) {
      return NextResponse.json({ ok: false, message: "Order not found." }, { status: 404 });
    }

    const payload = order.parsedItemsPayload;
    const address = payload.shippingAddress;

    if (!address?.address1 || !address.city || !address.postalCode || !address.country) {
      return NextResponse.json(
        { ok: false, message: "This order has an incomplete shipping address." },
        { status: 422 }
      );
    }

    // ── 5. Build ShipStation order and select carrier ───────────────────────
    const { carrierCode, serviceCode } = pickCarrier(address.country);
    const weightOz = estimateWeightOz(payload.items);
    const orderNumber = `APERTOS-${sessionId.slice(-10).toUpperCase()}`;
    const today = new Date().toISOString().slice(0, 10);

    const shipTo = {
      name: address.name ?? "Customer",
      street1: address.address1,
      street2: address.address2 ?? undefined,
      city: address.city,
      state: address.state ?? undefined,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone ?? undefined
    };

    // ── 6. Create order in ShipStation ─────────────────────────────────────
    const ssOrder = await shipStation<ShipStationOrderResponse>("/orders/createorder", {
      orderNumber,
      orderDate: order.createdAt ?? new Date().toISOString(),
      orderStatus: "awaiting_shipment",
      customerEmail: order.email ?? undefined,
      billTo: shipTo,
      shipTo,
      items: payload.items.map((item) => ({
        lineItemKey: `${item.productId}-${item.size}`,
        sku: item.productId,
        name: `${item.name} / ${item.size}`,
        quantity: item.quantity,
        unitPrice: item.price
      })),
      amountPaid: order.amountTotal != null ? order.amountTotal / 100 : undefined,
      taxAmount: 0,
      shippingAmount: 0,
      weight: { value: weightOz, units: "ounces" }
    });

    // ── 7. Create shipping label ────────────────────────────────────────────
    const labelResponse = await shipStation<ShipStationLabelResponse>(
      "/orders/createlabelfororder",
      {
        orderId: ssOrder.orderId,
        carrierCode,
        serviceCode,
        packageCode: "package",
        confirmation: "none",
        shipDate: today,
        weight: { value: weightOz, units: "ounces" },
        testLabel: false
      }
    );

    if (!labelResponse.trackingNumber) {
      throw new Error("ShipStation did not return a tracking number.");
    }

    // ── 8. Upload label PDF to Supabase Storage ─────────────────────────────
    let labelUrl: string;
    try {
      const adminSupabase = createAdminClient();
      const pdfBuffer = Buffer.from(labelResponse.labelData, "base64");
      const storagePath = `${sessionId}.pdf`;

      await adminSupabase.storage
        .from("labels")
        .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });

      const { data: urlData } = adminSupabase.storage.from("labels").getPublicUrl(storagePath);
      labelUrl = urlData.publicUrl;
    } catch {
      // Fallback: inline data URI if the Storage bucket isn't set up yet
      labelUrl = `data:application/pdf;base64,${labelResponse.labelData}`;
    }

    // ── 9. Save tracking number and label URL back to the order ────────────
    await saveShippingLabelForOrder(sessionId, {
      labelUrl,
      trackingNumber: labelResponse.trackingNumber,
      transactionId: String(labelResponse.shipmentId),
      rateAmount: String(labelResponse.shipmentCost),
      rateCurrency: "GBP",
      provider: carrierCode,
      serviceLevel: serviceCode,
      purchasedAt: new Date().toISOString()
    });

    // ── 10. Return result ───────────────────────────────────────────────────
    return NextResponse.json({
      ok: true,
      labelUrl,
      trackingNumber: labelResponse.trackingNumber,
      carrier: carrierCode,
      service: serviceCode,
      shipmentId: labelResponse.shipmentId,
      cost: labelResponse.shipmentCost
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create a shipping label right now.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
