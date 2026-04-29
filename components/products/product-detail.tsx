"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Product, SizeGuideBlock } from "@/lib/products";
import { ProductInventoryBySize } from "@/lib/inventory";
import { trackEvent } from "@/lib/analytics";
import { useCart } from "@/components/cart/cart-provider";
import { hasStripeClientEnv } from "@/lib/stripe";

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

export function ProductDetail({
  product,
  inventoryBySize
}: {
  product: Product;
  inventoryBySize: ProductInventoryBySize;
}) {
  const [added, setAdded] = useState(false);
  const galleryImages = useMemo(() => product.images ?? [product.image], [product.image, product.images]);
  const [activeImage, setActiveImage] = useState(galleryImages[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
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
    if (hasTrackedProductView.current) {
      return;
    }

    trackEvent("view_item", {
      currency: "GBP",
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price
        }
      ]
    });

    hasTrackedProductView.current = true;
  }, [product.category, product.id, product.name, product.price]);

  const handleAddToCart = () => {
    if (isOutOfStock) {
      return;
    }

    addItem(product, selectedSize);
    trackEvent("add_to_cart", {
      currency: "GBP",
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          item_variant: selectedSize,
          price: product.price,
          quantity: 1
        }
      ]
    });
    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1600);
  };

  const handleZoomMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    setZoomOrigin(`${x}% ${y}%`);
  };

  const handleBuyNow = async () => {
    setCheckoutMessage(null);

    if (!hasStripeClientEnv()) {
      setCheckoutMessage("Stripe checkout is not configured for this environment yet.");
      return;
    }

    if (isOutOfStock) {
      setCheckoutMessage("This product is currently out of stock.");
      return;
    }

    setIsCheckingOut(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: [
            {
              productId: product.id,
              quantity: 1,
              size: selectedSize
            }
          ]
        })
      });

      const result = (await response.json()) as { ok?: boolean; message?: string; url?: string };

      if (!response.ok || !result.ok || !result.url) {
        setCheckoutMessage(result.message ?? "Unable to start Stripe checkout right now.");
        return;
      }

      window.location.href = result.url;
    } catch {
      setCheckoutMessage("Unable to connect to Stripe right now. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <div className="grid gap-10 pb-24 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            className="relative block min-h-[520px] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white text-left"
          >
            <div className="absolute inset-0 p-10 md:p-16">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-contain"
                priority
              />
            </div>
            <div className="absolute bottom-5 right-5 border border-black/10 bg-white/90 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-black">
              Click To Zoom
            </div>
          </button>

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
                    <div className="absolute inset-0 p-4">
                      <Image
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        sizes="(min-width: 1024px) 20vw, 50vw"
                        className="object-contain"
                      />
                    </div>
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
              <p className={`text-xs uppercase tracking-[0.35em] ${isOutOfStock ? "text-red-300" : "text-neutral-300"}`}>
                {selectedInventory.message}
              </p>
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
                const sizeInventory = inventoryBySize[size];
                const disabled = Boolean(sizeInventory?.isOutOfStock);

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-16 border px-4 py-3 text-xs uppercase tracking-[0.35em] transition ${
                      active ? "border-white bg-white text-black" : "border-white/15 hover:border-white/50"
                    }`}
                  >
                    {size}
                    {disabled ? " Sold Out" : ""}
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
            disabled={isOutOfStock}
            className="w-full border border-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-neutral-600 disabled:bg-neutral-900 disabled:text-neutral-500"
          >
            {isOutOfStock ? "Out Of Stock" : added ? `Added ${selectedSize}` : "Add To Cart"}
          </button>
          {checkoutMessage ? (
            <p className="text-xs uppercase leading-6 tracking-[0.2em] text-neutral-300">{checkoutMessage}</p>
          ) : null}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isCheckingOut || isOutOfStock}
            className="block w-full border border-white/10 px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.35em] text-neutral-300 transition hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isOutOfStock ? "Out Of Stock" : isCheckingOut ? "Starting Checkout" : "Buy Now"}
          </button>
        </div>
      </div>

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
