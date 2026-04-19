import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { products } from "@/lib/products";
import { stripe } from "@/lib/stripe";
import { getAllowedShippingCountries, hasShippoSenderEnv, quoteShippingOptions } from "@/lib/shippo";

type CheckoutItem = {
  productId: string;
  quantity: number;
  size: string;
};

type CheckoutShippingAddressInput = {
  name: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
};

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ ok: false, message: "Stripe is not configured." }, { status: 500 });
  }
  if (!hasShippoSenderEnv) {
    return NextResponse.json(
      { ok: false, message: "Shippo sender configuration is required for live shipping options." },
      { status: 500 }
    );
  }

  const { items, email, shippingAddress } = (await request.json()) as {
    items?: CheckoutItem[];
    email?: string;
    shippingAddress?: CheckoutShippingAddressInput;
  };

  if (!items?.length) {
    return NextResponse.json({ ok: false, message: "No items selected for checkout." }, { status: 400 });
  }

  const normalizedItems = items.flatMap((item) => {
    const product = products.find((entry) => entry.id === item.productId);

    if (!product || item.quantity <= 0) {
      return [];
    }

    return [
      {
        product,
        quantity: item.quantity,
        size: item.size
      }
    ];
  });

  if (!normalizedItems.length) {
    return NextResponse.json({ ok: false, message: "No valid products found for checkout." }, { status: 400 });
  }
  if (
    !shippingAddress?.name ||
    !shippingAddress?.address1 ||
    !shippingAddress?.city ||
    !shippingAddress?.postalCode ||
    !shippingAddress?.country
  ) {
    return NextResponse.json(
      { ok: false, message: "Shipping address is required to fetch live shipping options." },
      { status: 400 }
    );
  }

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const allowedCountries =
    getAllowedShippingCountries() as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[];

  let shippingOptions = [] as Stripe.Checkout.SessionCreateParams.ShippingOption[];
  try {
    const quotedRates = await quoteShippingOptions(
      normalizedItems.map(({ product, quantity }) => ({
        productId: product.id,
        quantity
      })),
      {
        name: shippingAddress.name,
        email,
        phone: shippingAddress.phone,
        address1: shippingAddress.address1,
        address2: shippingAddress.address2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country
      }
    );

    shippingOptions = quotedRates.map((rate) => ({
      shipping_rate_data: {
        display_name: [rate.provider, rate.serviceLevel].filter(Boolean).join(" / ") || "Shipping",
        type: "fixed_amount",
        fixed_amount: {
          amount: rate.amount,
          currency: rate.currency
        },
        delivery_estimate: rate.estimatedDays
          ? {
              minimum: { unit: "business_day", value: Math.max(1, rate.estimatedDays) },
              maximum: { unit: "business_day", value: Math.max(1, rate.estimatedDays + 1) }
            }
          : undefined
      }
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch shipping options from Shippo.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email || undefined,
    billing_address_collection: "required",
    phone_number_collection: {
      enabled: true
    },
    shipping_address_collection: {
      allowed_countries: allowedCountries
    },
    shipping_options: shippingOptions,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
    line_items: normalizedItems.map(({ product, quantity, size }) => ({
      quantity,
      price_data: {
        currency: "gbp",
        unit_amount: Math.round(product.price * 100),
        product_data: {
          name: product.name,
          description: `${product.category} / Size ${size}`,
          images: [`${origin}${product.image}`]
        }
      }
    })),
    metadata: {
      items: JSON.stringify(
        normalizedItems.map(({ product, quantity, size }) => ({
          productId: product.id,
          name: product.name,
          quantity,
          size,
          price: product.price
        }))
      )
    }
  });

  return NextResponse.json({ ok: true, url: session.url, id: session.id });
}
