import { NextResponse } from "next/server";
import { defaultContactEmail } from "@/lib/email-config";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  const { name, email, message } = (await request.json()) as {
    name?: string;
    email?: string;
    message?: string;
  };

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, message: "All contact fields are required." }, { status: 400 });
  }

  const result = await sendEmail({
    to: defaultContactEmail,
    subject: `APERTOS Contact Form: ${name}`,
    html: `
      <div style="background:#050505;color:#f5f5f5;padding:40px;font-family:Arial,sans-serif">
        <p style="letter-spacing:0.4em;text-transform:uppercase;color:#a3a3a3;font-size:12px">APERTOS CONTACT</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p style="margin-top:20px;line-height:1.8;color:#d4d4d4">${message.replace(/\n/g, "<br />")}</p>
      </div>
    `,
    from: "APERTOS <onboarding@resend.dev>"
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
