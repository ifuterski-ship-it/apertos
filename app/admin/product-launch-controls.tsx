"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";

export function ProductLaunchControls({
  products,
  flags
}: {
  products: Product[];
  flags: Record<string, boolean>;
}) {
  const [localFlags, setLocalFlags] = useState<Record<string, boolean>>(flags);
  const [loading, setLoading] = useState<string | null>(null);

  const toggle = async (productId: string, currentComingSoon: boolean) => {
    setLoading(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comingSoon: !currentComingSoon })
      });
      if (res.ok) {
        setLocalFlags((prev) => ({ ...prev, [productId]: !currentComingSoon }));
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {products.map((product) => {
        const comingSoon = localFlags[product.id] ?? product.isComingSoon ?? false;
        const isLoading = loading === product.id;

        return (
          <div
            key={product.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-[1rem] border border-white/10 bg-black/20 px-5 py-4"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-neutral-100">{product.name}</p>
              <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-neutral-500">
                {product.priceLabel} · {product.category}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`text-xs uppercase tracking-[0.22em] ${
                  comingSoon ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {comingSoon ? "Coming Soon" : "Live"}
              </span>
              <button
                onClick={() => toggle(product.id, comingSoon)}
                disabled={isLoading}
                className={`border px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition disabled:opacity-40 ${
                  comingSoon
                    ? "border-emerald-500/40 text-emerald-400 hover:border-emerald-500 hover:bg-emerald-500 hover:text-black"
                    : "border-amber-500/40 text-amber-400 hover:border-amber-500 hover:bg-amber-500 hover:text-black"
                }`}
              >
                {isLoading ? "Saving..." : comingSoon ? "Launch" : "Hide"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
