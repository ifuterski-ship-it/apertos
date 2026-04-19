"use client";

import { useState } from "react";

type GenerateLabelButtonProps = {
  sessionId: string;
  hasShippingAddress: boolean;
  existingLabelUrl: string | null;
};

export function GenerateLabelButton({
  sessionId,
  hasShippingAddress,
  existingLabelUrl
}: GenerateLabelButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleGenerateLabel = async () => {
    setMessage(null);

    if (existingLabelUrl) {
      window.open(existingLabelUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (!hasShippingAddress) {
      setMessage("This order is missing a shipping address from checkout.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/orders/${sessionId}/label`, {
        method: "POST"
      });

      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
        labelUrl?: string;
      };

      if (!response.ok || !result.ok || !result.labelUrl) {
        setMessage(result.message ?? "Unable to generate a shipping label right now.");
        return;
      }

      window.open(result.labelUrl, "_blank", "noopener,noreferrer");
      setMessage("Label ready. Opening PDF...");
    } catch {
      setMessage("Unable to reach the shipping service right now.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGenerateLabel}
        disabled={isLoading}
        className="border border-white px-4 py-3 text-xs uppercase tracking-[0.3em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {existingLabelUrl ? "Open Label" : isLoading ? "Generating Label" : "Generate Label"}
      </button>
      {message ? <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">{message}</p> : null}
    </div>
  );
}
