import { NextResponse } from "next/server";
import { welcomeFromEmail } from "@/lib/email-config";
import { sendEmail } from "@/lib/email";
import { wrapEmailHtml } from "@/lib/email-templates";

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };

  if (!email) {
    return NextResponse.json({ ok: false, message: "Email is required." }, { status: 400 });
  }

  const result = await sendEmail({
    to: email,
    subject: "Welcome to APERTOS",
    from: welcomeFromEmail,
    html: wrapEmailHtml(`
      <h1 style="font-size:32px;text-transform:uppercase;margin:16px 0">Welcome To The Brand</h1>
      <p style="font-size:15px;line-height:1.8;color:#d4d4d4">
        Your account is ready. You can now sign in and step into the world of APERTOS.
      </p>
    `)
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
