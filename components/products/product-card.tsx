"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useRef, useState } from "react";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { LaunchCountdown } from "@/components/products/launch-countdown";
import { isProductComingSoon } from "@/lib/product-availability";
import { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { has, toggle } = useWishlist();
  const inWishlist = has(product.id);
  const comingSoon = isProductComingSoon(product);

  const images = product.images?.length ? product.images : [product.image];
  const [activeIndex, setActiveIndex] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const swipedRef = useRef(false);

  const imageTrackRef = useRef<HTMLDivElement>(null);

  const prevImage = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setActiveIndex((i) => (i + 1) % images.length);

  const handleMouseEnter = () => {
    if (images.length > 1) setActiveIndex((i) => (i + 1) % images.length);
  };

  const handleMouseLeave = () => {
    setActiveIndex(0);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
    swipedRef.current = false;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) > 40) {
      swipedRef.current = true;
      if (deltaX < 0) {
        nextImage();
      } else {
        prevImage();
      }
      return;
    }
    swipedRef.current = false;
  };

  const handleImageTap = (event: React.MouseEvent) => {
    if (swipedRef.current) {
      event.preventDefault();
      event.stopPropagation();
      swipedRef.current = false;
    }
  };

  return (
    <div className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-panel transition duration-500 hover:-translate-y-1 hover:border-white/20">
      <div className="relative">
        {product.isBestSeller ? (
          <div className="absolute left-4 top-4 z-10 bg-crimson px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
            Best Seller
          </div>
        ) : null}
        {comingSoon ? (
          <div className="absolute left-4 top-4 z-10 bg-crimson px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
            Coming Soon
          </div>
        ) : null}
        {!comingSoon ? (
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

        <div className="relative aspect-[4/5] overflow-hidden bg-[#0d0d0d]">
          <Link
            href={`/product/${product.id}`}
            onClick={handleImageTap}
            className="block h-full w-full"
          >
            <div
              ref={imageTrackRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="flex h-full w-full"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {images.map((image) => (
                <div key={image} className="relative h-full w-full shrink-0">
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="object-cover transition duration-500"
                  />
                </div>
              ))}
            </div>
          </Link>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/50">{product.category}</p>
            <h3 className="font-display text-2xl uppercase tracking-[0.08em] text-white">{product.name}</h3>
          </div>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  prevImage();
                }}
                className="absolute left-3 top-1/2 z-10 inline-flex -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 p-2 text-white transition hover:bg-black/90 hover:border-white/50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  nextImage();
                }}
                className="absolute right-3 top-1/2 z-10 inline-flex -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 p-2 text-white transition hover:bg-black/90 hover:border-white/50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
                {images.map((image, i) => (
                  <span
                    key={image}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">{product.shortDescription}</p>
          <p className="text-lg font-semibold text-white">{product.priceLabel}</p>
        </div>

        {comingSoon && product.launchAt ? (
          <LaunchCountdown launchAt={product.launchAt} />
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/product/${product.id}`}
            className="flex items-center justify-center border border-white/15 bg-black py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:border-white/40 hover:bg-white/5"
          >
            {comingSoon ? "Coming Soon" : "Add To Cart"}
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