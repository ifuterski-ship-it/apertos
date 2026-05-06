import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.SHIPSTATION_API_KEY;
  const apiSecret = process.env.SHIPSTATION_API_SECRET;
  return NextResponse.json({
    hasApiKey: Boolean(apiKey),
    hasApiSecret: Boolean(apiSecret),
    keyPrefix: apiKey ? apiKey.slice(0, 6) : null
  });
}
