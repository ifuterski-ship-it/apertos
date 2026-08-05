import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin-auth";
import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
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

  if (!hasSupabaseAdminEnv) {
    return NextResponse.json({ ok: false, message: "Admin client not configured." }, { status: 500 });
  }

  const { sessionId } = await params;
  const admin = createAdminClient();

  const { error } = await admin
    .from("orders")
    .delete()
    .eq("stripe_checkout_session_id", sessionId);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
