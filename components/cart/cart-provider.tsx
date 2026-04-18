"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Product } from "@/lib/products";

export type CartItem = {
  id: string;
  productId: Product["id"];
  name: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, size: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  isHydrated: boolean;
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

  const value = useMemo<CartContextValue>(() => {
    const addItem = (product: Product, size: string) => {
      const cartId = `${product.id}-${size}`;

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
            size
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
