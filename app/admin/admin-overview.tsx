"use client";

import { useEffect, useState } from "react";

type ServiceStatus = "ok" | "error" | "unconfigured";

type OverviewData = {
  ok: boolean;
  stripe?: {
    status: ServiceStatus;
    balancePence?: number;
    weeklyRevenuePence?: number;
    weeklyOrderCount?: number;
    failedCount?: number;
  };
  resend?: { status: ServiceStatus };
  vercel?: {
    status: ServiceStatus;
    latestDeployment?: { state: string; url: string; createdAt: number } | null;
    debug?: string | null;
  };
  shipengine?: { status: ServiceStatus };
  supabase?: {
    status: ServiceStatus;
    totalOrders?: number;
    ordersNeedingLabel?: number;
    pendingReviews?: number;
  };
};

function formatGBP(pence: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
}

function StatusDot({ status }: { status: ServiceStatus }) {
  const colour =
    status === "ok"
      ? "bg-emerald-500"
      : status === "error"
        ? "bg-red-500"
        : "bg-neutral-600";
  return <span className={`inline-block h-2 w-2 rounded-full ${colour}`} />;
}

function StatusLabel({ status }: { status: ServiceStatus }) {
  if (status === "ok") return <span className="text-emerald-400">Operational</span>;
  if (status === "error") return <span className="text-red-400">Error</span>;
  return <span className="text-neutral-500">Not Configured</span>;
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
      <p className="text-xs uppercase tracking-[0.35em] text-muted">{label}</p>
      {children}
    </div>
  );
}

export function AdminOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const load = () => {
    setIsLoading(true);
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then((d: OverviewData) => {
        setData(d);
        setLastRefreshed(new Date());
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-muted">System</p>
          <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em]">Overview</h2>
          <p className="mt-2 text-sm uppercase leading-7 tracking-[0.2em] text-neutral-400">
            Live status of all connected services.
          </p>
        </div>
        <button
          onClick={load}
          disabled={isLoading}
          className="border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition hover:border-white hover:bg-white hover:text-black disabled:opacity-40"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {lastRefreshed && (
        <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-neutral-600">
          Last refreshed {lastRefreshed.toLocaleTimeString("en-GB")}
        </p>
      )}

      {isLoading && !data ? (
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-muted">Loading...</p>
      ) : !data?.ok ? (
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-red-400">Failed to load overview.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Stripe */}
          {data.stripe && (
            <Card label="Stripe">
              <div className="flex items-center gap-2">
                <StatusDot status={data.stripe.status} />
                <StatusLabel status={data.stripe.status} />
              </div>
              {data.stripe.status === "ok" && (
                <div className="space-y-1.5 text-xs uppercase leading-6 tracking-[0.18em] text-neutral-300">
                  {data.stripe.balancePence !== undefined && (
                    <p>Balance: {formatGBP(data.stripe.balancePence)}</p>
                  )}
                  {data.stripe.weeklyRevenuePence !== undefined && (
                    <p>7-day revenue: {formatGBP(data.stripe.weeklyRevenuePence)}</p>
                  )}
                  {data.stripe.weeklyOrderCount !== undefined && (
                    <p>7-day orders: {data.stripe.weeklyOrderCount}</p>
                  )}
                  {data.stripe.failedCount !== undefined && data.stripe.failedCount > 0 && (
                    <p className="text-red-400">Failed payments: {data.stripe.failedCount}</p>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Supabase */}
          {data.supabase && (
            <Card label="Supabase">
              <div className="flex items-center gap-2">
                <StatusDot status={data.supabase.status} />
                <StatusLabel status={data.supabase.status} />
              </div>
              {data.supabase.status === "ok" && (
                <div className="space-y-1.5 text-xs uppercase leading-6 tracking-[0.18em] text-neutral-300">
                  {data.supabase.totalOrders !== undefined && (
                    <p>Total orders: {data.supabase.totalOrders}</p>
                  )}
                  {data.supabase.ordersNeedingLabel !== undefined && data.supabase.ordersNeedingLabel > 0 ? (
                    <p className="text-amber-400">Awaiting label: {data.supabase.ordersNeedingLabel}</p>
                  ) : (
                    <p>Awaiting label: 0</p>
                  )}
                  {data.supabase.pendingReviews !== undefined && data.supabase.pendingReviews > 0 ? (
                    <p className="text-amber-400">Pending reviews: {data.supabase.pendingReviews}</p>
                  ) : (
                    <p>Pending reviews: 0</p>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Resend */}
          {data.resend && (
            <Card label="Resend">
              <div className="flex items-center gap-2">
                <StatusDot status={data.resend.status} />
                <StatusLabel status={data.resend.status} />
              </div>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Transactional email</p>
            </Card>
          )}

          {/* ShipEngine */}
          {data.shipengine && (
            <Card label="ShipEngine">
              <div className="flex items-center gap-2">
                <StatusDot status={data.shipengine.status} />
                <StatusLabel status={data.shipengine.status} />
              </div>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Shipping labels</p>
            </Card>
          )}

          {/* Vercel */}
          {data.vercel && (
            <Card label="Vercel">
              <div className="flex items-center gap-2">
                <StatusDot status={data.vercel.status} />
                <StatusLabel status={data.vercel.status} />
              </div>
              {data.vercel.latestDeployment ? (
                <div className="space-y-1.5 text-xs uppercase leading-6 tracking-[0.18em] text-neutral-300">
                  <p>
                    State:{" "}
                    <span className={data.vercel.latestDeployment.state === "READY" ? "text-emerald-400" : data.vercel.latestDeployment.state === "ERROR" ? "text-red-400" : "text-amber-400"}>
                      {data.vercel.latestDeployment.state}
                    </span>
                  </p>
                  <p>
                    Deployed:{" "}
                    {new Date(data.vercel.latestDeployment.createdAt).toLocaleString("en-GB")}
                  </p>
                  <a
                    href={`https://${data.vercel.latestDeployment.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-neutral-400 underline underline-offset-2 hover:text-white"
                  >
                    {data.vercel.latestDeployment.url}
                  </a>
                </div>
              ) : data.vercel.status === "unconfigured" ? (
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Add VERCEL_TOKEN + VERCEL_PROJECT_ID env vars to enable.
                </p>
              ) : null}
              {data.vercel.debug ? (
                <p className="text-[10px] leading-5 tracking-[0.1em] text-red-400/70">{data.vercel.debug}</p>
              ) : null}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
