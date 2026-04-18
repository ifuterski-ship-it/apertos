import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/cart-provider";
import { SiteShell } from "@/components/layout/site-shell";

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
        <CartProvider>
          <SiteShell>{children}</SiteShell>
        </CartProvider>
      </body>
    </html>
  );
}
