export const siteName = "Apertos Fightwear";
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://apertosfightwear.com";
export const siteDescription =
  "Premium BJJ and MMA fightwear built for athletes who need sharp fit, durable performance fabrics, and clean no-gi essentials.";
export const siteLogoPath = "/logo-mark.png";
export const siteKeywords = [
  "Apertos Fightwear",
  "bjj rash guard",
  "no gi rash guard",
  "mma shorts",
  "bjj shorts",
  "judo rashguard",
  "no-gi sets",
  "fightwear uk",
  "bjj gear uk",
  "grappling shorts",
  "compression rash guard bjj",
  "bjj clothing uk",
  "mma clothing uk",
  "no gi bjj uk",
  "grappling gear uk",
  "bjj rash guard uk",
  "mma gear uk",
  "no-gi fightwear",
  "bjj training gear",
  "combat sports apparel uk",
  "premium fightwear",
  "UK fightwear brand",
  "grappling rash guard",
  "no gi training"
];

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}
