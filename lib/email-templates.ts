import type { OrderItem, OrderShippingLabel } from "@/lib/orders";
import { siteName } from "@/lib/site";

function renderEmailShell({
  eyebrow,
  title,
  body,
  footer
}: {
  eyebrow: string;
  title: string;
  body: string;
  footer?: string;
}) {
  return `
    <div style="background:#020202;color:#f5f5f5;padding:40px 24px;font-family:Arial,sans-serif">
      <div style="max-width:640px;margin:0 auto;border:1px solid rgba(255,255,255,0.08);background:#0a0a0a;padding:40px;border-radius:28px">
        <p style="margin:0 0 18px;letter-spacing:0.42em;text-transform:uppercase;color:#a3a3a3;font-size:12px">${eyebrow}</p>
        <h1 style="margin:0 0 20px;font-size:34px;line-height:1.1;text-transform:uppercase;color:#ffffff">${title}</h1>
        <div style="font-size:14px;line-height:1.9;letter-spacing:0.08em;text-transform:uppercase;color:#d4d4d4">${body}</div>
        ${
          footer
            ? `<p style="margin:28px 0 0;color:#8f8f8f;font-size:11px;letter-spacing:0.3em;text-transform:uppercase">${footer}</p>`
            : ""
        }
      </div>
    </div>
  `;
}

function renderOrderItemRows(items: OrderItem[]) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08)">${item.name}</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);text-align:center">${item.size}</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);text-align:center">${item.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);text-align:right">£${(
            item.price * item.quantity
          ).toFixed(2)}</td>
        </tr>
      `
    )
    .join("");
}

export function renderOrderConfirmationEmail({
  customerEmail,
  sessionId,
  items,
  amountTotal
}: {
  customerEmail: string;
  sessionId: string;
  items: OrderItem[];
  amountTotal: number | null;
}) {
  return renderEmailShell({
    eyebrow: siteName,
    title: "Order Confirmed",
    body: `
      <p style="margin:0 0 18px">Payment received for ${customerEmail}.</p>
      <p style="margin:0 0 18px">Session ${sessionId}</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0 16px">
        <thead>
          <tr style="color:#8f8f8f;font-size:11px;letter-spacing:0.28em">
            <th style="padding:0 0 10px;text-align:left">Product</th>
            <th style="padding:0 0 10px;text-align:center">Size</th>
            <th style="padding:0 0 10px;text-align:center">Qty</th>
            <th style="padding:0 0 10px;text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${renderOrderItemRows(items)}
        </tbody>
      </table>
      <p style="margin:0">Order total ${amountTotal !== null ? `£${(amountTotal / 100).toFixed(2)}` : "Paid in full"}</p>
      <p style="margin:18px 0 0">We’ll email you again as soon as your shipment is moving.</p>
    `,
    footer: "Apertos Fightwear"
  });
}

export function renderShippingNotificationEmail({
  customerName,
  trackingNumber,
  shippingLabel
}: {
  customerName: string | null;
  trackingNumber: string | null;
  shippingLabel: OrderShippingLabel;
}) {
  return renderEmailShell({
    eyebrow: siteName,
    title: "Shipping Update",
    body: `
      <p style="margin:0 0 18px">${customerName ?? "Apertos Athlete"}, your order is now packed and moving.</p>
      <p style="margin:0 0 18px">Carrier ${shippingLabel.provider ?? "Shipping partner"}</p>
      <p style="margin:0 0 18px">Service ${shippingLabel.serviceLevel ?? "Standard"}</p>
      <p style="margin:0 0 18px">Tracking ${trackingNumber ?? "Tracking assigned"}</p>
      <p style="margin:0">
        <a href="${shippingLabel.labelUrl}" style="color:#ffffff;text-decoration:underline">Open shipping label PDF</a>
      </p>
    `,
    footer: "Apertos Fightwear"
  });
}

export function renderNewsletterWelcomeEmail(email: string) {
  return renderEmailShell({
    eyebrow: siteName,
    title: "Subscribed To Apertos News",
    body: `
      <p style="margin:0 0 18px">${email} is now on the APERTOS news list.</p>
      <p style="margin:0 0 18px">You’ll hear first about product drops, no-gi releases, and future training-focused updates.</p>
      <p style="margin:0">Expect clean, occasional emails only when there is something worth opening.</p>
    `,
    footer: "Apertos Fightwear"
  });
}

export function renderNewsletterInternalEmail(email: string) {
  return renderEmailShell({
    eyebrow: siteName,
    title: "New News Subscriber",
    body: `
      <p style="margin:0 0 18px">A new APERTOS news signup has been captured.</p>
      <p style="margin:0">${email}</p>
    `,
    footer: "Apertos Fightwear"
  });
}
