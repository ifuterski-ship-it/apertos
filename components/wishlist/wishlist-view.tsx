"use client";

import Link from "next/link";
import { ProductGrid } from "@/components/products/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { products } from "@/lib/products";

export function WishlistView() {
  const { productIds, clear, isHydrated } = useWishlist();

  if (!isHydrated) {
    return <div className="py-24 text-sm uppercase tracking-[0.3em] text-muted">Loading wishlist...</div>;
  }

  const wishlistProducts = products.filter((product) => productIds.includes(product.id));

  if (!wishlistProducts.length) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Your wishlist is empty</p>
        <h1 className="font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">Save Your Favorites</h1>
        <Link
          href="/shop"
          className="border border-white px-6 py-3 text-xs uppercase tracking-[0.35em] transition hover:bg-white hover:text-black"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24">
      <SectionHeading
        eyebrow="Wishlist"
        title="Your Saved Products"
        description="Tap the heart again anytime to remove a product from your wishlist."
      />
      <ProductGrid products={wishlistProducts} />
      <button
        type="button"
        onClick={clear}
        className="border border-white/10 px-5 py-3 text-xs uppercase tracking-[0.35em] text-neutral-300 transition hover:border-white/40 hover:text-white"
      >
        Clear Wishlist
      </button>
    </div>
  );
}
