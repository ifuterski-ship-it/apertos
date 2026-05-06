import type { OrderRecord } from "@/lib/orders";
import { getProductById } from "@/lib/products";

const SHIPENGINE_BASE_URL = "https://api.shipengine.com";

export function hasShipEngineEnv() {
  return Boolean(process.env.SHIPENGINE_API_KEY);
}

function getHeaders() {
  return {
    "API-Key": process.env.SHIPENGINE_API_KEY ?? "",
    "Content-Type": "application/json"
  };
}

function getFromAddress() {
  const name = process.env.EASYPOST_FROM_NAME ?? "";
  const address_line1 = process.env.EASYPOST_FROM_STREET1 ?? "";
  const city_locality = process.env.EASYPOST_FROM_CITY ?? "";
  const postal_code = process.env.EASYPOST_FROM_ZIP ?? "";
  const country_code = process.env.EASYPOST_FROM_COUNTRY ?? "GB";
  const phone = process.env.EASYPOST_FROM_PHONE ?? "";

  const missing: string[] = [];
  if (!name) missing.push("EASYPOST_FROM_NAME");
  if (!address_line1) missing.push("EASYPOST_FROM_STREET1");
  if (!city_locality) missing.push("EASYPOST_FROM_CITY");
  if (!postal_code) missing.push("EASYPOST_FROM_ZIP");
  if (!phone) missing.push("EASYPOST_FROM_PHONE");

  if (missing.length) {
    throw new Error(
      `Sender address is not configured. Add these Vercel env vars: ${missing.join(", ")}`
    );
  }

  return {
    name,
    company_name: process.env.EASYPOST_FROM_COMPANY || undefined,
    address_line1,
    address_line2: process.env.EASYPOST_FROM_STREET2 || undefined,
    city_locality,
    state_province: process.env.EASYPOST_FROM_STATE || undefined,
    postal_code,
    country_code,
    phone
  };
}

function estimateWeightOz(order: OrderRecord) {
  const items = order.parsedItemsPayload.items;
  const total = items.reduce((sum, item) => {
    const product = getProductById(item.productId);
    return sum + (product?.shippingWeightLb ?? 0.5) * 16 * item.quantity;
  }, 0);
  return Math.max(total, 4);
}

type Rate = {
  rate_id: string;
  carrier_id: string;
  service_code: string;
  shipping_amount: { amount: number; currency: string };
};

type RatesResponse = {
  rate_response: {
    rates: Rate[];
    errors: Array<{ message: string }>;
  };
};

type LabelResponse = {
  label_id: string;
  tracking_number: string;
  label_download: { pdf: string };
  shipment_cost: { amount: number; currency: string };
  carrier_id: string;
  service_code: string;
};

export async function createShipEngineLabel(order: OrderRecord) {
  if (!hasShipEngineEnv()) {
    throw new Error("ShipEngine is not configured. Set SHIPENGINE_API_KEY.");
  }

  const address = order.parsedItemsPayload.shippingAddress;

  if (!address?.address1 || !address.city || !address.postalCode || !address.country) {
    throw new Error("This order has an incomplete shipping address.");
  }

  const weightOz = estimateWeightOz(order);

  // Get rates from all connected carriers
  const ratesRes = await fetch(`${SHIPENGINE_BASE_URL}/v1/rates`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      rate_options: { carrier_ids: [] },
      shipment: {
        ship_from: getFromAddress(),
        ship_to: {
          name: address.name ?? "Customer",
          address_line1: address.address1,
          address_line2: address.address2 || undefined,
          city_locality: address.city,
          state_province: address.state || undefined,
          postal_code: address.postalCode,
          country_code: address.country,
          phone: address.phone || undefined
        },
        packages: [{ weight: { value: weightOz, unit: "ounce" } }]
      }
    })
  });

  if (!ratesRes.ok) {
    throw new Error(`ShipEngine rates error ${ratesRes.status}: ${await ratesRes.text()}`);
  }

  const ratesData = (await ratesRes.json()) as RatesResponse;
  const rates = ratesData.rate_response.rates ?? [];

  if (!rates.length) {
    const errMsg = ratesData.rate_response.errors?.[0]?.message ?? "No rates returned";
    throw new Error(`ShipEngine returned no rates: ${errMsg}`);
  }

  const cheapest = [...rates].sort((a, b) => a.shipping_amount.amount - b.shipping_amount.amount)[0];

  // Purchase label from cheapest rate
  const labelRes = await fetch(`${SHIPENGINE_BASE_URL}/v1/labels/rates/${cheapest.rate_id}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ label_format: "pdf", label_layout: "4x6" })
  });

  if (!labelRes.ok) {
    throw new Error(`ShipEngine label error ${labelRes.status}: ${await labelRes.text()}`);
  }

  const label = (await labelRes.json()) as LabelResponse;

  if (!label.tracking_number) {
    throw new Error("ShipEngine did not return a tracking number.");
  }

  return {
    labelUrl: label.label_download.pdf,
    trackingNumber: label.tracking_number,
    transactionId: label.label_id,
    rateAmount: String(cheapest.shipping_amount.amount),
    rateCurrency: cheapest.shipping_amount.currency.toUpperCase(),
    provider: label.carrier_id,
    serviceLevel: label.service_code,
    purchasedAt: new Date().toISOString()
  };
}
