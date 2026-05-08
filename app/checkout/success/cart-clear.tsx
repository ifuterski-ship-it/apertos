"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/cart-provider";

export function CartClear() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
