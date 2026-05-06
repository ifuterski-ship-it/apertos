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

  // Find any env vars with STRIPE in the name (masks values)
  const stripeEnvKeys = Object.keys(process.env).filter((k) =>
    k.toUpperCase().includes("STRIPE")
  );

  return NextResponse.json({
    hasSecretKey: Boolean(secretKey),
    keyPrefix: secretKey ? secretKey.slice(0, 7) : null,
    stripeInitialized,
    stripeError,
    stripeEnvKeys,
    nodeEnv: process.env.NODE_ENV
  });
}
