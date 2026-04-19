import Link from "next/link";
import { GenerateLabelButton } from "@/app/admin/generate-label-button";
import { hasAdminEmailsConfigured, requireAdminUser } from "@/lib/admin-auth";
import { getOrdersForAdmin } from "@/lib/orders";
import { hasShippoEnv, hasShippoSenderEnv } from "@/lib/shippo";
import { hasSupabaseAdminEnv } from "@/lib/supabase/admin";

function formatMoney(amount: number | null, currency: string | null) {
  if (typeof amount !== "number") {
    return "Unavailable";
  }

  const normalizedCurrency = (currency ?? "GBP").toUpperCase();

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: normalizedCurrency
  }).format(amount / 100);
}

export default async function AdminPage() {
  await requireAdminUser();

  if (!hasAdminEmailsConfigured()) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Admin</p>
        <h1 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">Admin Not Configured</h1>
        <p className="mt-4 max-w-2xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
          Add an `ADMIN_EMAILS` environment variable with the email addresses that should access the admin panel.
        </p>
      </div>
    );
  }

  if (!hasSupabaseAdminEnv) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Admin</p>
        <h1 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">Supabase Admin Needed</h1>
        <p className="mt-4 max-w-2xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
          Add `SUPABASE_SERVICE_ROLE_KEY` so the server can list and update all orders securely.
        </p>
      </div>
    );
  }

  let orders = [] as Awaited<ReturnType<typeof getOrdersForAdmin>>;
  let ordersError: string | null = null;

  try {
    orders = await getOrdersForAdmin();
  } catch (error) {
    ordersError = error instanceof Error ? error.message : "Unable to load orders right now.";
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Admin</p>
        <h1 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">Orders</h1>
        <p className="mt-4 max-w-3xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
          Review paid orders, open existing labels, and generate a Shippo label from the cheapest available rate.
        </p>
        {(!hasShippoEnv || !hasShippoSenderEnv) ? (
          <p className="mt-6 text-xs uppercase leading-6 tracking-[0.25em] text-neutral-400">
            Shippo is not fully configured yet. Add `SHIPPO_API_KEY` and the `SHIPPO_FROM_*` sender address variables
            to enable label purchases.
          </p>
        ) : null}
      </div>

      {ordersError ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-xs uppercase tracking-[0.45em] text-muted">Orders</p>
          <h2 className="mt-4 font-display text-3xl uppercase tracking-[0.08em]">Unable To Load Orders</h2>
          <p className="mt-4 max-w-3xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
            {ordersError}
          </p>
          <p className="mt-4 max-w-3xl text-xs uppercase leading-6 tracking-[0.22em] text-neutral-400">
            Check that `SUPABASE_SERVICE_ROLE_KEY` is set on Vercel and that the `orders` table exists with the
            columns used by the Stripe webhook.
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-300">No orders have been recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const payload = order.parsedItemsPayload;
            const shippingAddress = payload.shippingAddress;
            const shippingLabel = payload.shippingLabel;

            return (
              <div
                key={order.stripeCheckoutSessionId}
                className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 lg:grid-cols-[1.25fr_0.75fr]"
              >
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString("en-GB") : "Order"}
                    </p>
                    <h2 className="font-display text-3xl uppercase tracking-[0.08em]">
                      {formatMoney(order.amountTotal, order.currency)}
                    </h2>
                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-300">
                      Session {order.stripeCheckoutSessionId}
                    </p>
                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-300">
                      {order.email ?? "No email captured"} / {order.paymentStatus ?? "Unknown status"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.35em] text-muted">Items</p>
                    <div className="space-y-2 text-sm uppercase tracking-[0.18em] text-neutral-200">
                      {payload.items.map((item) => (
                        <div key={`${item.productId}-${item.size}`} className="flex justify-between gap-4">
                          <span>
                            {item.name} / {item.size} / Qty {item.quantity}
                          </span>
                          <span>{new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-5 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.35em] text-muted">Ship To</p>
                    {shippingAddress?.address1 ? (
                      <div className="space-y-1 text-xs uppercase leading-6 tracking-[0.18em] text-neutral-300">
                        <p>{shippingAddress.name ?? "Customer"}</p>
                        <p>{shippingAddress.address1}</p>
                        {shippingAddress.address2 ? <p>{shippingAddress.address2}</p> : null}
                        <p>
                          {shippingAddress.city}
                          {shippingAddress.state ? `, ${shippingAddress.state}` : ""} {shippingAddress.postalCode}
                        </p>
                        <p>{shippingAddress.country}</p>
                        {shippingAddress.phone ? <p>{shippingAddress.phone}</p> : null}
                      </div>
                    ) : (
                      <p className="text-xs uppercase leading-6 tracking-[0.18em] text-neutral-400">
                        This order was recorded before shipping address capture was added.
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.35em] text-muted">Shipping Label</p>
                    {shippingLabel ? (
                      <div className="space-y-2 text-xs uppercase leading-6 tracking-[0.18em] text-neutral-300">
                        <p>{shippingLabel.provider ?? "Carrier"} / {shippingLabel.serviceLevel ?? "Service"}</p>
                        <p>
                          {shippingLabel.rateAmount && shippingLabel.rateCurrency
                            ? new Intl.NumberFormat("en-GB", {
                                style: "currency",
                                currency: shippingLabel.rateCurrency
                              }).format(Number.parseFloat(shippingLabel.rateAmount))
                            : "Rate unavailable"}
                        </p>
                        {shippingLabel.trackingNumber ? <p>Tracking {shippingLabel.trackingNumber}</p> : null}
                        <Link
                          href={shippingLabel.labelUrl}
                          target="_blank"
                          className="inline-flex border border-white/10 px-3 py-2 text-[11px] uppercase tracking-[0.25em] transition hover:border-white hover:bg-white hover:text-black"
                        >
                          Open Current Label
                        </Link>
                      </div>
                    ) : (
                      <p className="text-xs uppercase leading-6 tracking-[0.18em] text-neutral-400">
                        No label has been purchased for this order yet.
                      </p>
                    )}
                  </div>

                  <GenerateLabelButton
                    sessionId={order.stripeCheckoutSessionId}
                    hasShippingAddress={Boolean(shippingAddress?.address1)}
                    existingLabelUrl={shippingLabel?.labelUrl ?? null}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
