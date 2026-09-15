import { NextResponse } from "next/server";
import { getShipEngineRates } from "@/lib/shipengine";
import type { ShipAddress } from "@/lib/shipengine";

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

    const rates = await getShipEngineRates(items, address, subtotalPence ?? 0);
    return NextResponse.json({ ok: true, rates });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch shipping rates.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
