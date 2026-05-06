import Stripe from "stripe";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

export function hasStripeServerEnv() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function hasStripeClientEnv() {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}
