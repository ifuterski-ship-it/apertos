"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";

export function CartView() {
  const { items, updateQuantity, removeItem, subtotal, clearCart, isHydrated } = useCart();

  const handleCheckout = () => {
    window.alert("Checkout is currently mocked for local development only.");
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
            <div className="relative min-h-44 overflow-hidden rounded-[1.25rem]">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="180px"
                className="object-cover"
              />
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
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full border border-white px-5 py-4 text-xs font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black"
            >
              Checkout
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
