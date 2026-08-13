import type { Product } from "@/lib/products";

export const sakuraDragonLaunchAt = "2026-09-03T00:00:00+01:00";

export function isProductComingSoon(product: Product, now = Date.now()): boolean {
  if (product.launchAt && now >= new Date(product.launchAt).getTime()) {
    return false;
  }

  return product.isComingSoon ?? false;
}

export function getUpcomingDropProducts(prods: Product[]) {
  return prods.filter((product) => product.launchAt && isProductComingSoon(product));
}

export function formatLaunchDate(launchAt: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London"
  }).format(new Date(launchAt));
}
