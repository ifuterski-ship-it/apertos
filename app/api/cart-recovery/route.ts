import { NextResponse } from "next/server";
import {
  findAbandonedCarts,
  markRecoveryEmailSent,
} from "@/lib/checkout-carts";
import { sendEmail } from "@/lib/email";
import { ordersFromEmail } from "@/lib/email-config";
import { renderAbandonedCartEmail } from "@/lib/email-templates";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const olderThanMinutes = Number(process.env.CART_RECOVERY_MINUTES ?? "60");

export async function GET(request: Request) {
  if (process.env.CRON_SECRET) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
  }

  let carts;
  try {
    carts = await findAbandonedCarts({ olderThanMinutes });
  } catch (error) {
    console.error("Cart recovery sweep failed", error);
    return NextResponse.json(
      { ok: false, message: "Cart recovery sweep failed" },
      { status: 500 },
    );
  }

  const results: { cartId: string; email: string; ok: boolean }[] = [];

  for (const cart of carts) {
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const html = renderAbandonedCartEmail({
      cartId: cart.id,
      items: cart.items,
      totalPrice,
    });

    const result = await sendEmail({
      to: cart.email,
      subject: "Your APERTOS basket is waiting",
      from: ordersFromEmail,
      html,
    });

    if (result.ok) {
      await markRecoveryEmailSent(cart.id);
    }

    results.push({ cartId: cart.id, email: cart.email, ok: result.ok });
  }

  return NextResponse.json({ ok: true, emailed: results.length, results });
}