import type { OrderRecord } from "@/lib/orders";
import { getProductById } from "@/lib/products";

const SHIPENGINE_BASE_URL = "https://api.shipengine.com";
const FREE_SHIPPING_THRESHOLD_PENCE = 4000;

const defaultAllowedCountries = ["GB", "IE", "US", "CA", "FR", "DE", "ES", "IT", "NL", "BE", "PT"];

export function getAllowedShippingCountries() {
  const configured = (process.env.STRIPE_SHIPPING_COUNTRIES ?? "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
  return configured.length ? configured : defaultAllowedCountries;
}

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
  const name = process.env.SHIPENGINE_FROM_NAME ?? "";
  const address_line1 = process.env.SHIPENGINE_FROM_STREET1 ?? "";
  const city_locality = process.env.SHIPENGINE_FROM_CITY ?? "";
  const postal_code = process.env.SHIPENGINE_FROM_ZIP ?? "";
  const country_code = process.env.SHIPENGINE_FROM_COUNTRY ?? "GB";
  const phone = process.env.SHIPENGINE_FROM_PHONE ?? "";

  const missing: string[] = [];
  if (!name) missing.push("SHIPENGINE_FROM_NAME");
  if (!address_line1) missing.push("SHIPENGINE_FROM_STREET1");
  if (!city_locality) missing.push("SHIPENGINE_FROM_CITY");
  if (!postal_code) missing.push("SHIPENGINE_FROM_ZIP");
  if (!phone) missing.push("SHIPENGINE_FROM_PHONE");

  if (missing.length) {
    throw new Error(
      `Sender address is not configured. Set these Vercel env vars: ${missing.join(", ")}`
    );
  }

  return {
    name,
    company_name: process.env.SHIPENGINE_FROM_COMPANY || undefined,
    address_line1,
    address_line2: process.env.SHIPENGINE_FROM_STREET2 || undefined,
    city_locality,
    state_province: process.env.SHIPENGINE_FROM_STATE || undefined,
    postal_code,
    country_code,
    phone
  };
}

function estimateWeightOz(items: Array<{ productId: string; quantity: number }>) {
  const total = items.reduce((sum, item) => {
    const product = getProductById(item.productId);
    return sum + (product?.shippingWeightLb ?? 0.5) * 16 * item.quantity;
  }, 0);
  return Math.max(total, 4);
}

type CarrierInfo = { carrier_id: string; friendly_name: string };

async function fetchCarriers(): Promise<CarrierInfo[]> {
  const res = await fetch(`${SHIPENGINE_BASE_URL}/v1/carriers`, { headers: getHeaders() });
  if (!res.ok) {
    throw new Error(`ShipEngine carriers error ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { carriers: CarrierInfo[] };
  return data.carriers ?? [];
}

export type ShipEngineRate = {
  rateId: string;
  displayName: string;
  amountPence: number;
  currency: string;
  estimatedDays: number | null;
};

export type ShipAddress = {
  name?: string | null;
  address1: string;
  address2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
  phone?: string | null;
};

type RateItem = {
  rate_id: string;
  carrier_id: string;
  carrier_friendly_name: string;
  service_code: string;
  service_type: string;
  shipping_amount: { amount: number; currency: string };
  delivery_days: number | null;
};

type RatesResponse = {
  rate_response: {
    rates: RateItem[];
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

async function fetchRates(
  items: Array<{ productId: string; quantity: number }>,
  address: ShipAddress
): Promise<{ rates: RateItem[]; carrierNames: Record<string, string> }> {
  const carriers = await fetchCarriers();
  if (!carriers.length) throw new Error("No carriers connected to your ShipEngine account.");

  const carrierIds = carriers.map((c) => c.carrier_id);
  const carrierNames: Record<string, string> = {};
  for (const c of carriers) {
    carrierNames[c.carrier_id] = c.friendly_name;
  }

  const res = await fetch(`${SHIPENGINE_BASE_URL}/v1/rates`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      rate_options: { carrier_ids: carrierIds },
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
        packages: [{ weight: { value: estimateWeightOz(items), unit: "ounce" } }]
      }
    })
  });

  if (!res.ok) {
    throw new Error(`ShipEngine rates error ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as RatesResponse;
  const rates = data.rate_response.rates ?? [];

  if (!rates.length) {
    const errMsg = data.rate_response.errors?.[0]?.message ?? "No rates available for this destination";
    throw new Error(errMsg);
  }

  return { rates, carrierNames };
}

export async function getShipEngineRates(
  items: Array<{ productId: string; quantity: number }>,
  address: ShipAddress,
  subtotalPence: number
): Promise<ShipEngineRate[]> {
  if (!hasShipEngineEnv()) throw new Error("ShipEngine is not configured.");

  const { rates: rawRates, carrierNames } = await fetchRates(items, address);

  const rates: ShipEngineRate[] = rawRates
    .filter((r) => r.shipping_amount?.amount != null)
    .map((r) => {
      const carrier = carrierNames[r.carrier_id] || r.carrier_friendly_name || r.carrier_id || "";
      const service = r.service_type || (r.service_code ?? "").replace(/_/g, " ");
      const displayName = [carrier, service].filter(Boolean).join(" — ") || r.rate_id;
      return {
        rateId: r.rate_id,
        displayName,
        amountPence: Math.round(r.shipping_amount.amount * 100),
        currency: (r.shipping_amount.currency ?? "GBP").toUpperCase(),
        estimatedDays: r.delivery_days ?? null
      };
    })
    .sort((a, b) => a.amountPence - b.amountPence);

  if (subtotalPence >= FREE_SHIPPING_THRESHOLD_PENCE && address.country === "GB") {
    return [
      {
        rateId: "free",
        displayName: "Free Standard UK Shipping",
        amountPence: 0,
        currency: "GBP",
        estimatedDays: null
      },
      ...rates
    ];
  }

  return rates;
}

export async function createShipEngineLabel(order: OrderRecord) {
  if (!hasShipEngineEnv()) {
    throw new Error("ShipEngine is not configured. Set SHIPENGINE_API_KEY.");
  }

  const address = order.parsedItemsPayload.shippingAddress;

  if (!address?.address1 || !address.city || !address.postalCode || !address.country) {
    throw new Error("This order has an incomplete shipping address.");
  }

  const { rates: rawRates } = await fetchRates(order.parsedItemsPayload.items, {
    name: address.name,
    address1: address.address1,
    address2: address.address2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone
  });

  const cheapest = [...rawRates].sort(
    (a, b) => a.shipping_amount.amount - b.shipping_amount.amount
  )[0];

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
    rateCurrency: (cheapest.shipping_amount.currency ?? "GBP").toUpperCase(),
    provider: cheapest.carrier_id,
    serviceLevel: cheapest.service_code,
    purchasedAt: new Date().toISOString()
  };
}
