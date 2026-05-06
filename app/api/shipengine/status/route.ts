import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    SHIPENGINE_API_KEY: Boolean(process.env.SHIPENGINE_API_KEY),
    SHIPENGINE_FROM_NAME: process.env.SHIPENGINE_FROM_NAME || null,
    SHIPENGINE_FROM_STREET1: process.env.SHIPENGINE_FROM_STREET1 || null,
    SHIPENGINE_FROM_CITY: process.env.SHIPENGINE_FROM_CITY || null,
    SHIPENGINE_FROM_ZIP: process.env.SHIPENGINE_FROM_ZIP || null,
    SHIPENGINE_FROM_COUNTRY: process.env.SHIPENGINE_FROM_COUNTRY || null,
    SHIPENGINE_FROM_PHONE: process.env.SHIPENGINE_FROM_PHONE || null,
  });
}
