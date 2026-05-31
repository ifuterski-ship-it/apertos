"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { has, toggle } = useWishlist();
  const inWishlist = has(product.id);

  return (
    <div className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-panel transition duration-500 hover:-translate-y-1 hover:border-white/20">
      <div className="relative">
        {product.isBestSeller ? (
          <div className="absolute left-4 top-4 z-10 bg-crimson px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
            Best Seller
          </div>
        ) : null}
        {product.isComingSoon ? (
          <div className="absolute left-4 top-4 z-10 bg-crimson px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
            Coming Soon
          </div>
        ) : null}
        {!product.isComingSoon ? (
          <button
            type="button"
            onClick={() => toggle(product.id)}
            className={`absolute right-4 top-4 z-10 inline-flex items-center justify-center rounded-full border p-2 transition ${
              inWishlist
                ? "border-crimson/60 bg-crimson/20 text-crimson"
                : "border-white/20 bg-black/50 text-neutral-200 hover:border-white/50 hover:text-white"
            }`}
            aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
          </button>
        ) : null}

        <Link href={`/product/${product.id}`} className="block">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#0d0d0d]">
            {product.isComingSoon ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative h-16 w-16 opacity-20">
                  <Image src="/logo-mark.png" alt="" fill sizes="64px" className="object-contain" />
                </div>
                <p className="mt-4 text-[10px] uppercase tracking-[0.4em] text-neutral-600">Image Coming Soon</p>
              </div>
            ) : (
              <div className="absolute inset-0 p-6 md:p-8">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                  className="object-contain transition duration-500 group-hover:scale-[1.04]"
                />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/50">{product.category}</p>
              <h3 className="font-display text-2xl uppercase tracking-[0.08em] text-white">{product.name}</h3>
            </div>
          </div>
        </Link>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">{product.shortDescription}</p>
          <p className="text-lg font-semibold text-white">{product.priceLabel}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/product/${product.id}`}
            className="flex items-center justify-center border border-white/15 bg-black py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:border-white/40 hover:bg-white/5"
          >
            {product.isComingSoon ? "Coming Soon" : "Add To Cart"}
          </Link>
          <Link
            href={`/product/${product.id}`}
            className="flex items-center justify-center bg-crimson py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-crimson/85"
          >
            Size Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
