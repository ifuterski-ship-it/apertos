import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.SHIPENGINE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No API key" }, { status: 500 });

  const carriersRes = await fetch("https://api.shipengine.com/v1/carriers", {
    headers: { "API-Key": apiKey, "Content-Type": "application/json" }
  });
  const carriersData = (await carriersRes.json()) as { carriers: Array<{ carrier_id: string; friendly_name: string }> };
  const carrierIds = (carriersData.carriers ?? []).map((c) => c.carrier_id);

  const ratesRes = await fetch("https://api.shipengine.com/v1/rates", {
    method: "POST",
    headers: { "API-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      rate_options: { carrier_ids: carrierIds },
      shipment: {
        ship_from: {
          name: process.env.SHIPENGINE_FROM_NAME,
          address_line1: process.env.SHIPENGINE_FROM_STREET1,
          city_locality: process.env.SHIPENGINE_FROM_CITY,
          postal_code: process.env.SHIPENGINE_FROM_ZIP,
          country_code: process.env.SHIPENGINE_FROM_COUNTRY ?? "GB",
          phone: process.env.SHIPENGINE_FROM_PHONE
        },
        ship_to: {
          name: "Test Customer",
          address_line1: "10 Downing Street",
          city_locality: "London",
          postal_code: "SW1A 2AA",
          country_code: "GB",
          phone: "+447000000000"
        },
        packages: [{ weight: { value: 8, unit: "ounce" } }]
      }
    })
  });

  const ratesData = await ratesRes.json();
  return NextResponse.json({ carriers: carriersData.carriers, rates: ratesData });
}
