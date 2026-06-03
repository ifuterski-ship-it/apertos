import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { products } from "@/lib/products";
import { assertInventoryAvailable } from "@/lib/inventory";
import { getStripe } from "@/lib/stripe";
import { getAllowedShippingCountries } from "@/lib/shipengine";

type CheckoutItem = {
  productId: string;
  quantity: number;
  size: string;
  colour?: string;
};

type ShippingOption = {
  rateId: string;
  displayName: string;
  amountPence: number;
  address: {
    name: string;
    email: string;
    phone?: string | null;
    address1: string;
    address2?: string | null;
    city: string;
    state?: string | null;
    postalCode: string;
    country: string;
  };
};

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ ok: false, message: "Stripe is not configured." }, { status: 500 });
  }

  const { items, email, shipping } = (await request.json()) as {
    items?: CheckoutItem[];
    email?: string;
    shipping?: ShippingOption;
  };

  if (!items?.length) {
    return NextResponse.json({ ok: false, message: "No items selected for checkout." }, { status: 400 });
  }

  const normalizedItems = items.flatMap((item) => {
    const product = products.find((entry) => entry.id === item.productId);

    if (!product || item.quantity <= 0) {
      return [];
    }

    return [{ product, quantity: item.quantity, size: item.size, colour: item.colour }];
  });

  if (!normalizedItems.length) {
    return NextResponse.json({ ok: false, message: "No valid products found for checkout." }, { status: 400 });
  }

  try {
    await assertInventoryAvailable(
      normalizedItems.map(({ product, quantity, size }) => ({
        productId: product.id,
        name: product.name,
        quantity,
        size,
        price: product.price
      }))
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stock is unavailable right now.";
    return NextResponse.json({ ok: false, message }, { status: 409 });
  }

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const allowedCountries =
    getAllowedShippingCountries() as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[];

  const productLineItems = normalizedItems.map(({ product, quantity, size, colour }) => ({
    quantity,
    price_data: {
      currency: "gbp",
      unit_amount: Math.round(product.price * 100),
      product_data: {
        name: product.name,
        description: colour
          ? `${product.category} / Size ${size} / ${colour}`
          : `${product.category} / Size ${size}`,
        images: [`${origin}${product.image}`]
      }
    }
  }));

  const shippingLineItem =
    shipping && shipping.amountPence > 0
      ? [
          {
            quantity: 1,
            price_data: {
              currency: "gbp",
              unit_amount: shipping.amountPence,
              product_data: {
                name: `Shipping — ${shipping.displayName}`
              }
            }
          }
        ]
      : [];

  const customerEmail = shipping?.address?.email || email || undefined;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    customer_email: customerEmail,
    billing_address_collection: "required",
    phone_number_collection: { enabled: true },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
    line_items: [...productLineItems, ...shippingLineItem],
    metadata: {
      items: JSON.stringify(
        normalizedItems.map(({ product, quantity, size, colour }) => ({
          productId: product.id,
          name: product.name,
          quantity,
          size,
          ...(colour ? { colour } : {}),
          price: product.price
        }))
      ),
      ...(shipping
        ? {
            shipping_address: JSON.stringify(shipping.address),
            shipping_display_name: shipping.displayName,
            shipping_amount_pence: String(shipping.amountPence)
          }
        : {})
    }
  };

  // Only collect shipping address via Stripe if no address was provided from our checkout form
  if (!shipping) {
    sessionParams.shipping_address_collection = { allowed_countries: allowedCountries };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return NextResponse.json({ ok: true, url: session.url, id: session.id });
}
