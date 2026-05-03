import EasyPostClient from "@easypost/api";
import type { IRate } from "@easypost/api";
import { getProductById } from "@/lib/products";
import type { OrderItem, OrderRecord, OrderShippingAddress } from "@/lib/orders";

const defaultAllowedCountries = ["GB", "IE", "US", "CA", "FR", "DE", "ES", "IT", "NL", "BE", "PT"];
const easyPostApiKey = process.env.EASYPOST_API_KEY ?? "";

const easyPostFromAddress = {
  name: process.env.EASYPOST_FROM_NAME ?? "",
  company: process.env.EASYPOST_FROM_COMPANY ?? "",
  street1: process.env.EASYPOST_FROM_STREET1 ?? "",
  street2: process.env.EASYPOST_FROM_STREET2 ?? "",
  city: process.env.EASYPOST_FROM_CITY ?? "",
  state: process.env.EASYPOST_FROM_STATE ?? "",
  zip: process.env.EASYPOST_FROM_ZIP ?? "",
  country: process.env.EASYPOST_FROM_COUNTRY ?? "",
  phone: process.env.EASYPOST_FROM_PHONE ?? "",
  email: process.env.EASYPOST_FROM_EMAIL ?? ""
};

export const hasEasyPostEnv = Boolean(easyPostApiKey);
export const hasEasyPostSenderEnv = Boolean(
  easyPostFromAddress.name &&
    easyPostFromAddress.street1 &&
    easyPostFromAddress.city &&
    easyPostFromAddress.zip &&
    easyPostFromAddress.country &&
    easyPostFromAddress.email
);

export function getAllowedShippingCountries() {
  const configured = (process.env.STRIPE_SHIPPING_COUNTRIES ?? "")
    .split(",")
    .map((country) => country.trim().toUpperCase())
    .filter(Boolean);

  return configured.length ? configured : defaultAllowedCountries;
}

function getParcel(items: OrderItem[]) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeightLb = items.reduce((sum, item) => {
    const product = getProductById(item.productId);
    return sum + (product?.shippingWeightLb ?? 0.5) * item.quantity;
  }, 0);

  return {
    weight: Math.max(totalWeightLb * 16, 4),
    length: totalQuantity > 2 ? 14 : 12,
    width: 10,
    height: totalQuantity > 1 ? 4 : 2
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
  if (!hasEasyPostEnv) {
    throw new Error("EasyPost is not configured.");
  }

  if (!hasEasyPostSenderEnv) {
    throw new Error("EasyPost sender address is not fully configured.");
  }

  const payload = order.parsedItemsPayload;

  if (!payload.items.length) {
    throw new Error("This order does not contain shippable items.");
  }

  const client = new EasyPostClient(easyPostApiKey);

  const shipment = await client.Shipment.create({
    to_address: getRecipientAddress(payload.shippingAddress, order.email),
    from_address: {
      name: easyPostFromAddress.name,
      company: easyPostFromAddress.company || undefined,
      street1: easyPostFromAddress.street1,
      street2: easyPostFromAddress.street2 || undefined,
      city: easyPostFromAddress.city,
      state: easyPostFromAddress.state || undefined,
      zip: easyPostFromAddress.zip,
      country: easyPostFromAddress.country,
      phone: easyPostFromAddress.phone || undefined,
      email: easyPostFromAddress.email
    },
    parcel: getParcel(payload.items)
  });

  if (!shipment.rates?.length) {
    throw new Error("EasyPost did not return any rates for this shipment.");
  }

  const cheapestRate = [...shipment.rates].sort(
    (a, b) => parseFloat(a.rate) - parseFloat(b.rate)
  )[0] as IRate;

  const boughtShipment = await client.Shipment.buy(shipment.id, cheapestRate);

  if (!boughtShipment.postage_label?.label_url) {
    throw new Error("EasyPost was unable to purchase a label for this order.");
  }

  return {
    labelUrl: boughtShipment.postage_label.label_url,
    trackingNumber: boughtShipment.tracking_code ?? null,
    transactionId: boughtShipment.id ?? null,
    rateAmount: cheapestRate.rate ?? null,
    rateCurrency: cheapestRate.currency ?? "GBP",
    provider: cheapestRate.carrier ?? null,
    serviceLevel: cheapestRate.service ?? null,
    purchasedAt: new Date().toISOString()
  };
}
