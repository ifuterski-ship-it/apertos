import { LabelFileTypeEnum, Shippo } from "shippo";
import { getProductById } from "@/lib/products";
import type { OrderItem, OrderRecord, OrderShippingAddress } from "@/lib/orders";

const defaultAllowedCountries = ["GB", "IE", "US", "CA", "FR", "DE", "ES", "IT", "NL", "BE", "PT"];
const shippoApiKey = process.env.SHIPPO_API_KEY ?? "";

const shippoFromAddress = {
  name: process.env.SHIPPO_FROM_NAME ?? "",
  company: process.env.SHIPPO_FROM_COMPANY ?? "",
  street1: process.env.SHIPPO_FROM_STREET1 ?? "",
  street2: process.env.SHIPPO_FROM_STREET2 ?? "",
  city: process.env.SHIPPO_FROM_CITY ?? "",
  state: process.env.SHIPPO_FROM_STATE ?? "",
  zip: process.env.SHIPPO_FROM_ZIP ?? "",
  country: process.env.SHIPPO_FROM_COUNTRY ?? "",
  phone: process.env.SHIPPO_FROM_PHONE ?? "",
  email: process.env.SHIPPO_FROM_EMAIL ?? ""
};

export const hasShippoEnv = Boolean(shippoApiKey);
export const hasShippoSenderEnv = Boolean(
  shippoFromAddress.name &&
    shippoFromAddress.street1 &&
    shippoFromAddress.city &&
    shippoFromAddress.zip &&
    shippoFromAddress.country &&
    shippoFromAddress.email
);

export function getAllowedShippingCountries() {
  const configured = (process.env.STRIPE_SHIPPING_COUNTRIES ?? "")
    .split(",")
    .map((country) => country.trim().toUpperCase())
    .filter(Boolean);

  return configured.length ? configured : defaultAllowedCountries;
}

function createShippoClient() {
  if (!hasShippoEnv) {
    throw new Error("Shippo is not configured.");
  }

  return new Shippo({
    apiKeyHeader: shippoApiKey
  });
}

function getParcelForItems(items: OrderItem[]) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeight = items.reduce((sum, item) => {
    const product = getProductById(item.productId);
    const shippingWeightLb = product?.shippingWeightLb ?? 0.5;

    return sum + shippingWeightLb * item.quantity;
  }, 0);

  return {
    massUnit: "lb" as const,
    weight: Math.max(totalWeight, 0.25).toFixed(2),
    distanceUnit: "in" as const,
    length: totalQuantity > 2 ? "14" : "12",
    width: "10",
    height: totalQuantity > 1 ? "4" : "2"
  };
}

function getRecipientAddress(address: OrderShippingAddress | null, fallbackEmail: string | null) {
  if (!address?.address1 || !address.city || !address.postalCode || !address.country) {
    throw new Error("This order does not have a complete shipping address yet.");
  }

  return {
    name: address.name ?? "APERTOS Customer",
    street1: address.address1,
    street2: address.address2 ?? undefined,
    city: address.city,
    state: address.state ?? undefined,
    zip: address.postalCode,
    country: address.country,
    phone: address.phone ?? undefined,
    email: address.email ?? fallbackEmail ?? undefined
  };
}

export async function purchaseCheapestLabel(order: OrderRecord) {
  if (!hasShippoSenderEnv) {
    throw new Error("Shippo sender address is not fully configured.");
  }

  const payload = order.parsedItemsPayload;

  if (!payload.items.length) {
    throw new Error("This order does not contain shippable items.");
  }

  const shippo = createShippoClient();

  const shipment = await shippo.shipments.create({
    async: false,
    metadata: `APERTOS ${order.stripeCheckoutSessionId}`,
    addressFrom: {
      name: shippoFromAddress.name,
      company: shippoFromAddress.company || undefined,
      street1: shippoFromAddress.street1,
      street2: shippoFromAddress.street2 || undefined,
      city: shippoFromAddress.city,
      state: shippoFromAddress.state || undefined,
      zip: shippoFromAddress.zip,
      country: shippoFromAddress.country,
      phone: shippoFromAddress.phone || undefined,
      email: shippoFromAddress.email
    },
    addressTo: getRecipientAddress(payload.shippingAddress, order.email),
    parcels: [getParcelForItems(payload.items)]
  });

  const cheapestRate = [...(shipment.rates ?? [])]
    .filter((rate) => Boolean(rate.objectId))
    .sort((left, right) => Number.parseFloat(left.amount) - Number.parseFloat(right.amount))[0];

  if (!cheapestRate?.objectId) {
    const message = shipment.messages?.map((entry) => entry.text).filter(Boolean).join(" ") ||
      "Shippo did not return any shipping rates for this order.";
    throw new Error(message);
  }

  const transaction = await shippo.transactions.create({
    async: false,
    rate: cheapestRate.objectId,
    labelFileType: LabelFileTypeEnum.Pdf,
    metadata: `APERTOS ${order.stripeCheckoutSessionId}`
  });

  if (transaction.status !== "SUCCESS" || !transaction.labelUrl) {
    const message = transaction.messages?.map((entry) => entry.text).filter(Boolean).join(" ") ||
      "Shippo was unable to purchase a label for this order.";
    throw new Error(message);
  }

  return {
    labelUrl: transaction.labelUrl,
    trackingNumber: transaction.trackingNumber ?? null,
    transactionId: transaction.objectId ?? null,
    rateAmount: cheapestRate.amount ?? null,
    rateCurrency: cheapestRate.currency ?? null,
    provider: cheapestRate.provider ?? null,
    serviceLevel: cheapestRate.servicelevel?.name ?? null,
    purchasedAt: new Date().toISOString()
  };
}
