import { NextResponse } from "next/server";
import { defaultContactEmail, supportFromEmail } from "@/lib/email-config";
import { sendEmail } from "@/lib/email";
import { wrapEmailHtml } from "@/lib/email-templates";

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
    from: supportFromEmail,
    html: wrapEmailHtml(
      `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p style="margin-top:20px;line-height:1.8;color:#d4d4d4">${message.replace(/\n/g, "<br />")}</p>
      `,
      "APERTOS CONTACT"
    )
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
