import { NextResponse } from "next/server";
import { products } from "@/lib/products";
import { stripe } from "@/lib/stripe";

type CheckoutItem = {
  productId: string;
  quantity: number;
  size: string;
};

export async function POST(request: Request) {
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

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email || undefined,
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
