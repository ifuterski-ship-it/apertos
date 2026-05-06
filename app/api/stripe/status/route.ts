import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function GET() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  let stripeInitialized = false;
  let stripeError: string | null = null;

  try {
    const stripe = getStripe();
    stripeInitialized = Boolean(stripe);
  } catch (e) {
    stripeError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    hasSecretKey: Boolean(secretKey),
    keyPrefix: secretKey ? secretKey.slice(0, 7) : null,
    stripeInitialized,
    stripeError,
    nodeEnv: process.env.NODE_ENV
  });
}
