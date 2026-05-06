import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.SHIPENGINE_API_KEY;
  return NextResponse.json({
    hasApiKey: Boolean(apiKey),
    keyPrefix: apiKey ? apiKey.slice(0, 8) : null,
    isSandbox: apiKey?.startsWith("TEST_") ?? false
  });
}
