import { NextResponse } from "next/server";
import { getShipEngineRates, hasShipEngineEnv, type ShipAddress } from "@/lib/shipengine";
import { getWixStoreShippingRates } from "@/lib/wix-shipping";
import { hasWixStoreEnv } from "@/lib/wix-store";
import { getProductById } from "@/lib/products";

export async function POST(request: Request) {
  try {
    const { items, address, subtotalPence } = (await request.json()) as {
      items: Array<{ productId: string; quantity: number }>;
      address: ShipAddress;
      subtotalPence: number;
    };

    if (!items?.length || !address) {
      return NextResponse.json({ ok: false, message: "Missing items or address." }, { status: 400 });
    }

    const nonPodItems = items.filter((item) => getProductById(item.productId)?.category !== "Outerwear");
    const podItems = items.filter((item) => getProductById(item.productId)?.category === "Outerwear");
    const isPodOnly = podItems.length > 0 && nonPodItems.length === 0;

    let shipengineRates: Awaited<ReturnType<typeof getShipEngineRates>> = [];
    if (nonPodItems.length && hasShipEngineEnv()) {
      shipengineRates = await getShipEngineRates(nonPodItems, address, subtotalPence ?? 0);
    }

    let wixRates: Awaited<ReturnType<typeof getWixStoreShippingRates>> = [];
    if (podItems.length && hasWixStoreEnv()) {
      const podSubtotalPence = podItems.reduce((sum, item) => {
        const product = getProductById(item.productId);
        return sum + (product?.price ?? 0) * item.quantity;
      }, 0);
      wixRates = await getWixStoreShippingRates(podItems, address, podSubtotalPence);
    }

    if (isPodOnly) {
      const rates = wixRates.length
        ? wixRates
        : [
            {
              rateId: "pod-included",
              displayName: "Shipping Included",
              amountPence: 0,
              currency: "GBP" as const,
              estimatedDays: null
            }
          ];
      return NextResponse.json({ ok: true, rates });
    }

    if (shipengineRates.length) {
      const wixFee = wixRates[0]?.amountPence ?? 0;
      const rates = shipengineRates.map((rate) => ({
        ...rate,
        amountPence: rate.amountPence + wixFee,
        displayName:
          wixFee > 0
            ? `${rate.displayName} + Hoodie Shipping (${new Intl.NumberFormat("en-GB", {
                style: "currency",
                currency: "GBP"
              }).format(wixFee / 100)})`
            : rate.displayName
      }));
      return NextResponse.json({ ok: true, rates });
    }

    if (podItems.length && wixRates.length) {
      return NextResponse.json({ ok: true, rates: wixRates });
    }

    throw new Error("No shipping rates are available for this order right now.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch shipping rates.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}