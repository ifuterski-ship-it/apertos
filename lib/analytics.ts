"use client";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

export function hasGaMeasurementId() {
  return Boolean(gaMeasurementId);
}

export function trackEvent(eventName: string, params: Record<string, unknown>) {
  if (!hasGaMeasurementId() || typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, params);
}
