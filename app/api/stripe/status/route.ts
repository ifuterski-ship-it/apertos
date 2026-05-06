import { NextResponse } from "next/server";

export async function GET() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return NextResponse.json({
    hasSecretKey: Boolean(secretKey),
    keyPrefix: secretKey ? secretKey.slice(0, 7) : null,
    nodeEnv: process.env.NODE_ENV
  });
}
