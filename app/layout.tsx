import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/cart-provider";
import { SiteShell } from "@/components/layout/site-shell";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";

export const metadata: Metadata = {
  title: "APERTOS",
  description: "Premium combat sports apparel and equipment."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <WishlistProvider>
          <CartProvider>
            <SiteShell>{children}</SiteShell>
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
