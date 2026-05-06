import type { OrderRecord } from "@/lib/orders";

const SHIPSTATION_BASE_URL = "https://ssapi.shipstation.com";

export function hasShipStationEnv() {
  return Boolean(process.env.SHIPSTATION_API_KEY && process.env.SHIPSTATION_API_SECRET);
}

function getAuthHeader() {
  const key = process.env.SHIPSTATION_API_KEY ?? "";
  const secret = process.env.SHIPSTATION_API_SECRET ?? "";
  return `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;
}

async function shipStation<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${SHIPSTATION_BASE_URL}${path}`, {
    method: "POST",
    headers: { Authorization: getAuthHeader(), "Content-Type": "application/json" },
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
    ? {
        carrierCode: process.env.SHIPSTATION_DOMESTIC_CARRIER ?? "evri",
        serviceCode: process.env.SHIPSTATION_DOMESTIC_SERVICE ?? "evri_economy"
      }
    : {
        carrierCode: process.env.SHIPSTATION_INTL_CARRIER ?? "royal-mail",
        serviceCode: process.env.SHIPSTATION_INTL_SERVICE ?? "rm_international_tracked"
      };
}

function estimateWeightOz(items: Array<{ quantity: number }>) {
  return Math.max(items.reduce((sum, item) => sum + 8 * item.quantity, 0), 4);
}

type ShipStationOrderResponse = { orderId: number; orderNumber: string };
type ShipStationLabelResponse = {
  shipmentId: number;
  shipmentCost: number;
  trackingNumber: string;
  labelData: string;
};

export async function createShipStationLabel(order: OrderRecord) {
  if (!hasShipStationEnv()) {
    throw new Error("ShipStation is not configured. Set SHIPSTATION_API_KEY and SHIPSTATION_API_SECRET.");
  }

  const payload = order.parsedItemsPayload;
  const address = payload.shippingAddress;

  if (!address?.address1 || !address.city || !address.postalCode || !address.country) {
    throw new Error("This order has an incomplete shipping address.");
  }

  const { carrierCode, serviceCode } = pickCarrier(address.country);
  const weightOz = estimateWeightOz(payload.items);
  const orderNumber = `APERTOS-${order.stripeCheckoutSessionId.slice(-10).toUpperCase()}`;
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

  const labelResponse = await shipStation<ShipStationLabelResponse>("/orders/createlabelfororder", {
    orderId: ssOrder.orderId,
    carrierCode,
    serviceCode,
    packageCode: "package",
    confirmation: "none",
    shipDate: today,
    weight: { value: weightOz, units: "ounces" },
    testLabel: false
  });

  if (!labelResponse.trackingNumber) {
    throw new Error("ShipStation did not return a tracking number.");
  }

  return {
    labelData: labelResponse.labelData,
    trackingNumber: labelResponse.trackingNumber,
    shipmentId: labelResponse.shipmentId,
    shipmentCost: labelResponse.shipmentCost,
    carrierCode,
    serviceCode
  };
}
