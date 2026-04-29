"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

type PurchaseItem = {
  item_id: string;
  item_name: string;
  item_variant: string;
  price: number;
  quantity: number;
};

export function PurchaseEvent({
  transactionId,
  currency,
  value,
  items
}: {
  transactionId: string;
  currency: string;
  value: number;
  items: PurchaseItem[];
}) {
  useEffect(() => {
    trackEvent("purchase", {
      transaction_id: transactionId,
      currency,
      value,
      items
    });
  }, [currency, items, transactionId, value]);

  return null;
}
