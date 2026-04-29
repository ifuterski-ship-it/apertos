import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { newsFromEmail, newsletterNotifyEmail } from "@/lib/email-config";
import { renderNewsletterInternalEmail, renderNewsletterWelcomeEmail } from "@/lib/email-templates";

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };

  if (!email) {
    return NextResponse.json({ ok: false, message: "Email is required." }, { status: 400 });
  }

  const [subscriberResult, internalResult] = await Promise.all([
    sendEmail({
      to: email,
      from: newsFromEmail,
      subject: "Welcome To APERTOS News",
      html: renderNewsletterWelcomeEmail(email)
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
        message: "Resend is not ready for APERTOS news yet."
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    notifiedTeam: internalResult.ok
  });
}
