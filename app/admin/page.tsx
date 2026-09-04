import Link from "next/link";
import { AdminOverview } from "@/app/admin/admin-overview";
import { DeleteOrderButton } from "@/app/admin/delete-order-button";
import { GenerateLabelButton } from "@/app/admin/generate-label-button";
import { ProductLaunchControls } from "@/app/admin/product-launch-controls";
import { ReviewModeration } from "@/app/admin/review-moderation";
import { hasAdminEmailsConfigured, requireAdminUser } from "@/lib/admin-auth";
import { getOrdersForAdmin } from "@/lib/orders";
import { getProductFlags } from "@/lib/product-flags";
import { products } from "@/lib/products";
import { getPendingReviews } from "@/lib/reviews";
import { hasShipEngineEnv } from "@/lib/shipengine";
import { hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import { getSupabaseEnvDiagnostics } from "@/lib/supabase/env-diagnostics";

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
  const diagnostics = getSupabaseEnvDiagnostics();
  const [pendingReviews, productFlags] = await Promise.all([
    getPendingReviews().catch(() => []),
    getProductFlags()
  ]);
  const flagsRecord = Object.fromEntries(productFlags);

  try {
    orders = await getOrdersForAdmin();
  } catch (error) {
    ordersError = error instanceof Error ? error.message : "Unable to load orders right now.";
  }

  return (
    <div className="space-y-8 pb-24">
      <AdminOverview />

      {/* Product visibility */}
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Products</p>
        <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em]">Visibility</h2>
        <p className="mt-2 text-sm uppercase leading-7 tracking-[0.2em] text-neutral-400">
          Launch or hide products. Coming Soon products are visible in the shop but cannot be purchased.
        </p>
        <div className="mt-6">
          <ProductLaunchControls products={products} flags={flagsRecord} />
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Admin</p>
        <h1 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">Orders</h1>
        <p className="mt-4 max-w-3xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
          Review paid orders, open existing labels, and generate a ShipStation label for each order.
        </p>
        {!hasShipEngineEnv() ? (
          <p className="mt-6 text-xs uppercase leading-6 tracking-[0.25em] text-neutral-400">
            ShipEngine is not configured yet. Add `SHIPENGINE_API_KEY` to enable label purchases.
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
          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-muted">Supabase Runtime Diagnostics</p>
            <div className="mt-3 space-y-2 text-xs uppercase leading-6 tracking-[0.18em] text-neutral-300">
              <p>URL Host: {diagnostics.urlHost}</p>
              <p>URL Project Ref: {diagnostics.urlProjectRef ?? "unknown"}</p>
              <p>Anon Key Ref: {diagnostics.anonProjectRef ?? "unknown"}</p>
              <p>Service Key Ref: {diagnostics.serviceProjectRef ?? "unknown"}</p>
              <p>Anon Key (masked): {diagnostics.maskedAnonKey}</p>
              <p>Service Key (masked): {diagnostics.maskedServiceRoleKey}</p>
              <p>All Supabase env vars present: {diagnostics.hasAllValues ? "yes" : "no"}</p>
              <p>All refs match: {diagnostics.refsMatch ? "yes" : "no"}</p>
            </div>
            <p className="mt-4 text-xs uppercase leading-6 tracking-[0.2em] text-neutral-400">
              If refs do not match, Vercel is using values from different Supabase projects. Update
              `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from the
              same project and redeploy.
            </p>
          </div>
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
            const isPodOrder = payload.items.every((item) => {
              const product = products.find((p) => p.id === item.productId);
              return product?.category === "Outerwear";
            });
            const hasPodItems = payload.items.some((item) => {
              const product = products.find((p) => p.id === item.productId);
              return product?.category === "Outerwear";
            });

            return (
              <div
                key={order.stripeCheckoutSessionId}
                className={`grid gap-6 rounded-[2rem] border bg-white/[0.03] p-6 lg:grid-cols-[1.25fr_0.75fr] ${
                  isPodOrder ? "border-amber-500/30" : "border-white/10"
                }`}
              >
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString("en-GB") : "Order"}
                      </p>
                      {isPodOrder ? (
                        <span className="border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-amber-300">
                          POD — Submit to Tapstitch
                        </span>
                      ) : hasPodItems ? (
                        <span className="border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-amber-300">
                          Contains POD item
                        </span>
                      ) : null}
                    </div>
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

                  <DeleteOrderButton sessionId={order.stripeCheckoutSessionId} />
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

                  {isPodOrder ? (
                    <div className="rounded-[1rem] border border-amber-500/20 bg-amber-500/[0.06] px-5 py-4">
                      <p className="text-[11px] uppercase leading-6 tracking-[0.25em] text-amber-200">
                        Submit this order to Tapstitch — no shipping label needed. The print partner handles production &amp; delivery.
                      </p>
                    </div>
                  ) : (
                    <GenerateLabelButton
                      sessionId={order.stripeCheckoutSessionId}
                      hasShippingAddress={Boolean(shippingAddress?.address1)}
                      existingLabelUrl={shippingLabel?.labelUrl ?? null}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reviews moderation */}
      <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-muted">Reviews</p>
          <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em]">
            Pending Approval
            {pendingReviews.length > 0 ? (
              <span className="ml-4 text-2xl text-neutral-400">({pendingReviews.length})</span>
            ) : null}
          </h2>
          <p className="mt-2 text-sm uppercase leading-7 tracking-[0.2em] text-neutral-400">
            These are verified purchase reviews waiting for your approval before going live.
          </p>
        </div>
        <ReviewModeration initialReviews={pendingReviews} />
      </div>
    </div>
  );
}
