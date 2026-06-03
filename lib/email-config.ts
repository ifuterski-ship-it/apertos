export const defaultContactEmail = process.env.CONTACT_EMAIL || "ifuterski@icloud.com";
export const newsletterNotifyEmail = process.env.NEWSLETTER_NOTIFY_EMAIL || defaultContactEmail;
export const podFulfillmentEmail = process.env.POD_FULFILLMENT_EMAIL || defaultContactEmail;
export const welcomeFromEmail =
  process.env.RESEND_FROM_WELCOME || "APERTOS Welcome <onboarding@resend.dev>";
export const ordersFromEmail =
  process.env.RESEND_FROM_ORDERS || "Apertos Fightwear <orders@apertosfightwear.com>";
export const supportFromEmail =
  process.env.RESEND_FROM_SUPPORT || "APERTOS Support <onboarding@resend.dev>";
export const newsFromEmail =
  process.env.RESEND_FROM_NEWS || "Apertos Fightwear <orders@apertosfightwear.com>";
