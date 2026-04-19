"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type WishlistContextValue = {
  productIds: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
  totalItems: number;
  isHydrated: boolean;
};

const STORAGE_KEY = "apertos-wishlist";
const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedWishlist = window.localStorage.getItem(STORAGE_KEY);
    if (storedWishlist) {
      try {
        const parsed = JSON.parse(storedWishlist) as unknown;
        if (Array.isArray(parsed)) {
          setProductIds(parsed.filter((value): value is string => typeof value === "string"));
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds));
    }
  }, [isHydrated, productIds]);

  const value = useMemo<WishlistContextValue>(() => {
    const has = (productId: string) => productIds.includes(productId);
    const toggle = (productId: string) => {
      setProductIds((current) =>
        current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
      );
    };
    const clear = () => setProductIds([]);

    return {
      productIds,
      toggle,
      has,
      clear,
      totalItems: productIds.length,
      isHydrated
    };
  }, [isHydrated, productIds]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
