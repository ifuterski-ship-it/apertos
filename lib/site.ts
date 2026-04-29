export const siteName = "Apertos Fightwear";
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://apertosfightwear.com";
export const siteDescription =
  "Premium BJJ and MMA fightwear built for athletes who need sharp fit, durable performance fabrics, and clean no-gi essentials.";

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}
