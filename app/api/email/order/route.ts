import { NextResponse } from "next/server";
import { ordersFromEmail } from "@/lib/email-config";
import { sendEmail } from "@/lib/email";

type OrderItem = {
  name: string;
  quantity: number;
  size: string;
  price: number;
};

export async function POST(request: Request) {
  const { email, items, total } = (await request.json()) as {
    email?: string;
    items?: OrderItem[];
    total?: number;
  };

  if (!email || !items?.length || typeof total !== "number") {
    return NextResponse.json({ ok: false, message: "Missing order details." }, { status: 400 });
  }

  const listMarkup = items
    .map(
      (item) =>
        `<li style="margin-bottom:10px">${item.name} / ${item.size} / Qty ${item.quantity} / £${(
          item.price * item.quantity
        ).toFixed(2)}</li>`
    )
    .join("");

  const result = await sendEmail({
    to: email,
    subject: "Your APERTOS Order Confirmation",
    from: ordersFromEmail,
    html: `
      <div style="background:#050505;color:#f5f5f5;padding:40px;font-family:Arial,sans-serif">
        <p style="letter-spacing:0.4em;text-transform:uppercase;color:#a3a3a3;font-size:12px">APERTOS</p>
        <h1 style="font-size:32px;text-transform:uppercase;margin:16px 0">Order Confirmed</h1>
        <p style="font-size:15px;line-height:1.8;color:#d4d4d4">Your order has been captured in the APERTOS system.</p>
        <ul style="padding-left:20px;line-height:1.7;color:#d4d4d4">${listMarkup}</ul>
        <p style="margin-top:20px;font-size:16px;font-weight:bold">Total: £${total.toFixed(2)}</p>
      </div>
    `
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
