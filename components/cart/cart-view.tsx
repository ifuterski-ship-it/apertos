"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/components/cart/cart-provider";
import { getProductById } from "@/lib/products";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export function CartView() {
  const { items, updateQuantity, removeItem, subtotal, clearCart, isHydrated } = useCart();
  const supabase = useMemo(() => (hasSupabaseEnv ? createClient() : null), []);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const uniqueProductIds = [...new Set(items.map((item) => item.productId))];
  const singleProduct = uniqueProductIds.length === 1 ? getProductById(uniqueProductIds[0]) : null;

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setCheckoutEmail(data.user.email);
      }
    });
  }, [supabase]);

  const handleCheckout = async () => {
    setCheckoutStatus(null);

    if (!singleProduct) {
      setCheckoutStatus("Stripe payment links work one product at a time. Please check out each product separately.");
      return;
    }

    if (!checkoutEmail) {
      setCheckoutStatus("Add an email address to receive your order confirmation.");
      return;
    }

    setIsCheckingOut(true);

    const response = await fetch("/api/email/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: checkoutEmail,
        items,
        total: subtotal
      })
    });

    const result = (await response.json()) as { ok?: boolean; message?: string };

    if (!response.ok || !result.ok) {
      setCheckoutStatus(result.message ?? "Unable to send the order confirmation right now.");
      setIsCheckingOut(false);
      return;
    }

    setCheckoutStatus("Order confirmation sent. Opening Stripe checkout now.");
    window.open(singleProduct.paymentLink, "_blank", "noopener,noreferrer");
    setIsCheckingOut(false);
  };

  if (!isHydrated) {
    return <div className="py-24 text-sm uppercase tracking-[0.3em] text-muted">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Your cart is empty</p>
        <h1 className="font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">Build Your Kit</h1>
        <Link
          href="/shop"
          className="border border-white px-6 py-3 text-xs uppercase tracking-[0.35em] transition hover:bg-white hover:text-black"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 pb-24 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[180px_1fr]"
          >
            <div className="relative min-h-44 overflow-hidden rounded-[1.25rem] bg-white">
              <div className="absolute inset-0 p-4">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="180px"
                  className="object-contain"
                />
              </div>
            </div>
            <div className="flex flex-col justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-2xl uppercase tracking-[0.08em]">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.35em] text-muted">Size {item.size}</p>
                  </div>
                  <p className="text-lg font-semibold">\u00A3{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center border border-white/10">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-4 py-3 transition hover:bg-white hover:text-black"
                    aria-label={`Decrease quantity for ${item.name}`}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-5 text-sm uppercase tracking-[0.25em]">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-4 py-3 transition hover:bg-white hover:text-black"
                    aria-label={`Increase quantity for ${item.name}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-neutral-400 transition hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
              <Link
                href={getProductById(item.productId)?.paymentLink ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit border border-white/10 px-4 py-3 text-xs uppercase tracking-[0.3em] text-neutral-300 transition hover:border-white hover:text-white"
              >
                Buy This Item
              </Link>
            </div>
          </div>
        ))}
      </div>

      <aside className="h-fit rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-muted">Summary</p>
            <h2 className="mt-3 font-display text-3xl uppercase tracking-[0.08em]">Cart Total</h2>
          </div>

          <div className="space-y-3 border-y border-white/10 py-5 text-sm uppercase tracking-[0.2em]">
            <div className="flex items-center justify-between text-neutral-300">
              <span>Subtotal</span>
              <span>\u00A3{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-300">
              <span>Shipping</span>
              <span>Calculated At Checkout</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>\u00A3{subtotal.toFixed(2)}</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label htmlFor="checkout-email" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                Confirmation Email
              </label>
              <input
                id="checkout-email"
                type="email"
                value={checkoutEmail}
                onChange={(event) => setCheckoutEmail(event.target.value)}
                className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
              />
            </div>
            {checkoutStatus ? (
              <p className="text-xs uppercase leading-6 tracking-[0.2em] text-neutral-300">{checkoutStatus}</p>
            ) : null}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full border border-white px-5 py-4 text-xs font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black"
            >
              {isCheckingOut ? "Sending" : singleProduct ? "Checkout With Stripe" : "Checkout Items Separately"}
            </button>
            <button
              type="button"
              onClick={clearCart}
              className="w-full border border-white/10 px-5 py-4 text-xs uppercase tracking-[0.35em] text-neutral-300 transition hover:border-white/40 hover:text-white"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
