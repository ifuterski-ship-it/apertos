import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin-auth";
import { parseOrderItemsPayload } from "@/lib/orders";
import { products } from "@/lib/products";
import { getStripe } from "@/lib/stripe";
import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ServiceStatus = "ok" | "error" | "unconfigured";

async function stripeStatus() {
  const stripe = getStripe();
  if (!stripe) return { status: "unconfigured" as ServiceStatus };

  try {
    const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
    const [balance, intents] = await Promise.all([
      stripe.balance.retrieve(),
      stripe.paymentIntents.list({ created: { gte: sevenDaysAgo }, limit: 100 })
    ]);

    const succeeded = intents.data.filter((pi) => pi.status === "succeeded");
    const failed = intents.data.filter((pi) => pi.status === "requires_payment_method");
    const revenue = succeeded.reduce((sum, pi) => sum + (pi.amount_received ?? 0), 0);
    const available = balance.available.find((b) => b.currency === "gbp")?.amount ?? 0;

    return {
      status: "ok" as ServiceStatus,
      balancePence: available,
      weeklyRevenuePence: revenue,
      weeklyOrderCount: succeeded.length,
      failedCount: failed.length
    };
  } catch {
    return { status: "error" as ServiceStatus };
  }
}

async function resendStatus() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { status: "unconfigured" as ServiceStatus };

  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(5000)
    });
    const ok = res.status === 200 || res.status === 403;
    return { status: ok ? ("ok" as ServiceStatus) : ("error" as ServiceStatus) };
  } catch {
    return { status: "error" as ServiceStatus };
  }
}

async function vercelStatus() {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) return { status: "unconfigured" as ServiceStatus, latestDeployment: null, debug: null };

  const teamId = process.env.VERCEL_TEAM_ID ?? null;

  try {
    const params = new URLSearchParams({ projectId, limit: "1", target: "production" });
    if (teamId) params.set("teamId", teamId);

    const res = await fetch(
      `https://api.vercel.com/v6/deployments?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000)
      }
    );
    const data = (await res.json()) as {
      deployments?: Array<{ state: string; url: string; createdAt: number }>;
      error?: { code: string; message: string };
    };

    if (!res.ok) {
      return {
        status: "error" as ServiceStatus,
        latestDeployment: null,
        debug: `HTTP ${res.status}: ${data.error?.message ?? "unknown error"}`
      };
    }

    const latest = data.deployments?.[0] ?? null;

    return {
      status: (latest?.state === "READY" ? "ok" : latest?.state === "ERROR" ? "error" : "ok") as ServiceStatus,
      latestDeployment: latest
        ? { state: latest.state, url: latest.url, createdAt: latest.createdAt }
        : null,
      debug: latest ? null : "No production deployments found"
    };
  } catch (err) {
    return { status: "error" as ServiceStatus, latestDeployment: null, debug: String(err) };
  }
}

async function shipengineStatus() {
  const key = process.env.SHIPENGINE_API_KEY;
  if (!key) return { status: "unconfigured" as ServiceStatus };

  try {
    const res = await fetch("https://api.shipengine.com/v1/carriers", {
      headers: { "API-Key": key },
      signal: AbortSignal.timeout(5000)
    });
    return { status: res.ok ? ("ok" as ServiceStatus) : ("error" as ServiceStatus) };
  } catch {
    return { status: "error" as ServiceStatus };
  }
}

async function supabaseStatus() {
  if (!hasSupabaseAdminEnv) return { status: "unconfigured" as ServiceStatus };

  try {
    const supabase = createAdminClient();

    const [ordersResult, reviewsResult] = await Promise.all([
      supabase.from("orders").select("items, payment_status"),
      supabase.from("reviews").select("id").eq("approved", false)
    ]);

    if (ordersResult.error) return { status: "error" as ServiceStatus };

    const allOrders = ordersResult.data ?? [];

    const ordersNeedingLabel = allOrders.filter((order) => {
      if (order.payment_status !== "paid") return false;
      const payload = parseOrderItemsPayload(order.items as string);
      if (payload.shippingLabel) return false;
      const isPodOnly =
        payload.items.length > 0 &&
        payload.items.every((item) => {
          const product = products.find((p) => p.id === item.productId);
          return product?.category === "Outerwear";
        });
      return !isPodOnly;
    }).length;

    return {
      status: "ok" as ServiceStatus,
      totalOrders: allOrders.length,
      ordersNeedingLabel,
      pendingReviews: (reviewsResult.data ?? []).length
    };
  } catch {
    return { status: "error" as ServiceStatus };
  }
}

export async function GET() {
  if (!hasSupabaseEnv) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const [stripe, resend, vercel, shipengine, db] = await Promise.all([
    stripeStatus(),
    resendStatus(),
    vercelStatus(),
    shipengineStatus(),
    supabaseStatus()
  ]);

  return NextResponse.json({ ok: true, stripe, resend, vercel, shipengine, supabase: db });
}
