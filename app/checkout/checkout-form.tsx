"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { useCart } from "@/components/cart/cart-provider";
import type { ShipEngineRate } from "@/lib/shipengine";

type Address = {
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

function getCountryName(code: string) {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

const inputClass =
  "w-full border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white";
const labelClass = "text-xs uppercase tracking-[0.3em] text-neutral-400";

export function CheckoutForm({ allowedCountries }: { allowedCountries: string[] }) {
  const router = useRouter();
  const { items, subtotal, isHydrated } = useCart();
  const supabase = useMemo(() => (hasSupabaseEnv ? createClient() : null), []);

  const [address, setAddress] = useState<Address>({
    name: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: allowedCountries[0] ?? "GB"
  });

  const [rates, setRates] = useState<ShipEngineRate[] | null>(null);
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setAddress((prev) => ({ ...prev, email: prev.email || data.user!.email! }));
      }
    });
  }, [supabase]);

  useEffect(() => {
    if (isHydrated && items.length === 0) {
      router.replace("/cart");
    }
  }, [isHydrated, items.length, router]);

  const addressComplete = Boolean(
    address.name && address.email && address.address1 && address.city && address.postalCode && address.country
  );

  const selectedRate = rates?.find((r) => r.rateId === selectedRateId) ?? null;
  const totalWithShipping = subtotal + (selectedRate ? selectedRate.amountPence / 100 : 0);

  const setField =
    (field: keyof Address) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setAddress((prev) => ({ ...prev, [field]: e.target.value }));
      setRates(null);
      setSelectedRateId(null);
      setRatesError(null);
    };

  const handleGetRates = async () => {
    if (!addressComplete) return;
    setIsFetchingRates(true);
    setRates(null);
    setSelectedRateId(null);
    setRatesError(null);

    try {
      const res = await fetch("/api/shipengine/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          address: {
            name: address.name,
            address1: address.address1,
            address2: address.address2 || null,
            city: address.city,
            state: address.state || null,
            postalCode: address.postalCode,
            country: address.country,
            phone: address.phone || null
          },
          subtotalPence: Math.round(subtotal * 100)
        })
      });

      const data = (await res.json()) as {
        ok: boolean;
        rates?: ShipEngineRate[];
        message?: string;
      };

      if (!data.ok || !data.rates) {
        setRatesError(data.message ?? "Unable to fetch shipping rates.");
        return;
      }

      setRates(data.rates);
      if (data.rates.length > 0) setSelectedRateId(data.rates[0].rateId);
    } catch {
      setRatesError("Unable to connect to shipping service. Please try again.");
    } finally {
      setIsFetchingRates(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedRate) return;
    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: address.email,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size
          })),
          shipping: {
            rateId: selectedRate.rateId,
            displayName: selectedRate.displayName,
            amountPence: selectedRate.amountPence,
            address: {
              name: address.name,
              email: address.email,
              phone: address.phone || null,
              address1: address.address1,
              address2: address.address2 || null,
              city: address.city,
              state: address.state || null,
              postalCode: address.postalCode,
              country: address.country
            }
          }
        })
      });

      const result = (await res.json()) as { ok?: boolean; message?: string; url?: string };

      if (!result.ok || !result.url) {
        setCheckoutError(result.message ?? "Unable to start checkout.");
        return;
      }

      window.location.href = result.url;
    } catch {
      setCheckoutError("Unable to connect. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isHydrated) {
    return <div className="py-24 text-sm uppercase tracking-[0.3em] text-muted">Loading...</div>;
  }

  return (
    <div className="grid gap-10 pb-24 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-8">
        {/* Step 1: Address */}
        <section className="space-y-5 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.45em] text-muted">Step 1</p>
            <h2 className="font-display text-2xl uppercase tracking-[0.08em]">Shipping Address</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className={labelClass}>Full Name</label>
              <input type="text" required value={address.name} onChange={setField("name")} className={inputClass} />
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Email</label>
              <input type="email" required value={address.email} onChange={setField("email")} className={inputClass} />
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Phone (Optional)</label>
              <input type="tel" value={address.phone} onChange={setField("phone")} className={inputClass} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className={labelClass}>Address Line 1</label>
              <input type="text" required value={address.address1} onChange={setField("address1")} className={inputClass} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className={labelClass}>Address Line 2 (Optional)</label>
              <input type="text" value={address.address2} onChange={setField("address2")} className={inputClass} />
            </div>

            <div className="space-y-2">
              <label className={labelClass}>City</label>
              <input type="text" required value={address.city} onChange={setField("city")} className={inputClass} />
            </div>

            <div className="space-y-2">
              <label className={labelClass}>County / State (Optional)</label>
              <input type="text" value={address.state} onChange={setField("state")} className={inputClass} />
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Postcode / ZIP</label>
              <input type="text" required value={address.postalCode} onChange={setField("postalCode")} className={inputClass} />
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Country</label>
              <select value={address.country} onChange={setField("country")} className={inputClass}>
                {allowedCountries.map((code) => (
                  <option key={code} value={code}>
                    {getCountryName(code)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGetRates}
            disabled={!addressComplete || isFetchingRates}
            className="w-full border border-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetchingRates ? "Fetching Rates..." : "Get Shipping Rates"}
          </button>

          {ratesError ? (
            <p className="text-sm uppercase tracking-[0.18em] text-red-300">{ratesError}</p>
          ) : null}
        </section>

        {/* Step 2: Rate selection */}
        {rates && rates.length > 0 ? (
          <section className="space-y-5 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.45em] text-muted">Step 2</p>
              <h2 className="font-display text-2xl uppercase tracking-[0.08em]">Shipping Rate</h2>
            </div>

            <div className="space-y-3">
              {rates.map((rate) => (
                <label
                  key={rate.rateId}
                  className={`flex cursor-pointer items-center justify-between gap-4 border p-4 transition ${
                    selectedRateId === rate.rateId
                      ? "border-white bg-white/5"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping-rate"
                      value={rate.rateId}
                      checked={selectedRateId === rate.rateId}
                      onChange={() => setSelectedRateId(rate.rateId)}
                      className="accent-white"
                    />
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em]">{rate.displayName}</p>
                      {rate.estimatedDays ? (
                        <p className="text-xs tracking-[0.15em] text-neutral-400">
                          Est. {rate.estimatedDays} business day{rate.estimatedDays !== 1 ? "s" : ""}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold uppercase tracking-[0.2em]">
                    {rate.amountPence === 0 ? "Free" : `£${(rate.amountPence / 100).toFixed(2)}`}
                  </span>
                </label>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {/* Order summary */}
      <aside className="h-fit space-y-6 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-muted">Summary</p>
          <h2 className="mt-3 font-display text-3xl uppercase tracking-[0.08em]">Order Total</h2>
        </div>

        <div className="space-y-3 border-y border-white/10 py-5 text-sm uppercase tracking-[0.2em]">
          <div className="flex items-center justify-between text-neutral-300">
            <span>Subtotal</span>
            <span>£{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-neutral-300">
            <span>Shipping</span>
            <span>
              {selectedRate
                ? selectedRate.amountPence === 0
                  ? "Free"
                  : `£${(selectedRate.amountPence / 100).toFixed(2)}`
                : "—"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Total</span>
          <span>£{totalWithShipping.toFixed(2)}</span>
        </div>

        {checkoutError ? (
          <p className="text-xs uppercase leading-6 tracking-[0.2em] text-red-300">{checkoutError}</p>
        ) : null}

        <button
          type="button"
          onClick={handleCheckout}
          disabled={!selectedRate || isCheckingOut}
          className="w-full border border-white px-5 py-4 text-xs font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCheckingOut ? "Starting Payment..." : "Proceed to Payment"}
        </button>
      </aside>
    </div>
  );
}
