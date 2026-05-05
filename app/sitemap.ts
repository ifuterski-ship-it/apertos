import type { MetadataRoute } from "next";
import { products } from "@/lib/products";

const BASE_URL = "https://apertosfightwear.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/product/${product.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7
  }));

  const blogEntries: MetadataRoute.Sitemap = [
    "/blogs/what-is-a-bjj-rash-guard",
    "/blogs/what-are-mma-shorts",
    "/blogs/what-is-a-no-gi-set"
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6
  }));

  const collectionEntries: MetadataRoute.Sitemap = [
    "/shop/rash-guards",
    "/shop/mma-shorts",
    "/shop/no-gi-sets"
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8
  }));

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9
    },
    ...collectionEntries,
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4
    },
    ...productEntries,
    ...blogEntries
  ];
}
