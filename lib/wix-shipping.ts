import type { ShipEngineRate } from "@/lib/shipengine";
import { getProductById } from "@/lib/products";

const POD_SHIPPING_BASE_GBP = 5;
const POD_SHIPPING_ADDITIONAL_GBP = 3;

export function getPodShippingFeePence(
  podItems: Array<{ productId: string; quantity: number }>
): number {
  const quantity = podItems.reduce((sum, item) => sum + item.quantity, 0);
  if (quantity <= 0) return 0;

  const base = Number.parseFloat(process.env.WIX_POD_SHIPPING_BASE_GBP ?? String(POD_SHIPPING_BASE_GBP));
  const additional = Number.parseFloat(
    process.env.WIX_POD_SHIPPING_ADDITIONAL_GBP ?? String(POD_SHIPPING_ADDITIONAL_GBP)
  );

  if (!Number.isFinite(base) || !Number.isFinite(additional)) {
    return Math.round((POD_SHIPPING_BASE_GBP + POD_SHIPPING_ADDITIONAL_GBP * (quantity - 1)) * 100);
  }

  return Math.round((base + additional * (quantity - 1)) * 100);
}

export async function getWixStoreShippingRates(
  podItems: Array<{ productId: string; quantity: number }>,
  _address: { country: string },
  _subtotalPence: number
): Promise<ShipEngineRate[]> {
  if (podItems.length === 0) return [];

  const amountPence = getPodShippingFeePence(podItems);
  const productName = podItems[0] ? getProductById(podItems[0].productId)?.name : undefined;

  return [
    {
      rateId: "wix-pod-shipping",
      displayName: productName ? `${productName} Delivery` : "Standard Delivery",
      amountPence,
      currency: "GBP",
      estimatedDays: null
    }
  ];
}