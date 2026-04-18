"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Product, SizeGuideBlock } from "@/lib/products";
import { useCart } from "@/components/cart/cart-provider";

function SizeGuideTable({ guide }: { guide: SizeGuideBlock }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">{guide.title}</p>
        <p className="text-xs uppercase leading-6 tracking-[0.2em] text-neutral-400">{guide.note}</p>
      </div>
      <div className="overflow-hidden rounded-[1.25rem] border border-white/10">
        <div className="grid grid-cols-4 bg-white/[0.04] px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-neutral-400">
          <span>Size</span>
          <span>Chest</span>
          <span>Waist</span>
          <span>Length</span>
        </div>
        {guide.rows.map((row) => (
          <div
            key={row.size}
            className="grid grid-cols-4 border-t border-white/10 px-4 py-3 text-sm uppercase tracking-[0.18em] text-neutral-200"
          >
            <span>{row.size}</span>
            <span>{row.chest ?? "-"}</span>
            <span>{row.waist ?? "-"}</span>
            <span>{row.length ?? "-"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductDetail({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const galleryImages = useMemo(() => product.images ?? [product.image], [product.image, product.images]);
  const [activeImage, setActiveImage] = useState(galleryImages[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product, selectedSize);
    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1600);
  };

  return (
    <div className="grid gap-10 pb-24 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-white">
          <Image
            src={activeImage}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-contain"
            priority
          />
        </div>

        {galleryImages.length > 1 ? (
          <div className="grid grid-cols-2 gap-4">
            {galleryImages.map((image, index) => {
              const isActive = image === activeImage;

              return (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  className={`relative min-h-40 overflow-hidden rounded-[1.25rem] border bg-white transition ${
                    isActive ? "border-white" : "border-white/10 hover:border-white/40"
                  }`}
                  aria-label={`View ${product.name} image ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    sizes="(min-width: 1024px) 20vw, 50vw"
                    className="object-contain"
                  />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <div className="absolute -right-6 top-0 h-36 w-36 opacity-[0.08]">
            <Image src="/logo-mark.png" alt="" fill sizes="144px" className="object-contain" />
          </div>
          <div className="relative space-y-4">
            <p className="text-xs uppercase tracking-[0.45em] text-muted">{product.category}</p>
            <h1 className="font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">{product.name}</h1>
            <p className="text-2xl font-semibold">{product.priceLabel}</p>
            <p className="max-w-xl text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">
              {product.description}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">Select Size</p>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map((size) => {
              const active = size === selectedSize;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-16 border px-4 py-3 text-xs uppercase tracking-[0.35em] transition ${
                    active ? "border-white bg-white text-black" : "border-white/15 hover:border-white/50"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="absolute right-0 top-0 h-28 w-28 opacity-[0.08]">
            <Image src="/logo-mark.png" alt="" fill sizes="112px" className="object-contain" />
          </div>
          <div className="relative space-y-6">
            {product.sizeGuides.map((guide) => (
              <SizeGuideTable key={guide.title} guide={guide} />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full border border-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black"
        >
          {added ? `Added ${selectedSize}` : "Add To Cart"}
        </button>
      </div>
    </div>
  );
}
