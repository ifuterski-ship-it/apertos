import { NextResponse } from "next/server";
import { defaultContactEmail, supportFromEmail } from "@/lib/email-config";
import { sendEmail } from "@/lib/email";
import { wrapEmailHtml } from "@/lib/email-templates";

export const runtime = "nodejs";

type KitLine = { product: string; quantity: string; notes?: string };

export async function POST(request: Request) {
  const { name, email, club, kitLines, message } = (await request.json()) as {
    name?: string;
    email?: string;
    club?: string;
    kitLines?: KitLine[];
    message?: string;
  };

  if (!name || !email || !Array.isArray(kitLines) || kitLines.length === 0) {
    return NextResponse.json(
      { ok: false, message: "Please provide your name, email and at least one kit item." },
      { status: 400 }
    );
  }

  const rows = kitLines
    .filter((line) => line.product && line.quantity)
    .map(
      (line) =>
        `<tr style="border-bottom:1px solid #262626">
           <td style="padding:10px 8px;color:#e5e5e5">${line.product}</td>
           <td style="padding:10px 8px;text-align:center;color:#e5e5e5">${line.quantity}</td>
           <td style="padding:10px 8px;color:#a3a3a3">${line.notes || "—"}</td>
         </tr>`
    )
    .join("");

  const result = await sendEmail({
    to: defaultContactEmail,
    subject: `APERTOS Team Kit Enquiry: ${club || name}`,
    from: supportFromEmail,
    html: wrapEmailHtml(
      `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${club ? `<p><strong>Team / Club:</strong> ${club}</p>` : ""}
        <p style="margin-top:18px;font-size:12px;letter-spacing:0.2em;color:#a3a3a3">KIT REQUEST</p>
        <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:6px">
          <thead>
            <tr style="text-align:left">
              <th style="padding:8px;font-size:11px;letter-spacing:0.15em;color:#a3a3a3">Product</th>
              <th style="padding:8px;text-align:center;font-size:11px;letter-spacing:0.15em;color:#a3a3a3">Qty</th>
              <th style="padding:8px;font-size:11px;letter-spacing:0.15em;color:#a3a3a3">Notes</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        ${message ? `<p style="margin-top:20px;line-height:1.8;color:#d4d4d4">${message.replace(/\n/g, "<br />")}</p>` : ""}
      `,
      "TEAM KIT ENQUIRY"
    )
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
