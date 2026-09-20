"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useRef } from "react";
import { Product } from "@/lib/products";
import { ProductCard } from "@/components/products/product-card";

export function ProductShowcase({ products, label }: { products: Product[]; label?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCard = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-showcase-card]");
    const step = card ? card.offsetWidth + 24 : 340;
    const atStart = track.scrollLeft <= 1;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;

    if (direction === 1 && atEnd) {
      track.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (direction === -1 && atStart) {
      track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
      return;
    }
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  }, []);

  return (
    <div className="space-y-4">
      {label ? (
        <div className="flex items-center justify-between gap-4">
          <p className="text-[10px] uppercase tracking-[0.45em] text-crimson">{label}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-white/40 hover:bg-white/5"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-white/40 hover:bg-white/5"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth"
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-showcase-card
            className="w-[280px] shrink-0 snap-start sm:w-[320px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}