import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin-auth";
import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { defaultContactEmail, ordersFromEmail } from "@/lib/email-config";
import { renderCustomerMessageEmail } from "@/lib/email-templates";

export const runtime = "nodejs";

type EmailPayload = {
  to?: string;
  subject?: string;
  message?: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  if (!hasSupabaseEnv) {
    return NextResponse.json({ ok: false, message: "Supabase is not configured." }, { status: 500 });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as EmailPayload;
  const subject = body.subject?.trim() ?? "";
  const message = body.message?.trim() ?? "";
  let to = body.to?.trim() ?? "";

  if (!subject || !message) {
    return NextResponse.json(
      { ok: false, message: "A subject and message are required." },
      { status: 400 }
    );
  }

  if (!to) {
    if (!hasSupabaseAdminEnv) {
      return NextResponse.json({ ok: false, message: "Admin client not configured." }, { status: 500 });
    }

    const { sessionId } = await params;
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("orders")
      .select("email")
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    to = typeof data?.email === "string" ? data.email.trim() : "";
  }

  if (!to) {
    return NextResponse.json(
      { ok: false, message: "Add a recipient email address." },
      { status: 400 }
    );
  }

  const result = await sendEmail({
    to,
    subject,
    html: renderCustomerMessageEmail({ message }),
    from: ordersFromEmail,
    replyTo: defaultContactEmail
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "message" in result && typeof result.message === "string"
            ? result.message
            : "Resend rejected the email. Check the API key and verified domain."
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
