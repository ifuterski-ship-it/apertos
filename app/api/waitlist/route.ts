import { NextResponse } from "next/server";
import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const product = typeof body?.product === "string" ? body.product.trim() : "hoodie";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, message: "Please enter a valid email address." }, { status: 400 });
    }

    if (!hasSupabaseAdminEnv) {
      return NextResponse.json({ ok: true, message: "Signed up." });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("waitlist")
      .upsert({ email, product }, { onConflict: "email,product", ignoreDuplicates: true });

    if (error) {
      console.error("Waitlist insert error:", error.message);
      return NextResponse.json({ ok: false, message: "Unable to sign up right now. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }
}
