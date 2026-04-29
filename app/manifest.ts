import type { MetadataRoute } from "next";
import { siteDescription, siteLogoPath, siteName, siteUrl } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: "Apertos",
    description: siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#020202",
    theme_color: "#020202",
    icons: [
      {
        src: siteLogoPath,
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: siteLogoPath,
        sizes: "512x512",
        type: "image/png"
      }
    ],
    id: siteUrl
  };
}
