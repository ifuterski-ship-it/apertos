import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { newsFromEmail } from "@/lib/email-config";
import { renderNewsletterDiscountEmail } from "@/lib/email-templates";
import { welcomeDiscountCode } from "@/lib/newsletter";

export const metadata: Metadata = {
  title: "Subscription Confirmed | Apertos Fightwear",
  robots: { index: false, follow: false }
};

export default async function NewsletterVerifyPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let status: "success" | "invalid" = "invalid";

  if (token && hasSupabaseAdminEnv) {
    const supabase = createAdminClient();
    const { data: subscriber, error } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, verified")
      .eq("token", token)
      .single();

    if (!error && subscriber) {
      if (!subscriber.verified) {
        await supabase
          .from("newsletter_subscribers")
          .update({ verified: true, verified_at: new Date().toISOString() })
          .eq("id", subscriber.id);

        await sendEmail({
          to: subscriber.email,
          from: newsFromEmail,
          subject: "Your APERTOS 10% Off Code",
          html: renderNewsletterDiscountEmail(welcomeDiscountCode)
        });
      }
      status = "success";
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center py-24 text-center">
      {status === "success" ? (
        <>
          <p className="text-[10px] uppercase tracking-[0.55em] text-crimson">Confirmed</p>
          <h1 className="mt-4 font-display text-5xl uppercase tracking-[0.08em]">
            You&apos;re On The List
          </h1>
          <p className="mt-6 text-sm uppercase leading-7 tracking-[0.18em] text-neutral-400">
            Your 10% discount code has been sent to your inbox. Use it at checkout for your first order.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center bg-crimson px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-crimson/85"
          >
            Start Shopping
          </Link>
        </>
      ) : (
        <>
          <p className="text-[10px] uppercase tracking-[0.55em] text-crimson">Error</p>
          <h1 className="mt-4 font-display text-5xl uppercase tracking-[0.08em]">
            Invalid Link
          </h1>
          <p className="mt-6 text-sm uppercase leading-7 tracking-[0.18em] text-neutral-400">
            This verification link is invalid or has already been used.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center border border-crimson px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-crimson/10"
          >
            Back Home
          </Link>
        </>
      )}
    </div>
  );
}
