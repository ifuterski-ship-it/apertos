import { getAllowedShippingCountries } from "@/lib/shipengine";
import { CheckoutForm } from "./checkout-form";

export default function CheckoutPage() {
  const allowedCountries = getAllowedShippingCountries();

  return (
    <div className="space-y-8 pb-8">
      <div className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Checkout</p>
        <h1 className="font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">Complete Order</h1>
        <p className="mx-auto max-w-2xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
          Enter your shipping details to see live rates, then proceed to secure payment.
        </p>
      </div>
      <CheckoutForm allowedCountries={allowedCountries} />
    </div>
  );
}
