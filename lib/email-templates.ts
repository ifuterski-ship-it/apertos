import type { OrderItem, OrderShippingAddress, OrderShippingLabel } from "@/lib/orders";
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

function getTrackingUrl(trackingNumber: string, serviceLevel: string | null): string | null {
  const service = (serviceLevel ?? "").toLowerCase();
  if (service.startsWith("royal_mail")) {
    return `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}`;
  }
  if (service.startsWith("evri") || service.startsWith("hermes")) {
    return `https://www.evri.com/track-a-parcel#/${trackingNumber}`;
  }
  if (service.startsWith("dhl")) {
    return `https://www.dhl.com/gb-en/home/tracking.html?tracking-id=${trackingNumber}`;
  }
  if (service.startsWith("ups")) {
    return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  }
  if (service.startsWith("fedex")) {
    return `https://www.fedex.com/en-gb/tracking.html?trknbr=${trackingNumber}`;
  }
  return null;
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
  const trackingUrl = trackingNumber
    ? getTrackingUrl(trackingNumber, shippingLabel.serviceLevel)
    : null;

  const trackingBlock = trackingNumber
    ? `
      <p style="margin:0 0 18px">Your tracking number is <strong>${trackingNumber}</strong></p>
      ${
        trackingUrl
          ? `<p style="margin:0 0 24px">
              <a href="${trackingUrl}"
                style="display:inline-block;background:#ffffff;color:#000000;padding:14px 28px;text-decoration:none;text-transform:uppercase;letter-spacing:0.3em;font-size:12px;font-weight:600;border-radius:2px">
                Track Your Parcel
              </a>
            </p>`
          : `<p style="margin:0 0 18px">Visit your carrier's website and enter the tracking number above to follow your delivery.</p>`
      }
    `
    : `<p style="margin:0 0 18px">Your tracking number will be available shortly.</p>`;

  return renderEmailShell({
    eyebrow: siteName,
    title: "Your Order Is On Its Way",
    body: `
      <p style="margin:0 0 18px">${customerName ?? "Apertos Athlete"}, your order has been packed and is on its way to you.</p>
      ${trackingBlock}
      <p style="margin:0 0 8px;color:#a3a3a3">Carrier: ${shippingLabel.provider ?? "Shipping partner"}</p>
      <p style="margin:0;color:#a3a3a3">Service: ${shippingLabel.serviceLevel ?? "Standard"}</p>
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

export function renderPodFulfillmentEmail({
  sessionId,
  podItems,
  shippingAddress
}: {
  sessionId: string;
  podItems: OrderItem[];
  shippingAddress: OrderShippingAddress | null;
}) {
  const addr = shippingAddress;
  const addressLines = [
    addr?.name,
    addr?.address1,
    addr?.address2,
    addr?.city,
    addr?.state,
    addr?.postalCode,
    addr?.country
  ]
    .filter(Boolean)
    .join("<br />");

  const itemRows = podItems
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08)">${item.name}</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);text-align:center">${item.colour ?? "—"}</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);text-align:center">${item.size}</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);text-align:center">${item.quantity}</td>
        </tr>
      `
    )
    .join("");

  return renderEmailShell({
    eyebrow: "POD Fulfillment Required",
    title: "Submit To Tapstitch",
    body: `
      <p style="margin:0 0 24px;color:#dc143c;font-size:13px">A customer has ordered a print-on-demand item. Submit this order to Tapstitch now.</p>

      <table style="width:100%;border-collapse:collapse;margin:0 0 24px">
        <thead>
          <tr style="color:#8f8f8f;font-size:11px;letter-spacing:0.28em">
            <th style="padding:0 0 10px;text-align:left">Product</th>
            <th style="padding:0 0 10px;text-align:center">Colour</th>
            <th style="padding:0 0 10px;text-align:center">Size</th>
            <th style="padding:0 0 10px;text-align:center">Qty</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <p style="margin:0 0 8px;font-size:12px;color:#8f8f8f;letter-spacing:0.28em;text-transform:uppercase">Ship To</p>
      <p style="margin:0 0 24px;line-height:1.8">${addressLines || "Address not available"}</p>
      ${addr?.phone ? `<p style="margin:0 0 8px">Phone: ${addr.phone}</p>` : ""}
      ${addr?.email ? `<p style="margin:0 0 24px">Email: ${addr.email}</p>` : ""}

      <p style="margin:0;color:#8f8f8f;font-size:11px">Order ref: ${sessionId}</p>
    `,
    footer: "Apertos Fightwear — POD Fulfillment Alert"
  });
}
