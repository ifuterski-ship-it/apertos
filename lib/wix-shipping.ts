import type { ShipEngineRate } from "@/lib/shipengine";
import { getProductById } from "@/lib/products";

type WixShippingRateCondition = {
  type: "BY_TOTAL_PRICE" | "BY_TOTAL_WEIGHT" | "BY_TOTAL_QUANTITY";
  operator: "EQ" | "GT" | "GTE" | "LT" | "LTE";
  value: string;
};

type WixShippingOption = {
  id: string;
  title: string;
  estimatedDeliveryTime: string | null;
  rates: Array<{
    title: string;
    amount: string;
    multiplyByQuantity?: boolean;
    active?: boolean;
    conditions: WixShippingRateCondition[];
  }>;
};

type WixDeliveryProfile = {
  deliveryRegions: Array<{
    id: string;
    name?: string;
    destinations?: Array<{ code: string; name?: string }>;
  }>;
};

async function fetchDeliveryProfile(apiKey: string, siteId: string): Promise<WixDeliveryProfile> {
  const res = await fetch("https://www.wixapis.com/ecom/v1/delivery-profiles/query", {
    method: "POST",
    headers: { Authorization: apiKey, "wix-site-id": siteId, "Content-Type": "application/json" },
    body: JSON.stringify({ paging: { limit: 1 } })
  });

  if (!res.ok) {
    throw new Error(`Unable to load Wix delivery profile (${res.status}).`);
  }

  const data = (await res.json()) as { deliveryProfiles?: WixDeliveryProfile[] };
  return data.deliveryProfiles?.[0] ?? { deliveryRegions: [] };
}

async function fetchShippingOptions(apiKey: string, siteId: string): Promise<WixShippingOption[]> {
  const res = await fetch("https://www.wixapis.com/ecom/v1/shipping-options/query", {
    method: "POST",
    headers: { Authorization: apiKey, "wix-site-id": siteId, "Content-Type": "application/json" },
    body: JSON.stringify({ paging: { limit: 200 } })
  });

  if (!res.ok) {
    throw new Error(`Unable to load Wix shipping options (${res.status}).`);
  }

  const data = (await res.json()) as { shippingOptions?: WixShippingOption[] };
  return data.shippingOptions ?? [];
}

function resolveRegionId(countryCode: string, profile: WixDeliveryProfile): string | null {
  const code = countryCode.toUpperCase();

  for (const region of profile.deliveryRegions) {
    const destinations = region.destinations ?? [];
    if (destinations.length === 0) continue;
    if (destinations.some((dest) => dest.code.toUpperCase() === code)) return region.id;
  }

  const fallback = profile.deliveryRegions.find((region) => (region.destinations ?? []).length === 0);
  return fallback?.id ?? profile.deliveryRegions[0]?.id ?? null;
}

function conditionMatches(condition: WixShippingRateCondition, value: number): boolean {
  const target = Number.parseFloat(condition.value);

  switch (condition.operator) {
    case "EQ": return value === target;
    case "GT": return value > target;
    case "GTE": return value >= target;
    case "LT": return value < target;
    case "LTE": return value <= target;
    default: return true;
  }
}

function matchesConditions(
  conditions: WixShippingRateCondition[],
  subtotalPence: number,
  totalWeightOz: number,
  quantity: number
): boolean {
  if (!conditions?.length) return true;

  return conditions.every((condition) => {
    switch (condition.type) {
      case "BY_TOTAL_PRICE": return conditionMatches(condition, subtotalPence / 100);
      case "BY_TOTAL_WEIGHT": return conditionMatches(condition, totalWeightOz);
      case "BY_TOTAL_QUANTITY": return conditionMatches(condition, quantity);
      default: return true;
    }
  });
}

export async function getWixStoreShippingRates(
  podItems: Array<{ productId: string; quantity: number }>,
  address: { country: string },
  subtotalPence: number
): Promise<ShipEngineRate[]> {
  const apiKey = process.env.WIX_API_KEY ?? "";
  const siteId = process.env.WIX_SITE_ID ?? "";

  if (!apiKey || !siteId) return [];

  const [profile, shippingOptions] = await Promise.all([
    fetchDeliveryProfile(apiKey, siteId),
    fetchShippingOptions(apiKey, siteId)
  ]);

  const regionId = resolveRegionId(address.country, profile);
  if (!regionId) return [];

  const totalQuantity = podItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeightOz = podItems.reduce((sum, item) => {
    const product = getProductById(item.productId);
    return sum + (product?.shippingWeightLb ?? 0.5) * 16 * item.quantity;
  }, 0);

  const rates: ShipEngineRate[] = [];

  for (const option of shippingOptions) {
    for (const rate of option.rates ?? []) {
      if (rate.active === false) continue;
      if (!matchesConditions(rate.conditions ?? [], subtotalPence, totalWeightOz, totalQuantity)) continue;

      let amount = Number.parseFloat(rate.amount) * 100;
      if (rate.multiplyByQuantity) amount *= totalQuantity;

      rates.push({
        rateId: `wix:${option.id}:${(option.title ?? "rate").replace(/\s+/g, "-").toLowerCase()}`,
        displayName: option.title || rate.title || "Standard Shipping",
        amountPence: Math.round(amount),
        currency: "GBP",
        estimatedDays: null
      });
    }
  }

  return rates
    .filter((rate, index, list) => list.findIndex((r) => r.displayName === rate.displayName) === index)
    .sort((a, b) => a.amountPence - b.amountPence);
}
