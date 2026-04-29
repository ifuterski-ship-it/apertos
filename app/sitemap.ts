import type { MetadataRoute } from "next";
import { products } from "@/lib/products";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "/",
    "/shop",
    "/contact",
    "/blogs/what-is-a-bjj-rash-guard",
    "/blogs/what-are-mma-shorts",
    "/blogs/what-is-a-no-gi-set"
  ];
  const productPages = products.map((product) => `/product/${product.id}`);

  return [...staticPages, ...productPages].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/product/") ? 0.8 : 0.6
  }));
}
