"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/components/cart/cart-provider";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { hasStripeClientEnv } from "@/lib/stripe";

export function CartView() {
  const { items, updateQuantity, removeItem, clearCart, isHydrated } = useCart();
  const supabase = useMemo(() => (hasSupabaseEnv ? createClient() : null), []);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress1, setShippingAddress1] = useState("");
  const [shippingAddress2, setShippingAddress2] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("GB");
  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const subtotalAmount = useMemo(
    () => items.reduce((total, item) => total + Math.round(item.price * 100) * item.quantity, 0) / 100,
    [items]
  );

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

    if (!hasStripeClientEnv()) {
      setCheckoutStatus("Stripe checkout is not configured for this environment yet.");
      return;
    }

    if (!checkoutEmail) {
      setCheckoutStatus("Add an email address to receive your order confirmation.");
      return;
    }
    if (!shippingName || !shippingAddress1 || !shippingCity || !shippingPostalCode || !shippingCountry) {
      setCheckoutStatus("Add your shipping address so we can show live shipping rates at checkout.");
      return;
    }

    setIsCheckingOut(true);

    try {
      const stripeResponse = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: checkoutEmail,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size
          })),
          shippingAddress: {
            name: shippingName,
            phone: shippingPhone || undefined,
            address1: shippingAddress1,
            address2: shippingAddress2 || undefined,
            city: shippingCity,
            state: shippingState || undefined,
            postalCode: shippingPostalCode,
            country: shippingCountry.toUpperCase()
          }
        })
      });

      const result = (await stripeResponse.json()) as { ok?: boolean; message?: string; url?: string };

      if (!stripeResponse.ok || !result.ok || !result.url) {
        setCheckoutStatus(result.message ?? "Unable to start Stripe checkout right now.");
        return;
      }

      window.location.href = result.url;
    } catch {
      setCheckoutStatus("Unable to connect to Stripe right now. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
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
                  <p className="text-lg font-semibold">£{(item.price * item.quantity).toFixed(2)}</p>
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
              <span>£{subtotalAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-300">
              <span>Shipping</span>
              <span>Processed Next Step</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>£{subtotalAmount.toFixed(2)}</span>
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
            <div className="space-y-2">
              <label htmlFor="shipping-name" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                Shipping Name
              </label>
              <input
                id="shipping-name"
                type="text"
                value={shippingName}
                onChange={(event) => setShippingName(event.target.value)}
                className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="shipping-phone" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                Shipping Phone (Optional)
              </label>
              <input
                id="shipping-phone"
                type="tel"
                value={shippingPhone}
                onChange={(event) => setShippingPhone(event.target.value)}
                className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="shipping-address1" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                Address Line 1
              </label>
              <input
                id="shipping-address1"
                type="text"
                value={shippingAddress1}
                onChange={(event) => setShippingAddress1(event.target.value)}
                className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="shipping-address2" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                Address Line 2 (Optional)
              </label>
              <input
                id="shipping-address2"
                type="text"
                value={shippingAddress2}
                onChange={(event) => setShippingAddress2(event.target.value)}
                className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                aria-label="Shipping city"
                placeholder="City"
                type="text"
                value={shippingCity}
                onChange={(event) => setShippingCity(event.target.value)}
                className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
              />
              <input
                aria-label="Shipping state"
                placeholder="State / Region (optional)"
                type="text"
                value={shippingState}
                onChange={(event) => setShippingState(event.target.value)}
                className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                aria-label="Shipping postal code"
                placeholder="Postcode"
                type="text"
                value={shippingPostalCode}
                onChange={(event) => setShippingPostalCode(event.target.value)}
                className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
              />
              <input
                aria-label="Shipping country code"
                placeholder="Country code (e.g. GB)"
                type="text"
                maxLength={2}
                value={shippingCountry}
                onChange={(event) => setShippingCountry(event.target.value.toUpperCase())}
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
              {isCheckingOut ? "Starting Checkout" : "Proceed To Checkout"}
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
