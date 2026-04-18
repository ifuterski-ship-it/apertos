import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY ?? "";
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

export async function sendEmail(input: SendEmailInput) {
  if (!resend) {
    return {
      ok: false,
      provider: "resend",
      message: "Resend is not configured. Add RESEND_API_KEY to enable email sending."
    };
  }

  const result = await resend.emails.send({
    from: input.from ?? "APERTOS <onboarding@resend.dev>",
    to: input.to,
    subject: input.subject,
    html: input.html
  });

  return {
    ok: !result.error,
    provider: "resend",
    result
  };
}
