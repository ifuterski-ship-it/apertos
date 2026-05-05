"use client";

import Image from "next/image";
import { Star, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Product, SizeGuideBlock } from "@/lib/products";
import { ProductInventoryBySize } from "@/lib/inventory";
import { trackEvent } from "@/lib/analytics";
import { useCart } from "@/components/cart/cart-provider";
import { hasStripeClientEnv } from "@/lib/stripe";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${star <= Math.round(rating) ? "fill-white text-white" : "fill-transparent text-neutral-600"}`}
        />
      ))}
    </div>
  );
}

function SizeGuideTable({ guide }: { guide: SizeGuideBlock }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
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
            <span>{row.chest ?? "—"}</span>
            <span>{row.waist ?? "—"}</span>
            <span>{row.length ?? "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductDetail({
  product,
  inventoryBySize,
  reviewSummary
}: {
  product: Product;
  inventoryBySize: ProductInventoryBySize;
  reviewSummary?: { average: number; count: number } | null;
}) {
  const [added, setAdded] = useState(false);
  const galleryImages = useMemo(() => product.images ?? [product.image], [product.image, product.images]);
  const [activeImage, setActiveImage] = useState(galleryImages[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { addItem } = useCart();
  const hasTrackedProductView = useRef(false);
  const selectedInventory = inventoryBySize[selectedSize] ?? {
    stock: null,
    isOutOfStock: false,
    message: "Stock unavailable"
  };
  const isOutOfStock = selectedInventory.isOutOfStock;
  const isLowStock =
    !isOutOfStock &&
    selectedInventory.stock !== null &&
    selectedInventory.stock > 0 &&
    selectedInventory.stock <= 5;
  const categoryTaglines: Record<string, string> = {
    "Performance Top": "Compression-style BJJ rash guard built for no-gi drilling, mat durability and clean performance fit.",
    "Training Bottoms": "Lightweight MMA shorts made for grappling movement, sparring comfort and everyday combat sports training.",
    "Bundle": "Matching no-gi set pairing a premium rash guard with shorts for a complete combat sports look."
  };
  const categoryTagline = categoryTaglines[product.category];
  const firstAvailableSize = useMemo(
    () => product.sizes.find((size) => !inventoryBySize[size]?.isOutOfStock) ?? product.sizes[0],
    [inventoryBySize, product.sizes]
  );

  useEffect(() => {
    if (inventoryBySize[selectedSize]?.isOutOfStock && firstAvailableSize !== selectedSize) {
      setSelectedSize(firstAvailableSize);
    }
  }, [firstAvailableSize, inventoryBySize, selectedSize]);

  useEffect(() => {
    if (hasTrackedProductView.current) return;
    trackEvent("view_item", {
      currency: "GBP",
      value: product.price,
      items: [{ item_id: product.id, item_name: product.name, item_category: product.category, price: product.price }]
    });
    hasTrackedProductView.current = true;
  }, [product.category, product.id, product.name, product.price]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, selectedSize);
    trackEvent("add_to_cart", {
      currency: "GBP",
      value: product.price,
      items: [{ item_id: product.id, item_name: product.name, item_category: product.category, item_variant: selectedSize, price: product.price, quantity: 1 }]
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  const handleZoomMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setZoomOrigin(`${((event.clientX - bounds.left) / bounds.width) * 100}% ${((event.clientY - bounds.top) / bounds.height) * 100}%`);
  };

  const handleBuyNow = async () => {
    setCheckoutMessage(null);
    if (!hasStripeClientEnv()) { setCheckoutMessage("Stripe checkout is not configured for this environment yet."); return; }
    if (isOutOfStock) { setCheckoutMessage("This product is currently out of stock."); return; }
    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ productId: product.id, quantity: 1, size: selectedSize }] })
      });
      const result = (await response.json()) as { ok?: boolean; message?: string; url?: string };
      if (!response.ok || !result.ok || !result.url) { setCheckoutMessage(result.message ?? "Unable to start Stripe checkout right now."); return; }
      window.location.href = result.url;
    } catch {
      setCheckoutMessage("Unable to connect to Stripe right now. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const addToCartLabel = isOutOfStock ? "Out Of Stock" : added ? `Added ${selectedSize}` : "Add To Cart";

  return (
    <>
      {/* Extra bottom padding on mobile so sticky CTA doesn't cover content */}
      <div className="grid gap-10 pb-32 lg:grid-cols-[1.2fr_0.8fr] lg:pb-24">
        {/* ── Images ── */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            className="relative block min-h-[480px] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white text-left sm:min-h-[520px]"
          >
            <div className="absolute inset-0 p-8 md:p-14">
              <Image src={activeImage} alt={product.name} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-contain" priority />
            </div>
            <div className="absolute bottom-5 right-5 border border-black/10 bg-white/90 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-black">
              Click To Zoom
            </div>
            {product.isBestSeller ? (
              <div className="absolute left-5 top-5 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-black">
                Best Seller
              </div>
            ) : null}
          </button>

          {galleryImages.length > 1 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2">
              {galleryImages.map((image, index) => {
                const isActive = image === activeImage;
                return (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className={`relative min-h-32 overflow-hidden rounded-[1.25rem] border bg-white transition ${isActive ? "border-white" : "border-white/10 hover:border-white/40"}`}
                    aria-label={`View ${product.name} image ${index + 1}`}
                  >
                    <div className="absolute inset-0 p-3">
                      <Image src={image} alt={`${product.name} view ${index + 1}`} fill sizes="(min-width: 1024px) 20vw, 25vw" className="object-contain" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* ── Product info ── */}
        <div className="space-y-6">
          {/* Title card */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 md:p-8">
            <div className="absolute -right-6 top-0 h-36 w-36 opacity-[0.08]">
              <Image src="/logo-mark.png" alt="" fill sizes="144px" className="object-contain" />
            </div>
            <div className="relative space-y-3">
              <p className="text-xs uppercase tracking-[0.45em] text-muted">{product.category}</p>
              <h1 className="font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">{product.name}</h1>

              {/* Review summary */}
              {reviewSummary && reviewSummary.count > 0 ? (
                <div className="flex items-center gap-3">
                  <Stars rating={reviewSummary.average} />
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                    {reviewSummary.average.toFixed(1)} ({reviewSummary.count} {reviewSummary.count === 1 ? "review" : "reviews"})
                  </p>
                </div>
              ) : null}

              {/* Category tagline */}
              {categoryTagline ? (
                <p className="text-[13px] uppercase leading-6 tracking-[0.22em] text-neutral-400">
                  {categoryTagline}
                </p>
              ) : null}

              <p className="text-2xl font-semibold">{product.priceLabel}</p>

              {/* Stock status */}
              <div className="flex items-center gap-3">
                <p className={`text-xs uppercase tracking-[0.35em] ${isOutOfStock ? "text-red-300" : "text-neutral-300"}`}>
                  {selectedInventory.message}
                </p>
                {isLowStock ? (
                  <span className="border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-amber-300">
                    Low Stock — {selectedInventory.stock} left
                  </span>
                ) : null}
              </div>

              <p className="max-w-xl text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">
                {product.description}
              </p>

              {/* Material */}
              {product.material ? (
                <p className="text-xs uppercase leading-6 tracking-[0.2em] text-neutral-400">
                  {product.material}
                </p>
              ) : null}
            </div>
          </div>

          {/* Size selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.35em] text-muted">Select Size</p>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 underline underline-offset-4 transition hover:text-white"
              >
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size) => {
                const active = size === selectedSize;
                const disabled = Boolean(inventoryBySize[size]?.isOutOfStock);
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedSize(size)}
                    className={`min-h-[44px] min-w-16 border px-4 py-3 text-xs uppercase tracking-[0.35em] transition ${
                      active ? "border-white bg-white text-black" : "border-white/15 hover:border-white/50"
                    } disabled:cursor-not-allowed disabled:border-white/10 disabled:text-neutral-600 disabled:line-through`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buttons — desktop/tablet */}
          <div className="hidden space-y-3 sm:block">
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isCheckingOut || isOutOfStock}
              className="block min-h-[56px] w-full bg-white px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.35em] text-black transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
            >
              {isOutOfStock ? "Out Of Stock" : isCheckingOut ? "Starting Checkout…" : "Buy Now"}
            </button>
            {checkoutMessage ? (
              <p className="text-xs uppercase leading-6 tracking-[0.2em] text-neutral-300">{checkoutMessage}</p>
            ) : null}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="min-h-[52px] w-full border border-white/20 px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-neutral-300 transition hover:border-white hover:text-white disabled:cursor-not-allowed disabled:border-neutral-700 disabled:text-neutral-600"
            >
              {addToCartLabel}
            </button>
          </div>

          {/* Accordions */}
          <div className="space-y-2">
            {product.careInstructions ? (
              <details className="group rounded-[1.5rem] border border-white/10 bg-white/[0.02]">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
                  <span className="text-[11px] uppercase tracking-[0.35em] text-neutral-400">Care Instructions</span>
                  <span className="text-neutral-500 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="px-5 pb-4">
                  <p className="text-[11px] uppercase leading-6 tracking-[0.3em] text-neutral-500">{product.careInstructions}</p>
                </div>
              </details>
            ) : null}
            <details className="group rounded-[1.5rem] border border-white/10 bg-white/[0.02]">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
                <span className="text-[11px] uppercase tracking-[0.35em] text-neutral-400">Sizing</span>
                <span className="text-neutral-500 transition-transform duration-200 group-open:rotate-45">+</span>
              </summary>
              <div className="px-5 pb-4">
                <p className="text-[11px] uppercase leading-6 tracking-[0.3em] text-neutral-500">
                  Available in {product.sizes.join(", ")}. Use the Size Guide above for detailed measurements.
                </p>
              </div>
            </details>
            <details className="group rounded-[1.5rem] border border-white/10 bg-white/[0.02]">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
                <span className="text-[11px] uppercase tracking-[0.35em] text-neutral-400">Shipping</span>
                <span className="text-neutral-500 transition-transform duration-200 group-open:rotate-45">+</span>
              </summary>
              <div className="space-y-1 px-5 pb-4">
                <p className="text-[11px] uppercase leading-6 tracking-[0.3em] text-neutral-500">Free UK shipping on orders over £40 · Standard 2–5 working days</p>
                <p className="text-[11px] uppercase leading-6 tracking-[0.3em] text-neutral-500">International shipping available to EU, US, CA and more</p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* ── Sticky mobile Add to Cart ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-canvas/96 p-4 backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-0">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base uppercase tracking-[0.06em]">{product.name}</p>
            <p className="text-sm font-semibold">{product.priceLabel}</p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="min-h-[50px] shrink-0 border border-white bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-black transition hover:bg-transparent hover:text-white disabled:border-neutral-600 disabled:bg-neutral-900 disabled:text-neutral-500"
          >
            {addToCartLabel}
          </button>
        </div>
      </div>

      {/* ── Size guide modal ── */}
      {isSizeGuideOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={(e) => e.target === e.currentTarget && setIsSizeGuideOpen(false)}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-t-[2rem] border border-white/10 bg-canvas sm:rounded-[2rem]">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.45em] text-muted">Sizing</p>
                <h2 className="font-display text-2xl uppercase tracking-[0.08em]">Size Guide</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="border border-white/10 p-2.5 transition hover:border-white hover:bg-white hover:text-black"
                aria-label="Close size guide"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-6 overflow-y-auto px-6 py-6">
              {product.sizeGuides.map((guide) => (
                <SizeGuideTable key={guide.title} guide={guide} />
              ))}
              <div className="rounded-[1.25rem] border border-amber-500/20 bg-amber-500/[0.06] px-5 py-4">
                <p className="text-xs uppercase leading-6 tracking-[0.22em] text-amber-200">
                  BJJ rash guards should fit snug — size down if between sizes.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Zoom modal ── */}
      {isZoomOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute right-6 top-6 border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black"
          >
            Close
          </button>
          <div className="w-full max-w-6xl space-y-4">
            <div
              className="relative h-[75vh] overflow-hidden rounded-[2rem] border border-white/10 bg-white"
              onMouseMove={handleZoomMove}
              onMouseLeave={() => setZoomOrigin("50% 50%")}
            >
              <div className="absolute inset-0 p-8 md:p-12">
                <Image
                  src={activeImage}
                  alt={`${product.name} enlarged`}
                  fill
                  sizes="100vw"
                  className="object-contain transition duration-200"
                  style={{ transform: "scale(2.1)", transformOrigin: zoomOrigin }}
                />
              </div>
            </div>
            <p className="text-center text-xs uppercase tracking-[0.3em] text-neutral-400">
              Move across the image to inspect details
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
