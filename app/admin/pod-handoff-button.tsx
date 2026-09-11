"use client";

import { useState } from "react";

type PodHandoff = {
  externalOrderId: string;
  submittedAt: string;
  externalOrderUrl: string | null;
};

type PodHandoffButtonProps = {
  sessionId: string;
  hasShippingAddress: boolean;
  configured: boolean;
  handoff: PodHandoff | null;
};

export function PodHandoffButton({
  sessionId,
  hasShippingAddress,
  configured,
  handoff
}: PodHandoffButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (handoff) {
    return (
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
          Submitted to Wix as order {handoff.externalOrderId}
        </p>
        <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
          {new Date(handoff.submittedAt).toLocaleString("en-GB")}
        </p>
        {handoff.externalOrderUrl ? (
          <a
            href={handoff.externalOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex border border-white/20 px-3 py-2 text-[11px] uppercase tracking-[0.2em] transition hover:border-white hover:bg-white hover:text-black"
          >
            Open In Wix
          </a>
        ) : null}
      </div>
    );
  }

  const handleSubmit = async () => {
    setMessage(null);

    if (!hasShippingAddress) {
      setMessage("This order is missing a shipping address from checkout.");
      return;
    }

    if (!configured) {
      setMessage(
        "Wix is not configured. Set WIX_API_KEY, WIX_SITE_ID, and WIX_STORE_PRODUCT_MAP first."
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/orders/${sessionId}/wix-store`, {
        method: "POST"
      });

      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
        orderId?: string;
        orderUrl?: string;
      };

      if (!response.ok || !result.ok || !result.orderId) {
        setMessage(result.message ?? "Unable to submit to Wix right now.");
        return;
      }

      setMessage(`Submitted to Wix as order ${result.orderId}. Tapstitch will fulfill it.`);
    } catch {
      setMessage("Unable to reach Wix right now.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {!configured ? (
        <p className="text-[10px] uppercase leading-5 tracking-[0.18em] text-neutral-500">
          Set WIX_API_KEY, WIX_SITE_ID, and WIX_STORE_PRODUCT_MAP (or use the Tapstitch email below) to
          submit POD orders to your Wix store.
        </p>
      ) : null}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        className="border border-white px-4 py-3 text-xs uppercase tracking-[0.3em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Submitting To Wix..." : "Submit To Wix"}
      </button>
      {message ? <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-300">{message}</p> : null}
    </div>
  );
}