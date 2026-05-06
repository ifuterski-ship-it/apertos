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
};

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ ok: false, message: "Stripe is not configured." }, { status: 500 });
  }

  const { items, email } = (await request.json()) as {
    items?: CheckoutItem[];
    email?: string;
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
