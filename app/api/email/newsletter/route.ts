import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email";
import { newsFromEmail, newsletterNotifyEmail } from "@/lib/email-config";
import { renderNewsletterInternalEmail, renderNewsletterWelcomeEmail } from "@/lib/email-templates";
import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import { absoluteUrl } from "@/lib/site";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };

  if (!email) {
    return NextResponse.json({ ok: false, message: "Email is required." }, { status: 400 });
  }

  if (!emailPattern.test(email)) {
    return NextResponse.json({ ok: false, message: "Please enter a valid email address." }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const token = randomBytes(24).toString("hex");
  const verifyUrl = absoluteUrl(`/newsletter/verify?token=${token}`);

  if (hasSupabaseAdminEnv) {
    try {
      const supabase = createAdminClient();
      await supabase.from("newsletter_subscribers").upsert(
        {
          email: normalizedEmail,
          verified: false,
          token,
          verified_at: null
        },
        { onConflict: "email" }
      );
    } catch {
      // Fall through to sending the email anyway; verification link depends on DB though.
    }
  }

  const [subscriberResult, internalResult] = await Promise.all([
    sendEmail({
      to: email,
      from: newsFromEmail,
      subject: "Confirm your APERTOS subscription",
      html: renderNewsletterWelcomeEmail(email, verifyUrl)
    }),
    sendEmail({
      to: newsletterNotifyEmail,
      from: newsFromEmail,
      subject: "New APERTOS News Signup",
      html: renderNewsletterInternalEmail(email)
    })
  ]);

  if (!subscriberResult.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: "Could not send your email. Please check the address and try again."
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    notifiedTeam: internalResult.ok,
    verificationSent: true
  });
}
