"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getProductById, Product } from "@/lib/products";

export type CartItem = {
  id: string;
  productId: Product["id"];
  name: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
  colour?: string;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, size: string, colour?: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  isHydrated: boolean;
};

type RestoreOrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  colour?: string;
};

const STORAGE_KEY = "apertos-cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedCart = window.localStorage.getItem(STORAGE_KEY);

    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart) as CartItem[]);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [isHydrated, items]);

  // Restore a basket from an abandoned-cart recovery email (?restore=<cartId>).
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current || !isHydrated) return;
    const restoreId = new URLSearchParams(window.location.search).get("restore");
    if (!restoreId) return;
    restoredRef.current = true;

    (async () => {
      try {
        const res = await fetch(`/api/cart-recovery/${encodeURIComponent(restoreId)}`);
        if (!res.ok) return;
        const data = (await res.json()) as { ok?: boolean; items?: RestoreOrderItem[] };
        if (!data.ok || !data.items?.length) return;

        const restoredItems: CartItem[] = data.items.map((item) => ({
          id: `${item.productId}-${item.size}${item.colour ? `-${item.colour}` : ""}`,
          productId: item.productId as CartItem["productId"],
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: getProductById(item.productId)?.image ?? "",
          size: item.size,
          ...(item.colour ? { colour: item.colour } : {})
        }));

        setItems(restoredItems);
        window.history.replaceState(null, "", window.location.pathname);
      } catch {
        // Leave the visitor's cart as-is.
      }
    })();
  }, [isHydrated]);

  const value = useMemo<CartContextValue>(() => {
    const addItem = (product: Product, size: string, colour?: string) => {
      const cartId = colour ? `${product.id}-${size}-${colour}` : `${product.id}-${size}`;

      setItems((currentItems) => {
        const existingItem = currentItems.find((item) => item.id === cartId);

        if (existingItem) {
          return currentItems.map((item) =>
            item.id === cartId ? { ...item, quantity: item.quantity + 1 } : item
          );
        }

        return [
          ...currentItems,
          {
            id: cartId,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
            size,
            ...(colour ? { colour } : {})
          }
        ];
      });
    };

    const updateQuantity = (id: string, quantity: number) => {
      setItems((currentItems) =>
        currentItems.flatMap((item) => {
          if (item.id !== id) {
            return [item];
          }

          if (quantity <= 0) {
            return [];
          }

          return [{ ...item, quantity }];
        })
      );
    };

    const removeItem = (id: string) => {
      setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    };

    const clearCart = () => {
      setItems([]);
    };

    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    return {
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      subtotal,
      totalItems,
      isHydrated
    };
  }, [isHydrated, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
