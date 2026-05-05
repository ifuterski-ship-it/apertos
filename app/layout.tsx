import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { CartProvider } from "@/components/cart/cart-provider";
import { SiteShell } from "@/components/layout/site-shell";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";
import { absoluteUrl, siteDescription, siteKeywords, siteLogoPath, siteName, siteUrl } from "@/lib/site";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  keywords: siteKeywords,
  applicationName: siteName,
  category: "Sports Apparel",
  verification: {
    google: "PLACEHOLDER_VERIFICATION_CODE"
  },
  icons: {
    icon: [
      { url: siteLogoPath, sizes: "32x32", type: "image/png" },
      { url: siteLogoPath, sizes: "192x192", type: "image/png" }
    ],
    apple: [{ url: siteLogoPath, sizes: "180x180", type: "image/png" }],
    shortcut: [siteLogoPath]
  },
  alternates: {
    canonical: absoluteUrl("/")
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: absoluteUrl("/"),
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: absoluteUrl(siteLogoPath),
        width: 1200,
        height: 1200,
        alt: `${siteName} logo`
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [absoluteUrl(siteLogoPath)]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <WishlistProvider>
          <CartProvider>
            <SiteShell>{children}</SiteShell>
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
